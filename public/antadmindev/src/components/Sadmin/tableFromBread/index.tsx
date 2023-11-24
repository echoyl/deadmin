import { isUndefined } from 'lodash';
import React, { FC, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isBool } from '../checkers';
import { getBread, tplComplie } from '../helpers';
import SaTable, { SaContext } from '../posts/table';

const TableFromBread: FC<{
  fieldProps?: any;
  record?: any;
  readonly?: string | boolean; //支持条件判断
  alwaysenable?: boolean; //是否一直可用 默认false 当是表单是 如果无主数据表格不会展示，true 都会展示
}> = (props) => {
  const { fieldProps, readonly, record: orecord, alwaysenable = false } = props;
  //console.log('fieldProps', fieldProps);
  const { formRef } = useContext(SaContext);
  //在form中渲染 必须是readonly 所以用formRef 获取当前表单的所有值
  const record = orecord ? orecord : formRef?.current?.getFieldsValue?.(true);
  let readonlyProps = {};
  if (isUndefined(readonly)) {
    //如果未传参数 那么通过已设定的path菜单的设置
  } else {
    const readonly_result = isBool(readonly) ? readonly : tplComplie(readonly, { record });
    readonlyProps = readonly_result
      ? { addable: false, editable: false, deleteable: false, checkEnable: false }
      : { addable: true, editable: true, deleteable: true, checkEnable: true };
    //console.log('readonlyProps is', readonly_result, readonlyProps, readonly, record);
  }
  const post_key = record?.[fieldProps.local_key] ? record?.[fieldProps.local_key] : 0;

  const bread = getBread(fieldProps.path);
  //console.log('fieldProps.props is', JSON.stringify(fieldProps.props));
  if (bread) {
    const { data: v_data } = bread;
    fieldProps.props = {
      ...fieldProps.props,
      ...v_data,
      ...readonlyProps,
      //paramExtra: { [fieldProps.foreign_key]: post_key },
      postExtra: { [fieldProps.foreign_key]: post_key },
    };
    //log('saformtabolex', v);
  }

  const paramExtra = { ...fieldProps.props?.paramExtra, [fieldProps.foreign_key]: post_key };
  fieldProps.props.paramExtra = paramExtra;

  //以下是点击table的checkbox后需要将里面的toolbar栏展示到外面 直接用usestate后会报错，使用和buttonDrawer中参考drawerForm组件一样的设置
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [, forceUpdate] = useState([]);
  const footerDomRef: React.RefCallback<HTMLDivElement> = useCallback((element) => {
    if (footerRef.current === null && element) {
      forceUpdate([]);
    }
    footerRef.current = element;
  }, []);
  const contentRender = useCallback((submitter: any) => {
    return (
      <>
        {footerRef.current && submitter ? (
          <React.Fragment key="submitter">
            {createPortal(<div>{submitter}</div>, footerRef.current)}
          </React.Fragment>
        ) : (
          submitter
        )}
      </>
    );
  }, []);
  //console.log('alwaysenable', props, alwaysenable, post_key);
  return !alwaysenable && !post_key ? (
    '-'
  ) : (
    <>
      <SaTable
        pageType="drawer"
        openType="drawer"
        name={fieldProps.name}
        tableTitle={fieldProps.name}
        selectRowRender={(dom) => {
          return contentRender?.(dom);
        }}
        {...fieldProps.props}
        tableProps={{
          scroll: { y: 400 },
          size: 'small',
          className: 'sa-modal-table sa-form-table',
          ...fieldProps.props.tableProps,
        }}
        //readonly={readonly}
      />
      <div
        ref={footerDomRef}
        style={{
          padding: '0 24px',
        }}
      />
    </>
  );
};
export const tableFromBreadRender = (text, props) => {
  //console.log('saFormTable here', props);
  const { fieldProps } = props;

  return (
    <TableFromBread
      alwaysenable={fieldProps.alwaysenable}
      fieldProps={{ ...fieldProps, props: { tableProps: { search: false } } }}
      readonly={fieldProps.readonly}
    />
  );
};
export default TableFromBread;
