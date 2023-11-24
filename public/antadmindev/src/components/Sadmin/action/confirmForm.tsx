import { ProFormInstance } from '@ant-design/pro-components';
import { Button, ButtonProps } from 'antd';
import { FC, ReactNode, useContext, useRef, useState } from 'react';
import { history } from 'umi';
import { getBread, saFormColumnsType, tplComplie } from '../helpers';
import { SaForm } from '../posts/post';
import { SaContext } from '../posts/table';
import ButtonModal from './buttonModal';

interface actionConfirm {
  msg?: string;
  btn?: ButtonProps;
  method?: 'post' | 'delete';
  url?: string;
  data?: {};
  dataId?: number;
  formColumns?: saFormColumnsType;
  tabs?: Array<{ title?: string; formColumns?: saFormColumnsType }>;
  callback?: (value: any) => void;
  onChange?: (value: any) => void;
  value?: any;
  trigger?: ReactNode;
  width?: number;
  page?: string;
  readonly?: boolean;
  xkey?: string;
}

const InnerForm = (props) => {
  const {
    setOpen,
    contentRender,
    formColumns,
    tabs: utabs,
    url: ourl,
    callback,
    value,
    dataid,
    data,
    onChange,
    page,
    readonly = false,
  } = props;
  const formRef = useRef<ProFormInstance>();
  const { actionRef, formRef: topFormRef } = useContext(SaContext);

  let tabs = [];
  let url = ourl;
  if (page) {
    const bread = getBread(page);
    if (bread) {
      tabs = bread?.data.tabs;
      url = bread?.data.postUrl ? bread?.data.postUrl : bread?.data.url + '/show';
      //console.log('bread', bread);
    }
  } else {
    tabs = [{ title: '基础信息', formColumns: [...formColumns] }];
  }

  return (
    <SaForm
      tabs={tabs}
      beforeGet={(data) => {
        if (!data) {
          //没有data自动关闭弹出层
          setOpen?.(false);
        }
      }}
      formRef={formRef}
      actionRef={actionRef}
      postExtra={{ id: dataid, ...data }}
      paramExtra={{ id: dataid }}
      showTabs={false}
      formProps={{
        contentRender,
        initialValues: value,
        submitter: {
          searchConfig: {
            resetText: '关闭',
            submitText: url ? '提交' : '确定',
          },
          render: (props, doms) => {
            return readonly
              ? null
              : [
                  <Button key="rest" type="default" onClick={() => setOpen?.(false)}>
                    关闭
                  </Button>,
                  doms[1],
                ];
          },
        },
      }}
      url={url}
      postUrl={ourl ? ourl : undefined}
      align="left"
      pageType="drawer"
      msgcls={(ret) => {
        //setOpen(false);
        //console.log('finish', ret);
        const { code, data } = ret;
        if (url) {
          //有url提交
          if (!code) {
            //console.log('列表刷新 及关闭弹层');
            //console.log('confirm form has actionRef', actionRef);
            if (actionRef) {
              //在列表中 刷新列表
              //console.log('列表 reload');
              //actionRef.current?.reload();
              //设置弹出层关闭，本来会触发table重新加载数据后会关闭弹层，但是如果数据重载过慢的话，这个会感觉很卡所以在这里直接设置弹层关闭
              setOpen(false);
              callback?.(ret);
            } else if (topFormRef) {
              //console.log('in deep form and close this one');
              setOpen(false);
              callback?.(ret);
            } else {
              //在表单 中  就返回上一页
              history.back();
            }
          }
        } else {
          //无 绑定onchange事件
          //console.log('close it');
          setOpen(false);
          onChange?.(data);
        }
      }}
    />
  );
};

const ConfirmForm: FC<actionConfirm> = (props) => {
  const {
    msg = '配置信息',
    btn,
    method = 'post',
    url = '',
    data = {},
    dataId = 0,
    callback,
    formColumns = [],
    trigger,
    width = 800,
    page,
    onChange,
    readonly = false,
    xkey,
  } = props;
  //console.log('ConfirmForm props ', props);
  const defaultButton = { title: '操作', type: 'primary', danger: false, size: 'small' };
  const _btn = { ...defaultButton, ...btn };

  //const [form] = Form.useForm<{ desc: string }>();
  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   console.log('confirm modal open state is ', open, page, xkey);
  // }, [open]);

  return (
    <ButtonModal
      trigger={trigger ? trigger : <Button {..._btn}>{_btn.title}</Button>}
      open={open}
      width={width}
      title={msg}
      afterOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <InnerForm
        url={url}
        formColumns={formColumns}
        page={page}
        callback={callback}
        value={props.value}
        data={data}
        dataid={dataId}
        onChange={onChange}
        readonly={readonly}
      />
    </ButtonModal>
  );
};

export const ConfirmFormRender = (props) => {
  //console.log('confirm props', props);
  let show = true;
  if (props.if) {
    show = tplComplie(props.if, props);
  }
  return show ? <ConfirmForm dataId={props.record?.id} {...props} /> : null;
};

export default ConfirmForm;
