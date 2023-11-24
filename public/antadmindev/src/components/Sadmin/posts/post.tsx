import request from '@/services/ant-design-pro/sadmin';
import {
  FooterToolbar,
  PageContainer,
  ProCard,
  ProForm,
  ProFormInstance,
  StepsForm,
} from '@ant-design/pro-components';
//import { PageContainer } from '@ant-design/pro-layout';
import { history, useModel, useParams, useSearchParams } from '@umijs/max';
import { App, Col, Row, Space, Tabs } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import { saConfig } from '../config';
import { SaBreadcrumbRender } from '../helpers';

import { beforeGet, beforePost, getFormFieldColumns, GetFormFields } from './formDom';
import { SaContext, saTablePros } from './table';

export interface saFormPros extends saTablePros {
  msgcls?: (value: { [key: string]: any }) => void; //提交数据后的 回调
  submitter?: string;
  showTabs?: boolean;
  align?: 'center' | 'left'; //表单对齐位置 center居中显示
  dataId?: number;
  readonly?: boolean;
  postUrl?: string; //post url 如果传入后不再使用url提交数据
  width?: number;
  afterPost?: (ret: any) => void;
  onTabChange?: (index: string) => void; //tab切换后的回调
  setting?: { [key: string]: any }; //其它配置统一放这里
}

export const SaForm: FC<saFormPros> = (props) => {
  const {
    url = '',
    postUrl,
    formColumns,
    categoryType = 'select',
    labels = {},
    tabs = [
      {
        tab: { title: '基础信息' },
        formColumns: props.formColumns ? props.formColumns : [],
      },
    ],
    msgcls = ({ code }) => {
      if (!code) {
        history.back();
      }
    },
    submitter = 'toolbar',
    paramExtra = {},
    postExtra = {},
    showTabs = true,
    align = 'center',
    editable = true, //是否可编辑 用于判断编辑状态下是否可以出现提交按钮
    readonly = false, //是否可新增 用户 添加状态下是否出现提交按钮
    dataId = 0, //用户判断是编辑还是新增，通过网络请求有一定的延迟 还是通过参数判断
    actionRef,
    pageType = 'page',
    width = 688,
    formRef = useRef<ProFormInstance<any>>({} as any),
    onTabChange,
    setting,
  } = props;
  //const url = 'posts/posts';
  //读取后台数据
  const [detail, setDetail] = useState<{ [key: string]: any } | boolean>(
    props.formProps?.initialValues ? props.formProps?.initialValues : false,
  );
  const [_formColumns, setFormColumns] = useState<any[]>([]);
  const { initialState } = useModel('@@initialState');
  //提交数据
  const post = async (base: any, callback?: (value: any) => void, then?: any) => {
    //log('post data is ', base);
    //console.log('ppst data ', base);
    const postTo = postUrl ? postUrl : url.replace('/show', '');
    if (!postTo) {
      //无url模式直接返回结构
      msgcls?.({ code: 0, data: base });
      return true;
    }

    const postBase = { ...base };
    _formColumns.map((cl) => {
      beforePost(postBase, cl);
    });

    if (props.beforePost) {
      if (props.beforePost(postBase) === false) {
        return;
      }
    }

    const ret = await request.post(postTo, {
      data: { base: { ...postExtra, ...postBase } },
      msgcls: callback ? callback : msgcls,
      then,
    });

    props.afterPost?.(ret);

    return ret;
  };

  const params = { ...useParams(), ...paramExtra };

  const [search] = useSearchParams();
  const query = search.toString();
  if (query) {
    query.split('&').map((v) => {
      let [key, value] = v.split('=');
      params[key] = value;
    });
  }
  params['*'] && delete params['*'];
  const { message } = App.useApp();
  //获取数据
  //console.log('post params', params, url);
  const get = async () => {
    // if (!url && isObj(detail) && Object.keys(detail).length == 0) {
    //   //console.log('form get no request', url, detail);
    //   return {};
    // }
    if (props.formProps?.initialValues || !url) {
      //有初始化值 则不请求后台数据
      return {};
    }
    if (!url) {
      message.error('请求链接错误');
      return {};
    }
    const { data, search } = await request.get(url, { params, drawer: pageType == 'drawer' });
    beforeGet(data);
    if (props.beforeGet) {
      props.beforeGet(data);
    }
    setDetail(data);
    return data;
  };
  useEffect(() => {
    if (!detail && url) {
      return;
    }
    const newColumns = [...tabs].map((tab) => {
      return getFormFieldColumns({
        detail,
        labels,
        initRequest: true,
        categoryType,
        columns: tab.formColumns,
        user: initialState?.currentUser,
      });
    });
    //console.log('get,data', tabs);
    setFormColumns([...newColumns]);
  }, [detail, formColumns, tabs.length]);
  //const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    if (setting?.steps_form) {
      //如果是分步表单 手动请求request
      get().then((data) => {
        //console.log('get data', data);
        formMapRef?.current?.forEach((formInstanceRef) => {
          formInstanceRef?.current?.setFieldsValue(data);
        });
      });
    }
  }, []);
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  return (
    <SaContext.Provider value={{ formRef, actionRef }}>
      {setting?.steps_form ? (
        <StepsForm
          formMapRef={formMapRef}
          onFinish={async (values) => {
            //console.log(values);
            //message.success('提交成功');
            //提交操作 让分步表单中最后一步 接管
          }}
          formProps={{
            validateMessages: {
              required: '此项为必填项',
            },
          }}
        >
          {tabs.map((cl, index) => {
            //console.log('cl', cl);
            return (
              <StepsForm.StepForm
                key={index}
                name={'step_' + index}
                title={cl.title ? cl.title : cl.tab?.title}
                onFinish={async () => {
                  //每一步都将之前的表单信息提交到url
                  let data = { step_index: index };
                  formMapRef?.current?.forEach((formInstanceRef) => {
                    data = { ...data, ...formInstanceRef?.current?.getFieldsFormatValue() };
                  });
                  return post(
                    data,
                    index + 1 == tabs.length ? undefined : () => null,
                    index + 1 == tabs.length ? undefined : () => {},
                  ).then(({ data }) => {
                    //将传回的数据又重新赋值一遍
                    formMapRef?.current?.forEach((formInstanceRef) => {
                      formInstanceRef?.current?.setFieldsValue(data);
                    });
                    return true;
                  });
                }}
                style={pageType == 'page' ? { margin: 'auto', maxWidth: width } : {}}
              >
                {_formColumns[index] ? <GetFormFields columns={_formColumns[index]} /> : null}
              </StepsForm.StepForm>
            );
          })}
        </StepsForm>
      ) : (
        <ProForm
          form={props.form}
          formRef={formRef}
          style={pageType == 'page' ? { margin: 'auto', maxWidth: width } : {}}
          //style={pageType == 'page' ? { maxWidth: 688 } : {}}
          //layout="vertical"
          //layout="horizontal"
          //labelCol={{ lg: { span: 7 }, sm: { span: 7 } }}
          //wrapperCol={{ lg: { span: 10 }, sm: { span: 17 } }}
          //initialValues={detail}
          onFinish={post}
          request={get}
          submitter={
            (!editable && dataId != 0) || (dataId == 0 && readonly) || params.readonly == 1
              ? false
              : {
                  render: (props, dom) => {
                    return submitter == 'toolbar' ? (
                      <FooterToolbar>{dom}</FooterToolbar>
                    ) : submitter == 'dom' ? (
                      dom
                    ) : (
                      <Row>
                        <Col span={7} offset={0}>
                          <Space>{dom}</Space>
                        </Col>
                      </Row>
                    );
                  },
                }
          }
          validateMessages={{
            required: '此项为必填项',
          }}
          {...props.formProps}
        >
          {showTabs ? (
            <Tabs
              defaultActiveKey="0"
              // centered={true}
              onChange={(activeKey) => {
                onTabChange?.(activeKey);
              }}
              items={_formColumns.map((cl, index) => {
                return {
                  label: tabs[index]?.title ? tabs[index]?.title : tabs[index]?.tab?.title,
                  key: index,
                  children: <GetFormFields columns={cl} />,
                  forceRender: true,
                };
              })}
            />
          ) : (
            _formColumns.map((cl, index) => {
              if (index == 0) return <GetFormFields key={index} columns={cl} />;
            })
          )}
        </ProForm>
      )}
    </SaContext.Provider>
  );
};

const PostsForm: FC<saFormPros & { match?: boolean }> = (props) => {
  //console.log('post pros',props);
  const { formTitle = '详情', match = false, path } = props;
  //console.log(value?.breadcrumb);
  return (
    <PageContainer
      title={formTitle}
      fixedHeader={saConfig.fixedHeader}
      className="saContainer"
      header={{
        breadcrumbRender: (_, dom) => {
          return <SaBreadcrumbRender match={match} path={path} />;
        },
      }}
    >
      <ProCard bordered={false}>
        <SaForm {...props} />
      </ProCard>
    </PageContainer>
  );
};

export default PostsForm;
