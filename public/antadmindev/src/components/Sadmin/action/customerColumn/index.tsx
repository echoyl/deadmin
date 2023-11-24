import { useModel } from '@umijs/max';
import {
  App,
  Badge,
  Button,
  Divider,
  Dropdown,
  Popover,
  QRCode,
  Space,
  Timeline,
  Tooltip,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { inArray } from '../../checkers';
import { parseIcon, tplComplie, uid } from '../../helpers';
import { SaContext } from '../../posts/table';
import TableFromBread from '../../tableFromBread';
import ButtonDrawer from '../buttonDrawer';
import ButtonModal from '../buttonModal';
import Confirm, { ConfirmTriggerClick } from '../confirm';
import ConfirmForm from '../confirmForm';
import Print from '../print';
import ItemsTag from './items/tag';

const CustomerColumnRender = (props) => {
  const {
    items = [],
    record: orecord,
    text,
    paramExtra = {},
    direction = 'horizontal',
    dropdown = { num: 1, text: '···' },
    type = 'table',
  } = props;
  const { initialState } = useModel('@@initialState');
  //console.log('props ', props);
  const { actionRef, formRef, columnData, url, saTableContext } = useContext(SaContext);
  const { modal } = App.useApp();
  //const formValue = formRef?.current?.getFieldsValue?.(true);
  const [record, setRecord] = useState(orecord);
  //console.log('CustomerColumnRender record is  ', orecord, !formRef.current);
  //console.log('formRef', formRef);
  useEffect(() => {
    //console.log('type is', type);
    if (type == 'form' && formRef.current && Object.keys(formRef.current).length > 0) {
      //添加一个type判断 如果多层嵌套后 formRef 的context会错乱了
      //console.log('formRef is effect', orecord);
      setRecord(formRef.current.getFieldsValue?.(true));
    } else {
      //console.log('record is effect', orecord);
      setRecord(orecord);
    }
  }, [orecord, formRef]);

  //console.log(formValue);
  const parseDom = (item: any, i) => {
    let show = true;
    const key = uid();
    //console.log('record is', record);
    if (item.if) {
      show = tplComplie(item.if, { record, user: initialState?.currentUser });
    }
    if (!show) {
      return '';
    }

    if (item.domtype == 'divider') {
      return <Divider key={i} type="vertical" />;
    } else if (item.domtype == 'timeline') {
      //处理icon
      const items = record?.[item.props?.name]?.map((it) => {
        if (it.icon) {
          it.dot = parseIcon(it.icon);
        }

        return it;
      });
      return <Timeline style={{ paddingTop: 10 }} key={i} items={items} />;
    } else if (item.domtype == 'button' || item.domtype == 'text') {
      if (item.btn) {
        //console.log('tplComplie', item, record);
        if (React.isValidElement(item.btn)) {
          return item.btn;
        }
        if (item.btn.errorLevel) {
          delete item.btn.errorLevel;
        }
        const tpl = tplComplie(item.btn.text, { record, user: initialState?.currentUser });
        if (item.domtype == 'button') {
          const icon = parseIcon(item.btn.icon);
          if (item.btn.tooltip) {
            return (
              <Tooltip title={item.btn.tooltip}>
                <Button key={key} {...item.btn} icon={icon}>
                  {tpl}
                </Button>
              </Tooltip>
            );
          } else {
            return (
              <Button key={key} {...item.btn} icon={icon}>
                {tpl}
              </Button>
            );
          }
        } else {
          if (item.btn.tooltip) {
            return <Tooltip title={item.btn.tooltip}>{tpl}</Tooltip>;
          } else {
            //console.log('i am text ', tpl, item, record);
            return tpl;
          }
        }
      } else {
        return text;
      }
    } else if (item.domtype == 'actions') {
      //console.log('actions', record);
      return <CustomerColumnRender type={type} key={i} items={record.items} record={record} />;
    } else if (item.domtype == 'qrcode') {
      //console.log('actions', record);
      if (item.btn) {
        const { text = '', size = 'small', errorLevel = 'M' } = item.btn;
        const tpl = tplComplie(text, { record });
        const sizeArr = { small: 120, middle: 160, large: 200 };
        return (
          <QRCode key={i} value={tpl} size={sizeArr[size]} errorLevel={errorLevel} bgColor="#fff" />
        );
      }
    } else if (item.domtype == 'tag') {
      //console.log('tag text', text);
      return <ItemsTag key={i} color={text?.color} title={text?.title} />;
    }
    return '';
  };
  const getItemsDom = (items) => {
    return items
      ?.map((item, i) => {
        const dom = parseDom(item, i);
        //key为固定值，之前用动态uid后导致一些bug
        const key = item.action + '.' + i;
        //console.log('dom', dom);
        if (dom === '') return '';
        if (item.action == 'confirmForm') {
          //console.log('confirmForm', record);
          const { fieldProps = {} } = item;
          const { value = {} } = fieldProps;
          const { idName = 'id' } = value;
          return (
            <ConfirmForm
              key={key}
              trigger={dom}
              msg={item.modal?.msg}
              formColumns={item.modal?.formColumns}
              page={item.modal?.page}
              url={item.request?.url}
              data={item.request?.data}
              dataId={record?.[idName]}
              {...value}
              callback={(ret) => {
                //location.reload();
                if (!ret) {
                  return;
                }
                if (!ret.code) {
                  actionRef?.current?.reload();
                  formRef?.current?.setFieldsValue?.({});
                  //formRef?.current?.resetFields();
                }
              }}
            />
          );
        } else if (item.action == 'confirm') {
          return (
            <Confirm
              key={key}
              dataId={record?.id}
              trigger={dom}
              url={item.request?.url}
              data={{ ...paramExtra, ...item.request?.data }}
              msg={item.modal?.msg}
              title={item.modal?.title}
              callback={(ret) => {
                if (!ret.code && ret.data?.ifram_url) {
                  modal.info({
                    title: ret.data?.ifram_title ? ret.data?.ifram_title : '详情',
                    width: 1000, //两边padding48px
                    content: (
                      <>
                        <iframe src={ret.data?.ifram_url} width="952" height="700" />
                      </>
                    ),
                    okText: '关闭',
                    icon: null,
                  });
                }
              }}
            />
          );
        } else if (item.action == 'print') {
          return (
            <Print
              key={key}
              dataId={record?.id}
              trigger={(click) => <div onClick={click}>{dom}</div>}
              url={item.request?.url}
              data={{ ...paramExtra, ...item.request?.data }}
              record={record}
              title={item.modal?.title}
              {...item.fieldProps?.value}
            />
          );
        } else if (item.action == 'modalTable') {
          const { fieldProps, modal } = item;
          //console.log('modalTable record', record);
          if (!fieldProps) {
            return dom;
          }

          return (
            <ButtonModal
              key={key}
              trigger={dom}
              title={modal.title}
              modalProps={{ footer: null }}
              onCancel={() => {
                actionRef.current?.reload();
              }}
            >
              <TableFromBread key={key} fieldProps={fieldProps} record={record} />
            </ButtonModal>
          );
        } else if (item.action == 'drawerTable') {
          const { fieldProps, modal } = item;
          //console.log('modalTable', fieldProps);
          if (!fieldProps) {
            return dom;
          }

          return (
            <ButtonDrawer
              key={key}
              trigger={dom}
              title={tplComplie(modal?.title, { record })}
              drawerProps={modal?.drawerProps}
            >
              <TableFromBread readonly={false} fieldProps={fieldProps} record={record} />
            </ButtonDrawer>
          );
        } else if (item.action == 'drawer') {
          return (
            <ButtonDrawer
              key={key}
              trigger={dom}
              title={tplComplie(item.modal?.title, { record })}
              drawerProps={item.modal?.drawerProps}
            >
              {item.modal?.childrenRender?.(record)}
            </ButtonDrawer>
          );
        } else if (item.action == 'dropdown') {
          const [key = 'key', label = 'label'] = item.request?.fieldNames?.split(',');
          const modelName = item.request?.modelName ? item.request?.modelName : item.request?.model;
          const items_length = columnData?.[modelName + 's']?.length;
          const dropdown_items = columnData?.[modelName + 's']?.map((v) => {
            const badge_status = v[key] ? 'success' : 'error';
            const _label =
              items_length > 2 ? v[label] : <Badge status={badge_status} text={v[label]} />;
            return { key: v[key], label: _label };
          });
          //console.log(dropdown_items, columnData, item.request);
          //如果返回的dom是text的话那么检测状态加入 badge
          //let showDom = dom;
          const selectItem = dropdown_items?.find((v) => v.key == text);
          const showDom = dom == text ? <a>{selectItem?.label}</a> : dom;

          const post_key_name = item.request?.modelName ? item.request?.modelName : 'key';
          let { url: requestUrl } = item.request;
          if (requestUrl == '{{url}}') {
            requestUrl = url;
          }
          return (
            <Dropdown
              key={key}
              trigger={['click']}
              menu={{
                items: dropdown_items,
                onClick: (event) => {
                  //console.log(event.item);
                  const clickItem = dropdown_items.find((v) => v.key == event.key);
                  ConfirmTriggerClick(
                    {
                      data: { [post_key_name]: event.key, ...item.request?.data },
                      url: requestUrl,
                      dataId: record.id,
                      msg: (
                        <Space>
                          确定要执行
                          <span style={{ color: 'red' }}>{clickItem?.label}</span>
                          操作吗？
                        </Space>
                      ),
                    },
                    modal,
                    actionRef,
                  );
                },
              }}
              arrow
            >
              {showDom}
            </Dropdown>
          );
        } else if (item.action == 'popover') {
          //检测弹出的类型
          let popcontent = null;
          if (item.popover?.type == 'qrcode') {
            const {
              content = '',
              size = 'small',
              errorLevel = 'M',
              bordered = false,
            } = item.popover;
            const tpl = tplComplie(content, { record });
            const sizeArr = { small: 120, middle: 160, large: 200 };
            popcontent = (
              <QRCode
                key={key}
                value={tpl}
                size={sizeArr[size]}
                errorLevel={errorLevel}
                bgColor="#fff"
                bordered={bordered}
              />
            );
          } else {
            popcontent = item.popover?.content;
          }
          return (
            <Popover key={key} content={popcontent} trigger="click">
              {dom}
            </Popover>
          );
        } else if (inArray(item.action, ['edit', 'delete', 'view']) > -1) {
          const xkey = key + '_' + item.action;
          return dom
            ? React.cloneElement(dom, {
                key: xkey,
                onClick: async (e: any) => {
                  saTableContext?.[item.action](record);
                },
              })
            : null;
        } else {
          return dom;
        }
      })
      .filter((v) => v);
  };
  //dropdown的设置 num 表示预留几个直接出现 text-显示的文字
  const itemsDom = getItemsDom(items);
  return direction == 'dropdown' ? (
    dropdown.num ? (
      <Space>
        {itemsDom.filter((v, i) => i < dropdown.num)}
        {itemsDom.length > dropdown.num ? (
          <Dropdown
            trigger="click"
            menu={{
              items: itemsDom
                .filter((v, i) => i >= dropdown.num)
                .map((v, i) => {
                  return { label: v, key: i };
                }),
            }}
          >
            <a onClick={(e) => e.preventDefault()}>{dropdown.text ? dropdown.text : '···'}</a>
          </Dropdown>
        ) : null}
      </Space>
    ) : itemsDom.legnth ? (
      <Dropdown
        trigger="click"
        menu={{
          items: itemsDom.map((v, i) => {
            return { label: v, key: i };
          }),
        }}
      >
        <a onClick={(e) => e.preventDefault()}>{dropdown.text ? dropdown.text : '···'}</a>
      </Dropdown>
    ) : null
  ) : (
    <Space direction={direction}>{itemsDom}</Space>
  );
};
export const CustomerColumnRenderTable = (text, props) => {
  const { fieldProps, record } = props;
  const { items } = fieldProps;
  console.log('CustomerColumnRenderTable render', fieldProps);
  //const [formValue, setFormValue] = useState();
  //const { formRef } = useContext(SaContext);
  // if (!record) {
  //   const formValue = formRef?.current?.getFieldsValue?.(true);
  // } else {

  // }

  //console.log('formRef', formRef, props);
  // useEffect(() => {
  //   if (!record && formRef.current) {
  //     setTimeout(() => {
  //       setFormValue(formRef.current.getFieldsValue());
  //     }, 500);
  //   }
  // }, []);
  //console.log(formRef, formValue);
  return <CustomerColumnRender {...fieldProps} record={record ? record : false} text={text} />;
};

export default CustomerColumnRender;
