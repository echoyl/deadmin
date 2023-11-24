import request, { getFullUrl, requestHeaders } from '@/services/ant-design-pro/sadmin';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LoadingOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type {
  ActionType,
  ProFormInstance,
  ProFormProps,
  ProTableProps,
} from '@ant-design/pro-components';
import { FooterToolbar, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, Link, history, useModel, useSearchParams } from '@umijs/max';
import { App, Button, Space, Upload } from 'antd';
import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import ButtonDrawer from '../action/buttonDrawer';
import ButtonModal from '../action/buttonModal';
import CustomerColumnRender from '../action/customerColumn';
import { isArr, isFn, isObj, isStr, isUndefined } from '../checkers';
//import _ from 'underscore';
import {
  getFromObject,
  isJsonString,
  saFormColumnsType,
  saTableColumnsType,
  search2Obj,
} from '../helpers';
import { EditableCell, EditableRow } from './editable';
import { SaForm } from './post';
import './style.less';
import { getTableColumns } from './tableColumns';
export interface saTablePros {
  url?: string;
  name?: string;
  level?: number;
  tableColumns?: saTableColumnsType | ((value: any) => saTableColumnsType);
  formColumns?: saFormColumnsType | ((value: any) => saFormColumnsType);
  toolBar?: (value: any) => void;
  openType?: 'page' | 'drawer' | 'modal';
  openWidth?: number;
  categoryType?: 'select' | 'cascader';
  tableTitle?: string | boolean;
  formTitle?: string | boolean;
  labels?: Record<string, any>;
  beforePost?: (value: any) => void | boolean;
  beforeGet?: (value: any) => void;
  beforeTableGet?: (value: any) => void;
  tableProps?: ProTableProps;
  tabs?: Array<{ title?: string; formColumns?: saFormColumnsType }>;
  /**
   * 删除操作时 弹出提示数据所展示的字段
   */
  titleField?: string | Array<string>;
  formProps?: ProFormProps;
  //左侧分类菜单的 配置信息
  leftMenu?: { name?: string; url_name?: string; field?: Object; title?: string };
  categorysName?: string;
  //table组件 toolbar中menu 请求和url中参数name
  table_menu_key?: string; //列表头部tab切换读取的数据字段名称
  table_menu_all?: boolean; //tab 是否需要自动加入全部选项
  table_menu_default?: string; //默认的tab值
  //actionRef 实例
  actionRef?: Object;
  //表单实例
  formRef?: ProFormInstance;
  pageType?: 'page' | 'drawer'; //table页面是page还是在弹出层中
  rowOnSelected?: any; //当列表checkbox被点击时触发事件
  paramExtra?: { [key: string]: any }; //后台其它设置中添加的请求额外参数，table request的时候会带上这些参数
  postExtra?: { [key: string]: any }; //表单提交时 额外传输的数据 不放在base中
  addable?: boolean; //是否可以新建 控制显示新建按钮
  editable?: boolean; //form打开后没有底部提交按钮
  deleteable?: boolean; //table中是否可以删除数据
  path?: string; //当前页面的路径
  checkEnable?: boolean; //数据是否可以check
  toolBarButton?: Array<{ title?: string; valueType?: string; [key: string]: any }>; //操作栏按钮设置
  selectRowRender?: (rowdom: any) => void | boolean;
  selectRowBtns?: Array<{ [key: string]: any }>;
}

const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
};

interface saTableContextProps {
  edit: (...record: Array<{ [key: string]: any }>) => void;
  view: (id: any) => void;
  delete: (id: any) => void;
}

export const SaContext = createContext<{
  actionRef?: any;
  formRef?: any;
  columnData?: { [key: string]: any };
  url?: string;
  saTableContext?: saTableContextProps;
  searchFormRef?: any;
}>({});

const SaTable: React.FC<saTablePros> = (props) => {
  const {
    name,
    url = '',
    //tableColumns = [],
    level = 1,
    //formColumns,
    tableColumns = [],
    toolBar,
    openType = 'page',
    openWidth = props.openType == 'drawer' ? 754 : 754,
    formColumns = [],
    tabs,
    categoryType = 'select',
    labels = {},
    beforeTableGet,
    titleField = 'title',
    table_menu_key,
    table_menu_all = true,
    table_menu_default = '',
    pageType = 'page',
    paramExtra = {},
    postExtra = {},
    addable = true,
    editable = true,
    deleteable = true,
    path,
    checkEnable = true,
    actionRef = useRef<ActionType>(),
    toolBarButton = [],
    tableTitle = '列表',
    selectRowRender,
    selectRowBtns = [],
    formRef = useRef<ProFormInstance>(),
  } = props;
  //console.log('tableprops', props);
  const [enums, setEnums] = useState({ categorys: [] });
  const [summary, setSummary] = useState();
  const [columnData, setColumnData] = useState({});
  const [data, setData] = useState([]);
  const [initRequest, setInitRequest] = useState(false);
  //const url = 'posts/posts';
  const [selectedRowsState, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  //const actionRef = props.actionRef ? props.actionRef : useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const searchFormRef = useRef<ProFormInstance>();
  const [currentRow, setCurrentRow] = useState({});

  const [searchParams, setUrlSearch] = useSearchParams();

  const [tableMenu, setTableMenu] = useState<[{ [key: string]: any }]>();
  const searchTableMenuId =
    table_menu_key && pageType == 'page' ? searchParams.get(table_menu_key) : '';
  //console.log('searchTableMenuId', searchTableMenuId, searchParams.get(table_menu_key));
  const [tableMenuId, setTableMenuId] = useState<string>(
    searchTableMenuId ? searchTableMenuId : table_menu_default,
  );
  const _tableColumns = isFn(tableColumns) ? tableColumns([]) : [...tableColumns];
  const enumNames = _tableColumns?.filter((v) => v.valueEnum).map((v) => v.dataIndex);
  const search_config = _tableColumns?.filter(
    (v) => isObj(v) && (isUndefined(v.search) || v.search),
  );

  const { initialState } = useModel('@@initialState');
  const { message } = App.useApp();
  // const [enumNames, setEnumNames] = useState<any[]>([]);
  // const [search_config, setSearch_config] = useState<any[]>([]);
  const rq = async (params = {}, sort: any, filter: any) => {
    for (let i in params) {
      if (typeof params[i] == 'object') {
        params[i] = JSON.stringify(params[i]);
      }
    }
    const ret = await request.get(url, { params: { ...params, sort, filter } });
    if (!ret) {
      return;
    }
    //console.log('request to', url, params);
    if (beforeTableGet) {
      //console.log('beforeTableGet');
      beforeTableGet(ret);
    }
    //data = ret.data;
    if (ret.search.summary) {
      setSummary(ret.search.summary);
    }
    if (!initRequest) {
      setEnums({ ...ret.search });

      setColumnData({ ...ret.search }); //做成context 换一个名字
    }

    //log('setEnums', ret.search);
    //获取分类父级路径

    !initRequest && setInitRequest(true);
    if (ret.search?.table_menu && !initRequest && table_menu_key) {
      if (table_menu_all) {
        setTableMenu([{ label: '全部', value: 'all' }, ...ret.search.table_menu[table_menu_key]]);
      } else {
        setTableMenu(ret.search.table_menu[table_menu_key]);
        //不再需要默认设置第一个菜单的id了，需要自己在后端实现 未传参数是默认读取第一个参数 (会产生两次请求)
        // const first_value = ret.search.table_menu[table_menu_key][0]['value'];
        // console.log(tableMenuId, first_value, table_menu_default);
        // if (
        //   (!table_menu_default && !tableMenuId) ||
        //   (tableMenuId != first_value && table_menu_default && tableMenuId != table_menu_default)
        // ) {
        //   ret.data = [];
        //   setTableMenuId(first_value);
        // }
      }
      //如果后端传了tab id 那么主动重新设置一次
      if (ret.search?.table_menu_id) {
        console.log('server set table_menu_id', ret.search?.table_menu_id);
        setTableMenuId(ret.search?.table_menu_id);
      }
    }
    setData([...ret.data]);
    return Promise.resolve({ data: ret.data, success: ret.success, total: ret.total });
  };

  const post = async (base: any, extra: any) => {
    return await request.post(url, {
      data: { base: { ...base }, ...extra },
    });
  };
  const { modal } = App.useApp();
  const remove = (id, msg: string) => {
    const modals = modal.confirm({
      title: '温馨提示！',
      content: msg,
      onOk: async () => {
        const ret = await request.delete(url + '/1', {
          data: { id },
        });
        modals.destroy();
        if (!ret.code) {
          actionRef.current?.reload();
          setSelectedRows([]);
          setSelectedRowKeys([]);
        }
      },
    });
  };

  const switchState = (id, msg: string, val: string) => {
    const modals = modal.confirm({
      title: '温馨提示！',
      content: msg,
      onOk: async () => {
        const ret = await request.post(url, {
          data: { id, state: val, actype: 'state' },
        });
        modals.destroy();
        if (!ret.code) {
          actionRef.current?.reload();
          setSelectedRows([]);
          setSelectedRowKeys([]);
        }
      },
    });
  };

  //导出按钮
  const [exportLoading, setExportLoading] = useState<Array<boolean>>(
    toolBarButton?.map((v) => false),
  );
  const exportButton = ({ title = '导出', fieldProps = { post: {} } }, index) => (
    <Button
      key="exportButton"
      icon={<DownloadOutlined />}
      loading={exportLoading[index]}
      onClick={async () => {
        setButtonLoading(index, true);
        console.log('exportLoading', exportLoading);
        const { post = {} } = fieldProps;
        const values = searchFormRef?.current?.getFieldsFormatValue();
        if (table_menu_key) {
          values[table_menu_key] = tableMenuId;
        }
        await request.post(url + '/export', { data: { ...values, ...paramExtra, ...post } });
        setButtonLoading(index, false);
      }}
    >
      {title}
    </Button>
  );
  //导入按钮
  const uploadProps = {
    name: 'file',
    action: getFullUrl(url + '/import'),
    headers: requestHeaders(),
    itemRender: () => '',
  };
  const setButtonLoading = (index: number, flag: boolean) => {
    exportLoading[index] = flag;
    setExportLoading([...exportLoading]);
  };
  const importButton = ({ title = '导入' }, index: number) => (
    <Upload
      key="importButton"
      {...uploadProps}
      onChange={(info) => {
        setButtonLoading(index, true);
        if (info.file.status !== 'uploading') {
          //console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          //console.log('donenenene');
          setButtonLoading(index, false);
          const { code, msg, data } = info.file.response;
          if (!code) {
            //设置预览图片路径未服务器路径
            message.success(`${info.file.name} ${msg}`);
            actionRef.current?.reload();
          } else {
            //上传失败了
            message.error(msg);
          }
        } else if (info.file.status === 'error') {
          setButtonLoading(index, false);
          message.error(`${info.file.name} file upload failed.`);
        }
      }}
    >
      <Button icon={exportLoading[index] ? <LoadingOutlined /> : <UploadOutlined />}>
        {title}
      </Button>
    </Upload>
  );

  const toolBarRender = () => {
    const btns = [];
    if (addable) {
      if (openType == 'drawer' || openType == 'modal') {
        btns.push(
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow({ id: 0 });
              handleModalVisible(true);
            }}
          >
            <Space>
              <PlusOutlined />
              <FormattedMessage id="pages.searchTable.new" />
            </Space>
          </Button>,
        );
      } else {
        btns.push(
          <Link key="add" to={path ? path + '/0' : './0'}>
            <Button type="primary" key="primary">
              <Space>
                <PlusOutlined />
                <FormattedMessage id="pages.searchTable.new" />
              </Space>
            </Button>
          </Link>,
        );
      }
    }
    toolBarButton?.forEach((btn, index) => {
      //console.log('btn', btn);

      if (btn.valueType == 'export') {
        btns.push(exportButton(btn, index));
      }
      if (btn.valueType == 'import') {
        btns.push(importButton(btn, index));
      }
      if (btn.valueType == 'toolbar') {
        btns.push(<CustomerColumnRender items={btn.fieldProps?.items} paramExtra={paramExtra} />);
      }
    });
    typeof toolBar == 'function' && btns.push(toolBar({ data, enums }));
    return btns;
  };

  const rowNode = useMemo(() => {
    if (selectedRowsState.length <= 0) return undefined;
    return (
      <ToolBarDom
        key="table_row_select_bar"
        btns={enums.states}
        selectRowBtns={selectRowBtns}
        selectedRowsState={selectedRowsState}
        remove={remove}
        switchState={switchState}
        deleteable={deleteable}
      />
    );
  }, [selectedRowsState, enums]);

  const rowDom = useMemo(() => {
    if (selectRowRender) {
      //console.log('now rownode', rowNode);
      return selectRowRender(rowNode);
    }
    return undefined;
  }, [selectRowRender, rowNode]);

  //封装操作方法到context中
  const saTableContext = {
    edit: (record: any, ext: any) => {
      if (openType == 'drawer' || openType == 'modal') {
        setCurrentRow({ id: record.id, ...ext });
        handleModalVisible(true);
      } else {
        history.push(path + '/' + record?.id);
      }
    },
    view: (record: any) => {
      if (openType == 'drawer' || openType == 'modal') {
        setCurrentRow({ id: record.id, readonly: true });
        handleModalVisible(true);
      } else {
        history.push(path + '/' + record?.id + '?readonly=1');
      }
    },
    delete: (record: any) => {
      const title = Array.isArray(titleField)
        ? getFromObject(record, titleField)
        : record[titleField];
      console.log(title);
      remove(record.id, '确定要删除：' + (title ? title : '该条记录吗？'));
    },
  };

  return (
    <SaContext.Provider
      value={{ actionRef, searchFormRef, formRef, columnData, url, saTableContext }}
    >
      <>
        <ProTable
          components={components}
          className="sa-pro-table"
          rowClassName={() => 'editable-row'}
          actionRef={actionRef}
          // onLoad={() => {
          //   console.log('i am reload ', url);
          //   return false;
          // }}
          params={{
            ...paramExtra,
            ...(table_menu_key ? { [table_menu_key]: tableMenuId } : {}),
          }}
          columns={getTableColumns({
            setData,
            data,
            post,
            categoryType,
            enums,
            initRequest,
            openType,
            columns: tableColumns,
            labels,
            level,
            actionRef,
            path,
            editable,
            deleteable,
            initialState,
            message,
          })}
          request={rq}
          formRef={searchFormRef}
          search={
            search_config.length > 0
              ? { span: 6, className: 'posts-table posts-table-' + pageType, labelWidth: 'auto' }
              : false
          }
          revalidateOnFocus={false}
          form={
            pageType != 'page'
              ? false
              : {
                  ignoreRules: false,
                  syncToInitialValues: false,
                  syncToUrl: (values, type) => {
                    //console.log('syncToUrl', values, type);
                    if (pageType != 'page') {
                      //只有在页面显示的table 搜索数据才会同步到url中

                      return false;
                    }
                    if (type === 'get') {
                      // let pca = [];
                      // if (values.province) {
                      //   pca.push(parseInt(values.province));
                      // }
                      // if (values.city) {
                      //   pca.push(parseInt(values.city));
                      // }
                      // if (values.area) {
                      //   pca.push(parseInt(values.area));
                      // }
                      //console.log('table values', values);
                      for (var i in values) {
                        if (/^\d+$/.test(values[i])) {
                          if (!enumNames || enumNames.findIndex((v) => v == i) < 0) {
                            //如果长度过长 那应该不是数字不要格式化它
                            if (values[i].length <= 8) {
                              values[i] = parseInt(values[i]);
                            }
                          }
                        }
                      }
                      for (var i in values) {
                        if (isJsonString(values[i])) {
                          let jval = JSON.parse(values[i]);
                          // if (!Array.isArray(jval)) {
                          //   values[i] = jval;
                          // }
                          values[i] = jval;
                        } else {
                          //检测 是否是逗号拼接的数组
                          if (isStr(values[i]) && values[i].indexOf(',') > -1) {
                            values[i] = values[i].split(',');
                          }
                          if (isArr(values[i])) {
                            //数组的话检测里面的数据是否是数字，系统会默认将同一名字的query参数整合到数组中 并且数字变成了字符串
                            values[i] = values[i].map((v) => {
                              if (isStr(v) && /^\d+$/.test(v)) {
                                v = parseInt(v);
                              }
                              return v;
                            });
                          }
                        }
                      }
                      //console.log('table format values is', values);
                      const ret = { ...values };
                      // if (values.startTime || values.endTime) {
                      //   ret.created_at = [values.startTime, values.endTime];
                      // }
                      //log('GET', values);
                      return ret;
                    }
                    //console.log('syncToUrl old', values);
                    // if (category_id) {
                    //   values.category_id = category_id.length > 0 ? JSON.stringify(category_id) : '';
                    // }

                    for (var i in values) {
                      if (typeof values[i] == 'object') {
                        values[i] = JSON.stringify(values[i]);
                        // if (!Array.isArray(values[i])) {
                        //   console.log(i, 'is not array should be stringify');
                        //   values[i] = JSON.stringify(values[i]);
                        // } else {
                        //   //array data should be joined by string ,
                        //   values[i] = values[i].join(',');
                        // }
                      }
                    }
                    return values;
                  },
                }
          }
          toolBarRender={toolBarRender}
          rowSelection={
            !checkEnable
              ? false
              : {
                  selectedRowKeys,
                  onChange: (newSelectedRowKeys, selectedRows) => {
                    setSelectedRows(selectedRows);
                    setSelectedRowKeys(newSelectedRowKeys);
                  },
                }
          }
          toolbar={
            tableMenu
              ? {
                  menu: {
                    type: 'tab',
                    activeKey: tableMenuId,
                    items: tableMenu?.map((v) => ({ label: v.label, key: v.value + '' })),
                    onChange: (key) => {
                      setTableMenuId(key as string);
                      if (pageType == 'page') {
                        let url_search = search2Obj();
                        //return;
                        url_search[table_menu_key] = key;
                        setUrlSearch(url_search);
                      }
                    },
                  },
                }
              : { title: tableTitle ? tableTitle : '列表' }
          }
          tableAlertRender={false}
          summary={(data) => {
            return summary ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  dangerouslySetInnerHTML={{ __html: summary }}
                ></td>
              </tr>
            ) : null;
          }}
          scroll={{ x: 900 }}
          pagination={{
            showSizeChanger: true,
          }}
          {...props.tableProps}
          rowKey="id"
        />
        {openType == 'modal' && (
          <ButtonModal
            open={createModalVisible}
            title={
              (currentRow.id ? (currentRow.readonly ? '查看' : '编辑') : '新增') +
              (name ? ' - ' + name : '')
            }
            width={openWidth}
            afterOpenChange={(open) => {
              handleModalVisible(open);
            }}
          >
            <InnerForm
              {...props}
              formColumns={formColumns}
              url={url + '/show'}
              currentRow={currentRow}
              paramExtra={paramExtra}
              tabs={tabs}
              postExtra={postExtra}
              editable={editable}
              addable={addable}
            />
          </ButtonModal>
        )}
        {openType == 'drawer' && (
          <ButtonDrawer
            open={createModalVisible}
            title={
              (currentRow.id ? (currentRow.readonly ? '查看' : '编辑') : '新增') +
              (name ? ' - ' + name : '')
            }
            width={openWidth}
            afterOpenChange={(open) => {
              handleModalVisible(open);
            }}
          >
            <InnerForm
              {...props}
              formColumns={formColumns}
              url={url + '/show'}
              currentRow={currentRow}
              paramExtra={paramExtra}
              tabs={tabs}
              postExtra={postExtra}
              editable={editable}
              addable={addable}
            />
          </ButtonDrawer>
        )}

        {pageType == 'page' && rowNode && <FooterToolbar>{rowNode}</FooterToolbar>}
        {rowDom}
      </>
    </SaContext.Provider>
  );
};

const InnerForm = (props) => {
  const {
    setOpen,
    contentRender,
    formColumns,
    url,
    currentRow,
    paramExtra,
    tabs,
    postExtra,
    addable,
    editable,
  } = props;
  const { actionRef, formRef } = useContext(SaContext);
  return (
    <SaForm
      {...props}
      msgcls={({ code }) => {
        if (!code) {
          actionRef.current?.reload();
          //设置弹出层关闭，本来会触发table重新加载数据后会关闭弹层，但是如果数据重载过慢的话，这个会感觉很卡所以在这里直接设置弹层关闭
          setOpen(false);
          return;
        }
      }}
      beforeGet={(data) => {
        if (!data) {
          //没有data自动关闭弹出层
          setOpen?.(false);
        }
      }}
      formColumns={formColumns}
      tabs={tabs}
      formRef={formRef}
      actionRef={actionRef}
      paramExtra={{ ...currentRow, ...paramExtra }}
      postExtra={{ ...currentRow, ...postExtra }}
      url={url}
      showTabs={false}
      formProps={{
        contentRender,
        submitter:
          (!editable && currentRow.id) ||
          (currentRow.readonly && currentRow.id) ||
          (!currentRow.id && !addable)
            ? false
            : {
                //移除默认的重置按钮，点击重置按钮后会重新请求一次request
                render: (props, doms) => {
                  return [
                    <Button key="rest" type="default" onClick={() => setOpen?.(false)}>
                      关闭
                    </Button>,
                    doms[1],
                  ];
                },
              },
      }}
      align="left"
      dataId={currentRow.id}
      pageType="drawer"
    />
  );
};

export const ToolBarDom = (props) => {
  const {
    btns,
    selectedRowsState,
    selectRowBtns = [],
    remove,
    switchState,
    deleteable = true,
  } = props;
  //log('props.btns', btns);
  let n_btns = [];
  if (isObj(btns)) {
    if (!Array.isArray(btns)) {
      n_btns = [
        { label: '禁用', value: 0 },
        { label: '启用', value: 1 },
      ];
    } else {
      n_btns = btns;
    }
  }
  const selectedIds = selectedRowsState.map((item) => item.id);

  return (
    <Space>
      <Space>
        <span>选择</span>
        <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>
        <span>项</span>
      </Space>
      {n_btns?.map((stateButton, k) => {
        return (
          <Button
            key={'state_' + k}
            size="small"
            icon={k == 0 ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            type={k == 0 ? 'dashed' : 'primary'}
            danger={k == 0 ? true : false}
            onClick={async () => {
              //console.log(selectedRowsState);
              //await handleRemove(selectedRowsState);

              switchState(
                selectedIds,
                '确定要' + stateButton.label + ':' + selectedRowsState.length + '条记录吗？',
                stateButton.value,
              );
            }}
          >
            批量{stateButton.label}
          </Button>
        );
      })}
      {selectRowBtns.length > 0 ? (
        <CustomerColumnRender
          key="selectRowBtns"
          items={selectRowBtns}
          paramExtra={{ ids: selectedIds }}
          record={{ ids: selectedIds }}
        />
      ) : null}
      {deleteable ? (
        <Button
          danger
          type="primary"
          size="small"
          icon={<DeleteOutlined />}
          onClick={async () => {
            //console.log(selectedRowsState);
            //await handleRemove(selectedRowsState);

            remove(selectedIds, '确定要删除:' + selectedRowsState.length + '条记录吗？');
          }}
        >
          批量删除
        </Button>
      ) : null}
    </Space>
  );
};

export default SaTable;
