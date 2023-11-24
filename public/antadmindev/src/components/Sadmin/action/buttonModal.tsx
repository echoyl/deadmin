import { Modal, ModalProps } from 'antd';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
interface actionConfirm {
  trigger?: JSX.Element;
  title?: string;
  open?: boolean;
  onOk?: () => void;
  width?: number;
  modalProps?: ModalProps;
  children?: ReactNode;
  confirmLoading?: boolean;
  afterOpenChange?: (open: boolean) => void;
}

const ButtonModal: FC<actionConfirm> = (props) => {
  //const [open, setOpen] = useState(false);
  const {
    trigger,
    title = '弹层',
    open = false,
    onOk,
    width = 1200,
    modalProps,
    afterOpenChange,
    confirmLoading = false,
  } = props;
  const [iopen, setOpen] = useState(open);
  //下面这段参考 drawerForm组件
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [, forceUpdate] = useState([]);
  const footerDomRef: React.RefCallback<HTMLDivElement> = useCallback((element) => {
    if (footerRef.current === null && element) {
      forceUpdate([]);
    }
    footerRef.current = element;
  }, []);
  const contentRender = useCallback((items, submitter: any) => {
    return (
      <>
        {items}
        {footerRef.current && submitter ? (
          <React.Fragment key="submitter">
            {createPortal(
              <div style={{ padding: '8px 16px' }}>{submitter}</div>,
              footerRef.current,
            )}
          </React.Fragment>
        ) : (
          submitter
        )}
      </>
    );
  }, []);

  const triggerDom = useMemo(() => {
    if (!trigger) {
      return null;
    }

    return React.cloneElement(trigger, {
      key: 'trigger',
      ...trigger.props,
      onClick: async (e: any) => {
        setOpen(!iopen);
        trigger.props?.onClick?.(e);
      },
    });
  }, [setOpen, trigger, iopen]);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  useEffect(() => {
    afterOpenChange?.(iopen);
  }, [iopen]);

  const close = () => {
    setOpen(false);
  };
  return (
    <>
      {triggerDom}
      <Modal
        open={iopen}
        onOk={async () => {
          if (onOk) {
            onOk();
          } else {
            close();
          }
        }}
        onCancel={() => {
          close();
        }}
        width={width}
        title={title}
        {...modalProps}
        centered={true}
        destroyOnClose={true}
        confirmLoading={confirmLoading}
        footer={
          <div
            ref={footerDomRef}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          />
        }
        maskClosable={false}
        styles={{ body: { maxHeight: 650, overflowY: 'auto' } }}
      >
        {iopen &&
          React.Children.map(props.children, (c) => {
            return React.cloneElement(c, { setOpen, contentRender });
          })}
      </Modal>
    </>
  );
};
// export const ConfirmConfig:FC = (props) => {
//   return
// }

export default ButtonModal;
