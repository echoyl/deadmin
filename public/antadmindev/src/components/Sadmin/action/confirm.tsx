import request from '@/services/ant-design-pro/sadmin';
import { App, Button, ButtonProps } from 'antd';
import React, { FC, useContext, useMemo } from 'react';
import { SaContext } from '../posts/table';

interface actionConfirm {
  msg?: string;
  btn?: ButtonProps;
  method?: 'post' | 'delete';
  url?: string;
  data?: {};
  dataId?: number;
  callback?: (value: any) => void;
  //trigger?: (value: any) => ReactNode;
  trigger?: JSX.Element;
  title?: string;
}

export const ConfirmTriggerClick = (props, modal, actionRef, searchFormRef) => {
  const { msg, method = 'post', url = '', data = {}, dataId = 0, callback, title } = props;
  const values = searchFormRef?.current?.getFieldsFormatValue();
  const m = modal.confirm({
    title: title ? title : '温馨提示！',
    content: msg,
    onOk: async () => {
      const ret = await request[method](url, {
        data: { ...data, id: dataId, ...values },
      });
      m.destroy();

      if (callback) {
        callback(ret);
      }
      if (!ret) {
        return;
      }
      //加入默认的回调动作
      if (!ret.code) {
        //后台传值后 支持 1.本地storage信息写入 2.页面是否跳转
        if (ret.data?.setStorage) {
          for (let name in ret.data.setStorage) {
            localStorage.setItem(name, ret.data.setStorage[name]);
          }
        }
        if (ret.data?.redirect) {
          window.open(ret.data.redirect.url, ret.data.redirect.type);
        } else {
          //不跳转链接就刷新页面
          if (actionRef?.current) {
            actionRef.current?.reload();
          } else {
            history.back();
          }
        }
      }
      // if (!ret.code) {
      //   actionRef.current?.reload();
      //   setSelectedRows([]);
      //   setSelectedRowKeys([]);
      // }
    },
  });
};

const Confirm: FC<actionConfirm> = (props) => {
  const { btn = { title: '操作', type: 'primary', danger: false }, trigger } = props;
  const { modal } = App.useApp();
  const { actionRef, searchFormRef } = useContext(SaContext);
  const click = () => {
    ConfirmTriggerClick(props, modal, actionRef, searchFormRef);
  };

  const triggerDom = useMemo(() => {
    if (!trigger) {
      return null;
    }

    return React.cloneElement(trigger, {
      key: 'trigger',
      ...trigger.props,
      onClick: async (e: any) => {
        click();
        trigger.props?.onClick?.(e);
      },
    });
  }, [trigger]);

  return trigger ? (
    <>{triggerDom}</>
  ) : (
    <Button size="small" onClick={click} type={btn.type} danger={btn.danger}>
      {btn.title}
    </Button>
  );
};
// export const ConfirmConfig:FC = (props) => {
//   return
// }

export const ConfirmRender = (text, props) => {
  //log('confirm props', props.fieldProps);
  return <Confirm {...props.fieldProps} dataId={props.record.id} />;
};

export default Confirm;
