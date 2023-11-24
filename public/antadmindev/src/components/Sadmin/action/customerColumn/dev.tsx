import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { ProCard, ProForm } from '@ant-design/pro-components';
import { Button, Modal, Typography } from 'antd';
import { ButtonType } from 'antd/es/button';
import { FC, useState } from 'react';
import CustomerColumnRender from '.';
import { inArray } from '../../checkers';
import { parseIcon, saFormColumnsType } from '../../helpers';
import { GetFormFields } from '../../posts/formDom';
interface CustomerColumnProps {
  ok?: (value: any) => void;
  value?: any;
  relationModel?: any;
  allMenus?: any;
}
const defaultBtn = {
  domtype: 'button',
  //type: 'default',
};

export const icons: { [key: string]: any } = {
  add: <PlusCircleOutlined />,
  edit: <EditOutlined />,
  download: <DownloadOutlined />,
  check: <CheckCircleOutlined />,
  close: <CloseCircleOutlined />,
  clock: <ClockCircleOutlined />,
  down: <DownOutlined />,
  printer: <PrinterOutlined />,
  car: <CarOutlined />,
  environment: <EnvironmentOutlined />,
};
const CustomerColumn: FC<CustomerColumnProps> = (props) => {
  const { ok, value, relationModel, allMenus = [] } = props;
  //console.log('relationModel', relationModel, allMenus);
  const columns: saFormColumnsType = [
    {
      valueType: 'group',
      columns: [
        {
          title: '表头title',
          dataIndex: 'title',
        },
        {
          title: '字段名称',
          tooltip: '如果选择器中无想要的字段名称，请填写在这里',
          dataIndex: 'dataIndex',
        },
        {
          title: '列宽',
          dataIndex: 'width',
        },
        {
          title: '提示语',
          dataIndex: 'tip',
          valueType: 'confirmForm',
          fieldProps: {
            btn: {
              title: '点击配置',
              size: 'middle',
            },
            formColumns: [
              { dataIndex: 'placeholder', title: 'placeholder' },
              { dataIndex: 'tooltip', title: 'tooltip' },
              { dataIndex: 'extra', title: 'extra', tooltip: '提示会追加显示到组件后面' },
            ],
          },
        },
        {
          title: '模拟数据',
          valueType: 'modalJson',
          dataIndex: 'record',
        },
        {
          title: 'fieldProps',
          valueType: 'modalJson',
          dataIndex: 'fieldProps',
        },
        {
          title: 'formItemProps',
          valueType: 'modalJson',
          dataIndex: 'formItemProps',
        },
        {
          title: '整体配置',
          valueType: 'modalJson',
          dataIndex: 'outside',
        },
        {
          dataIndex: 'if',
          title: '显示条件',
          valueType: 'modalJson',
          tooltip:
            '列表中record表示search部分，表单中表示数据data部分，列表中需要获取data的话请使用自定义组件',
          fieldProps: {
            title: '编辑条件',
            type: 'textarea',
          },
        },
        {
          title: '可复制',
          valueType: 'switch',
          dataIndex: 'copyable',
        },
        {
          title: 'ellipsis',
          valueType: 'switch',
          dataIndex: 'ellipsis',
        },
        {
          dataIndex: 'dom_direction',
          title: 'dom排列方式',
          valueType: 'radioButton',
          fieldProps: {
            buttonStyle: 'solid',
            placeholder: '请选择用工类别',
            defaultValue: 'horizontal',
            options: [
              { label: '水平', value: 'horizontal' },
              { label: '垂直', value: 'vertical' },
              { label: 'Dropdown', value: 'dropdown' },
            ],
          },
        },
      ],
    },
    {
      dataIndex: 'items',
      title: 'DOM列',
      valueType: 'saFormList',
      fieldProps: {
        //creatorRecord: { ...defaultBtn },
        showtype: 'table',
      },

      columns: [
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'domtype',
              title: '元素类型',
              valueType: 'select',
              fieldProps: {
                options: [
                  { label: '按钮', value: 'button' },
                  { label: '文字显示', value: 'text' },
                  { label: '分割线', value: 'divider' },
                  { label: '时间线', value: 'timeline' },
                  { label: 'actions', value: 'actions' },
                  { label: 'qrcode', value: 'qrcode' },
                  { label: 'tag', value: 'tag' },
                ],
              },
            },

            {
              valueType: 'dependency',
              name: ['domtype'],
              columns: ({ domtype }: any) => {
                //console.log('domtype change', domtype);
                if (domtype == 'timeline') {
                  return [
                    {
                      dataIndex: 'props',
                      title: '属性设置',
                      valueType: 'modalJson',
                      fieldProps: {
                        title: '设置',
                      },
                    },
                  ];
                }
                if (domtype == 'button' || domtype == 'text' || domtype == 'qrcode') {
                  const domExtColumns = [];
                  if (domtype == 'qrcode') {
                    domExtColumns.push({
                      dataIndex: 'errorLevel',
                      title: '二维码质量',
                      valueType: 'select',
                      fieldProps: {
                        options: [
                          { label: 'L', value: 'L' },
                          { label: 'M', value: 'M' },
                          { label: 'Q', value: 'Q' },
                          { label: 'H', value: 'H' },
                        ],
                      },
                    });
                  }
                  const domFormColumns = [
                    {
                      valueType: 'group',
                      columns: [
                        { dataIndex: 'text', title: '文字', width: 'md' },
                        { dataIndex: 'tooltip', title: 'tooltip', width: 'md' },
                      ],
                    },
                    {
                      valueType: 'group',
                      columns: [
                        {
                          dataIndex: 'type',
                          title: '格式',
                          valueType: 'select',
                          fieldProps: {
                            options: [
                              { label: 'default', value: 'default' },
                              { label: 'primary', value: 'primary' },
                              { label: 'ghost', value: 'ghost' },
                              { label: 'dashed', value: 'dashed' },
                              { label: 'link', value: 'link' },
                              { label: 'text', value: 'text' },
                            ],
                          },
                          width: 'sm',
                        },
                        {
                          dataIndex: 'size',
                          title: '大小',
                          valueType: 'select',
                          fieldProps: {
                            options: [
                              { label: 'small', value: 'small' },
                              { label: 'middle', value: 'middle' },
                              { label: 'large', value: 'large' },
                            ],
                          },
                          width: 'sm',
                        },
                        {
                          dataIndex: 'icon',
                          title: 'icon',
                          valueType: 'select',
                          fieldProps: {
                            options: Object.keys(icons).map((k) => {
                              return { label: icons[k], value: k };
                            }),
                          },
                          width: 'sm',
                        },
                        ...domExtColumns,
                      ],
                    },

                    { dataIndex: 'danger', title: '危险按钮', valueType: 'switch' },
                  ];
                  return [
                    {
                      valueType: 'group',
                      columns: [
                        {
                          dataIndex: 'if',
                          title: '显示条件',
                          valueType: 'modalJson',
                          fieldProps: {
                            title: '编辑条件',
                            type: 'textarea',
                          },
                        },
                        {
                          dataIndex: 'btn',
                          title: 'DOM属性',
                          valueType: 'confirmForm',
                          fieldProps: {
                            btn: {
                              title: '编辑DOM',
                              size: 'middle',
                            },
                            formColumns: domFormColumns,
                          },
                        },
                        {
                          valueType: 'dependency',
                          name: ['btn'],
                          columns: ({ btn }: any) => {
                            //console.log(btn);
                            //return [];
                            return [
                              {
                                dataIndex: '',
                                title: 'title',
                                readonly: true,
                                render: () => {
                                  return (
                                    <Typography.Text
                                      code
                                      style={{ width: 60 }}
                                      ellipsis={{ tooltip: btn?.text }}
                                    >
                                      {parseIcon(btn?.icon)}
                                      {btn?.text}
                                    </Typography.Text>
                                  );
                                },
                              },
                            ];
                          },
                        },
                        {
                          dataIndex: 'action',
                          title: 'Action类型',
                          valueType: 'select',
                          width: 130,
                          fieldProps: {
                            options: [
                              { label: 'confirm', value: 'confirm' },
                              { label: 'confirmForm', value: 'confirmForm' },
                              { label: 'modalTable', value: 'modalTable' },
                              { label: 'drawerTable', value: 'drawerTable' },
                              { label: 'dropdown', value: 'dropdown' },
                              { label: 'Popover气泡卡片', value: 'popover' },
                              { label: '打印功能', value: 'print' },
                              { label: '查看', value: 'view' },
                              { label: '编辑', value: 'edit' },
                              { label: '删除', value: 'delete' },
                            ],
                          },
                        },
                        {
                          dataIndex: 'fieldProps',
                          title: 'fieldProps',
                          valueType: 'confirmForm',
                          fieldProps: {
                            width: 1200,
                            btn: {
                              title: 'fieldProps',
                              size: 'middle',
                            },
                            formColumns: [
                              {
                                dataIndex: 'value',
                                title: 'fieldProps',
                                valueType: 'jsonEditor',
                              },
                            ],
                          },
                        },
                        {
                          valueType: 'dependency',
                          name: ['action'],
                          columns: ({ action }: any) => {
                            const _columns = [];
                            if (action == 'confirmForm') {
                              //这里如果是confirmForm需要设置表单项，应该比较少 做成json编辑器 自己编辑
                              _columns.push({
                                dataIndex: 'modal',
                                title: 'modal配置',
                                width: 120,
                                valueType: 'confirmForm',
                                fieldProps: {
                                  width: 1200,
                                  btn: {
                                    title: 'modal配置',
                                    size: 'middle',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'msg',
                                      title: '头部标题',
                                    },
                                    {
                                      dataIndex: 'page',
                                      title: '表单选择',
                                      valueType: 'treeSelect',
                                      fieldProps: {
                                        options: allMenus,
                                        treeLine: { showLeafIcon: true },
                                        treeDefaultExpandAll: true,
                                      },
                                    },
                                  ],
                                },
                              });
                            } else if (action == 'confirm' || action == 'print') {
                              _columns.push({
                                dataIndex: 'modal',
                                title: 'modal配置',
                                width: 120,
                                valueType: 'confirmForm',
                                fieldProps: {
                                  width: 1200,
                                  btn: {
                                    title: 'modal配置',
                                    size: 'middle',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'title',
                                      title: '头部标题',
                                    },
                                    {
                                      dataIndex: 'msg',
                                      title: '提示语',
                                    },
                                  ],
                                },
                              });
                            } else if (action == 'modalTable' || action == 'drawerTable') {
                              _columns.push({
                                dataIndex: 'modal',
                                title: 'modal配置',
                                width: 120,
                                valueType: 'confirmForm',
                                fieldProps: {
                                  width: 1200,
                                  btn: {
                                    title: 'modal配置',
                                    size: 'middle',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'title',
                                      title: '头部标题',
                                    },
                                    {
                                      dataIndex: 'model',
                                      title: '关联模型',
                                      valueType: 'cascader',
                                      fieldProps: {
                                        options: relationModel,
                                        changeOnSelect: true,
                                      },
                                    },
                                    {
                                      dataIndex: 'page',
                                      title: '表单选择',
                                      valueType: 'treeSelect',
                                      formItemProps: {
                                        extra:
                                          '如果模型有多个菜单已关联，需要手动指定菜单，否则默认读取第一个',
                                      },
                                      fieldProps: {
                                        options: allMenus,
                                        treeLine: { showLeafIcon: true },
                                        treeDefaultExpandAll: true,
                                      },
                                    },
                                    {
                                      dataIndex: 'drawerProps',
                                      title: 'drawer配置',
                                      valueType: 'jsonEditor',
                                    },
                                  ],
                                },
                              });
                            }
                            return _columns;
                          },
                        },
                        {
                          valueType: 'dependency',
                          name: ['action'],
                          columns: ({ action }: any) => {
                            const action_ret: saFormColumnsType = [];
                            if (
                              inArray(action, ['confirm', 'confirmForm', 'dropdown', 'print']) >= 0
                            ) {
                              action_ret.push({
                                dataIndex: 'request',
                                width: 120,
                                title: 'request配置',
                                valueType: 'confirmForm',
                                fieldProps: {
                                  btn: {
                                    title: 'request配置',
                                    size: 'middle',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'url',
                                      title: 'URL地址',
                                    },
                                    {
                                      dataIndex: 'model',
                                      title: '数据源',
                                      //valueType: 'select',
                                      valueType: 'cascader',
                                      fieldProps: {
                                        options: relationModel,
                                      },
                                    },
                                    {
                                      dataIndex: 'modelName',
                                      title: '数据源名称',
                                      tooltip:
                                        '如果不选择数据源那么直接从列表页面的columnData中获取',
                                    },
                                    {
                                      dataIndex: 'fieldNames',
                                      title: 'fieldNames',
                                      tooltip: '在dropdown中指定key和label的键值名称',
                                    },
                                    {
                                      dataIndex: 'data',
                                      title: '额外传输数据',
                                      valueType: 'jsonEditor',
                                    },
                                  ],
                                },
                              });
                            }
                            if (action == 'popover') {
                              action_ret.push({
                                dataIndex: 'popover',
                                width: 120,
                                title: 'popover配置',
                                valueType: 'confirmForm',
                                fieldProps: {
                                  btn: {
                                    title: 'popover配置',
                                    size: 'middle',
                                  },
                                  formColumns: [
                                    {
                                      dataIndex: 'type',
                                      title: '弹出类型',
                                      valueType: 'select',
                                      fieldProps: {
                                        options: [
                                          { label: '文本', value: 'content' },
                                          { label: '图片', value: 'img' },
                                          { label: '二维码', value: 'qrcode' },
                                        ],
                                      },
                                    },
                                    {
                                      valueType: 'dependency',
                                      name: ['type'],
                                      columns: ({ type }: any) => {
                                        if (type == 'content') {
                                          return [
                                            {
                                              dataIndex: 'content',
                                              title: '弹出内容',
                                            },
                                          ];
                                        } else if (type == 'qrcode' || type == 'img') {
                                          return [
                                            {
                                              dataIndex: 'content',
                                              title: '二维码内容',
                                            },
                                            {
                                              dataIndex: 'errorLevel',
                                              title: '二维码质量',
                                              valueType: 'select',
                                              fieldProps: {
                                                options: [
                                                  { label: 'L', value: 'L' },
                                                  { label: 'M', value: 'M' },
                                                  { label: 'Q', value: 'Q' },
                                                  { label: 'H', value: 'H' },
                                                ],
                                              },
                                            },
                                            {
                                              dataIndex: 'size',
                                              title: '大小',
                                              valueType: 'select',
                                              fieldProps: {
                                                options: [
                                                  { label: 'small', value: 'small' },
                                                  { label: 'middle', value: 'middle' },
                                                  { label: 'large', value: 'large' },
                                                ],
                                              },
                                            },
                                            {
                                              dataIndex: 'bordered',
                                              title: '边框',
                                              valueType: 'switch',
                                            },
                                          ];
                                        }
                                        return [];
                                      },
                                    },
                                  ],
                                },
                              });
                            }
                            return action_ret;
                          },
                        },
                      ],
                    },
                  ];
                }
                return [];
              },
            },
          ],
        },
      ],
    },
  ];
  interface saRequestData {
    url?: string;
    data?: object;
  }
  const [items, setItems] = useState<
    [
      {
        text?: string;
        type?: ButtonType;
        danger?: boolean;
        domtype?: string;
        action?: string;
        formColumns?: [];
        request?: saRequestData;
      },
    ]
  >(value?.items ? value.items : []);
  const [record, setRecord] = useState<Record<string, any>>(value?.record ? value.record : {});

  return (
    <>
      <ProCard title="效果展示">
        <CustomerColumnRender items={items} record={record} />
      </ProCard>
      <ProCard title="配置">
        <ProForm
          submitter={false}
          initialValues={value}
          onValuesChange={(v, allValues) => {
            //console.log(v);
            // const parseDatas: any = [];
            // allValues.items?.map((item) => {
            //   const parseValues = {};
            //   if (item.btn) {
            //     parseValues.btn = parseButton(item.btn);
            //   }

            //   let show = true;
            //   if (item.if) {
            //     show = tplComplie(item.if, { record: allValues.record });
            //   }
            //   if (show) {
            //     parseDatas.push({ ...item, ...parseValues });
            //   }
            // });
            if (v.items) {
              setItems([...allValues.items]);
            }
            if (v.record) {
              setRecord(allValues.record);
            }
            ok && ok(allValues);
          }}
        >
          <GetFormFields columns={columns} />
        </ProForm>
      </ProCard>
    </>
  );
};

const CustomerColumnRenderDevReal = (props) => {
  const { fieldProps } = props;
  const [open, setOpen] = useState(false);
  const { value, onChange, relationModel, btnText = '点击配置', allMenus } = fieldProps;
  const [values, setValues] = useState(value);

  //原本项获取整行的值但是好像formlist没法获取当前行的值 只有当前字段的值
  const onOk = () => {
    //console.log('值变化了', values, props.onChange, 'props is', props);
    onChange?.(values);
    setOpen(false);
  };
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        {btnText}
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onOk}
        width={1600}
        styles={{ body: { maxHeight: 650, overflowY: 'auto' } }}
      >
        <CustomerColumn
          value={value}
          relationModel={relationModel}
          allMenus={allMenus}
          ok={(values) => {
            //console.log(values);
            setValues(values);
          }}
        />
      </Modal>
    </>
  );
};

const CustomerColumnRenderDev = (_, props) => {
  return <CustomerColumnRenderDevReal {...props} />;
};
export default CustomerColumnRenderDev;
