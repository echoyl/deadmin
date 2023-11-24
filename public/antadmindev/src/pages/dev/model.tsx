import ConfirmForm from '@/components/Sadmin/action/confirmForm';
import { saTableColumnsType } from '@/components/Sadmin/helpers';
import Category from '@/components/Sadmin/posts/category';
import { CopyOutlined, FileOutlined, FolderOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { useRef, useState } from 'react';
import ModelRelation from './modelRelation';
import QuickCreate from './quickCreate';

/**
 * 默认数据库有的字段
 */
export const devDefaultFields = [
  { label: '创建时间 - created_at', value: 'created_at' },
  { label: '最后更新时间 - updated_at', value: 'updated_at' },
  { label: '排序权重 - displayorder', value: 'displayorder' },
];

/**
 * 默认table列表中预设的字段列名
 */
export const devTabelFields = [
  { label: 'option - 操作栏', title: 'option - 操作栏', value: 'option' },
  //{ label: 'coption - 分类操作栏', value: 'coption' },
];

export default () => {
  const [allData, setAllData] = useState();
  const actionRef = useRef<ActionType>();

  const tableColumns: saTableColumnsType = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (dom, record) => (
        <Space>
          {record.type == 1 ? <FileOutlined /> : <FolderOutlined />}
          {record.title} - {record.id}
        </Space>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '额外操作',
      dataIndex: 'type',
      valueType: 'customerColumn',
      search: false,
      readonly: true,
      fieldProps: {
        items: [
          {
            if: '{{record.type == 1}}',
            domtype: 'button',
            modal: { msg: '确定要生成数据表吗？' },
            request: { url: 'dev/model/createModelSchema' },
            action: 'confirm',
            btn: { text: '生成表', size: 'small' },
          },
          // {
          //   if: '{{record.type == 1}}',
          //   domtype: 'button',
          //   modal: { msg: '确定要生成model及controller的php文件吗？' },
          //   request: { url: 'dev/model/createModelFile' },
          //   action: 'confirm',
          //   btn: { text: '生成php文件', size: 'small' },
          // },
          {
            if: '{{record.type == 1}}',
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 关联管理"}}',
              drawerProps: {
                width: 1000,
              },
              childrenRender: (record) => <ModelRelation model={record} />,
            },
            action: 'drawer',
            btn: { text: '关联管理', size: 'small' },
          },

          // {
          //   if: '{{record.type == 1}}',
          //   domtype: 'button',
          //   modal: { msg: '确定要生成controller文件吗？' },
          //   request: { url: 'dev/model/createControllerFile' },
          //   action: 'confirm',
          //   btn: { text: '生成controller文件', size: 'small' },
          // },
          {
            domtype: 'button',
            if: '{{record.type == 1}}',
            modal: {
              msg: '请选择复制到',
              formColumns: [
                {
                  dataIndex: 'toid',
                  width: 'md',
                  title: '复制到文件夹',
                  valueType: 'treeSelect',
                  fieldProps: {
                    options: allData?.search.foldermodels,
                    treeLine: { showLeafIcon: true },
                    treeDefaultExpandAll: true,
                  },
                },
              ],
            },
            request: { url: 'dev/model/copyToFolder' },
            action: 'confirmForm',
            // btn: (
            //   <Tooltip title="复制模型">
            //     <Button size="small" icon={<CopyOutlined />} />
            //   </Tooltip>
            // ),
            btn: { text: '', size: 'small', icon: <CopyOutlined />, tooltip: '复制模型' },
          },
        ],
      },
    },
    'option',
  ];
  const schemaType = [
    { label: 'int-整型', value: 'int' },
    { label: 'varchar-字符', value: 'varchar' },
    { label: 'datetime-时间', value: 'datetime' },
    { label: 'date-日期', value: 'date' },
    { label: 'text-文本', value: 'text' },
    { label: 'bigint-长整数', value: 'bigint' },
  ];
  const modelType = ['category', 'normal', 'auth'];
  const searchColumnType = ['=', 'like', 'whereBetween', 'whereIn', 'has', 'doesntHave'];
  const formRef = useRef<ProFormInstance<any>>({} as any);
  const formType = [
    { label: '搜索下拉 - search_select', value: 'search_select' },
    { label: '下拉选择- select', value: 'select' },
    { label: '单选按钮 - radioButton', value: 'radioButton' },
    { label: '下拉多选 -selects', value: 'selects' },
    { label: '图片上传 - image', value: 'image' },
    { label: '文件上传 - file', value: 'file' },
    { label: '阿里云视频上传 - aliyunVideo', value: 'aliyunVideo' },
    { label: '密码 - password', value: 'password' },
    { label: '文本域 - textarea', value: 'textarea' },
    { label: '开关 - switch', value: 'switch' },
    { label: '时间 - datetime', value: 'datetime' },
    { label: '日期 - date', value: 'date' },
    { label: '层级多选 - cascaders', value: 'cascaders' },
    { label: '层级选择 - cascader', value: 'cascader' },
    { label: '省市区 - pca', value: 'pca' },
    { label: '地图组件 - tmapInput', value: 'tmapInput' },
    { label: '富文本 - tinyEditor', value: 'tinyEditor' },
    { label: '价格- price', value: 'price' },
    { label: '数字- digit', value: 'digit' },
    { label: 'json', value: 'json' },
    { label: '弹层选择 - modalSelect', value: 'modalSelect' },
  ];

  const setTableColumns = (type: string) => {
    console.log(type);
    const cateColumns = [
      { title: 'id', name: 'id', type: 'int' },
      { title: '名称', name: 'title', type: 'vachar' },
      { title: '父级Id', name: 'parent_id', type: 'int', desc: '' },
      {
        title: '图片',
        name: 'titlepic',
        type: 'vachar',
        form_type: 'image',
        setting: {
          image_count: 1,
        },
      },
      {
        title: '状态',
        name: 'state',
        type: 'int',
        form_type: 'switch',
        default: 1,
        setting: {
          open: '启用',
          close: '禁用',
        },
      },
    ];

    const normalColumns = [
      { title: 'id', name: 'id', type: 'int' },
      { title: '名称', name: 'title', type: 'vachar' },
      {
        title: '图片',
        name: 'titlepic',
        type: 'vachar',
        form_type: 'image',
        setting: {
          image_count: 1,
        },
      },
      { title: '描述', name: 'desc', type: 'vachar', form_type: 'textarea' },
      {
        title: '状态',
        name: 'state',
        type: 'int',
        form_type: 'switch',
        default: 1,
        setting: {
          open: '启用',
          close: '禁用',
        },
      },
    ];

    formRef.current?.setFieldValue(
      'columns',
      type == 'category' ? [...cateColumns] : [...normalColumns],
    );
  };

  return (
    <>
      <Category
        formRef={formRef}
        actionRef={actionRef}
        tableTitle={false}
        table_menu_key="admin_type"
        table_menu_all={false}
        tableColumns={tableColumns}
        beforeTableGet={(data) => {
          //console.log('beforeTableGet', data);
          setAllData(data);
        }}
        openWidth={1500}
        tableProps={{
          scroll: { y: 600 },
        }}
        toolBar={() => {
          return (
            <>
              <QuickCreate
                menus={allData?.search.menus}
                models={allData?.search.models}
                foldermodels={allData?.search.foldermodels}
              />
              <ConfirmForm
                key="export_button"
                trigger={<Button>导出</Button>}
                url="dev/model/export"
                msg="确定要导出数据吗？"
                callback={(ret) => {
                  return;
                }}
                formColumns={[
                  {
                    title: '导出配置',
                    dataIndex: 'check',
                    valueType: 'checkbox',
                    fieldProps: {
                      options: [
                        { label: 'Create table', value: 'create' },
                        { label: 'Drop table', value: 'drop' },
                        { label: 'Truncate table', value: 'truncate' },
                        { label: 'REPLACE INTO', value: 'replace' },
                        { label: 'INSERT INTO', value: 'insert' },
                        { label: '全部数据', value: 'all' },
                        { label: '仅项目数据', value: 'app' },
                      ],
                    },
                  },
                ]}
              />
            </>
          );
        }}
        expandAll={false}
        level={4}
        url="dev/model"
        formColumns={[
          {
            valueType: 'group',
            columns: [
              {
                title: '名称',
                dataIndex: 'title',
                width: 'md',
                fieldProps: { placeholder: '请输入名称' },
              },
              {
                title: 'name',
                dataIndex: 'name',
                width: 'md',
                fieldProps: { placeholder: '请输入名称' },
              },
              {
                title: '模型所属',
                width: 'md',
                dataIndex: 'admin_type',
                valueType: 'select',
                requestDataName: 'admin_types',
              },
            ],
          },
          {
            valueType: 'group',
            columns: [
              {
                title: '类型',
                dataIndex: 'type',
                valueType: 'select',
                width: 'md',
                fieldProps: {
                  placeholder: '请选择类型',
                  options: [
                    { label: '文件夹', value: 0 },
                    { label: '模型', value: 1 },
                  ],
                },
              },
              {
                title: '模型类型',
                dataIndex: 'leixing',
                valueType: 'select',
                width: 'md',
                fieldProps: { options: modelType.map((v) => ({ label: v, value: v })) },
              },
              {
                title: '设置',
                dataIndex: 'setting',
                valueType: 'confirmForm',
                fieldProps: {
                  btn: {
                    title: '设置',
                    size: 'middle',
                  },
                  formColumns: [
                    {
                      dataIndex: 'soft_delete',
                      title: '软删除',
                      valueType: 'switch',
                    },
                  ],
                },
              },
            ],
          },

          {
            title: (
              <Space>
                <span>表结构</span>
                <Button
                  onClick={() => setTableColumns('category')}
                  size="small"
                  icon={<PlusCircleOutlined />}
                >
                  分类模型结构
                </Button>
                <Button
                  onClick={() => setTableColumns('normal')}
                  size="small"
                  icon={<PlusCircleOutlined />}
                >
                  普通模型结构
                </Button>
              </Space>
            ),
            dataIndex: 'columns',
            valueType: 'formList',
            columns: [
              {
                valueType: 'group',
                columns: [
                  {
                    title: '可为空',
                    dataIndex: 'empty',
                    valueType: 'checkbox',
                    fieldProps: {
                      options: [{ label: '允许空值', value: 1 }],
                    },
                    width: 100,
                  },
                  {
                    title: '名称',
                    dataIndex: 'title',
                    width: 140,
                    fieldProps: {
                      placeholder: '名称备注',
                    },
                  },
                  {
                    title: '字段',
                    dataIndex: 'name',
                    width: 140,
                    fieldProps: {
                      placeholder: '字段名',
                    },
                  },
                  {
                    title: '类型',
                    dataIndex: 'type',
                    valueType: 'select',
                    width: 180,
                    fieldProps: { options: schemaType },
                  },
                  {
                    title: '默认值',
                    dataIndex: 'default',
                    width: 100,
                    fieldProps: {
                      placeholder: '默认值',
                    },
                  },
                  {
                    title: '长度',
                    dataIndex: 'length',
                    width: 100,
                    fieldProps: {
                      placeholder: '字段长度',
                    },
                  },
                  {
                    title: 'form类型',
                    dataIndex: 'form_type',
                    valueType: 'select',
                    width: 180,
                    fieldProps: { options: formType },
                  },
                  {
                    title: '配置',
                    dataIndex: 'setting',
                    valueType: 'confirmForm',
                    fieldProps: {
                      btn: { title: '配置' },
                      formColumns: [
                        {
                          valueType: 'group',
                          columns: [
                            { title: '图片或视频数量限制', dataIndex: 'image_count' },
                            { title: '省市区层级', dataIndex: 'pca_level' },
                            {
                              title: '省市区前缀',
                              dataIndex: 'pca_topCode',
                              tooltip: '限定上级省市显示，逗号分割',
                            },
                          ],
                        },
                        {
                          valueType: 'group',
                          columns: [
                            { title: 'label', dataIndex: 'label' },
                            { title: 'value', dataIndex: 'value' },
                            { title: 'children', dataIndex: 'children' },
                          ],
                        },
                        {
                          valueType: 'group',
                          columns: [
                            { title: 'swtich开启', dataIndex: 'open' },
                            { title: 'swtich关闭', dataIndex: 'close' },
                          ],
                        },
                        { title: 'json可选数据', dataIndex: 'json', valueType: 'jsonEditor' },
                      ],
                    },
                  },
                  {
                    dataIndex: 'table_menu',
                    valueType: 'switch',
                    title: '菜单',
                    fieldProps: {
                      checkedChildren: 'tab',
                      unCheckedChildren: 'tab',
                      defaultChecked: false,
                    },
                  },
                ],
              },
            ],
          },
          {
            valueType: 'dependency',
            name: ['columns'],
            columns: ({ columns }: any) => {
              let foreignOptions = [];
              if (columns) {
                foreignOptions = columns
                  ?.filter((v) => {
                    return v.title && v.name;
                  })
                  .map((v) => ({
                    label: [v.title, v.name].join(' - '),
                    value: v.name,
                  }));
              } else {
                return [];
              }

              return [
                {
                  title: '搜索配置',
                  dataIndex: 'search_columns',
                  valueType: 'formList',
                  columns: [
                    {
                      valueType: 'group',
                      columns: [
                        {
                          title: 'url参数名称',
                          dataIndex: 'name',
                        },
                        {
                          title: '类型',
                          dataIndex: 'type',
                          valueType: 'select',
                          fieldProps: {
                            options: searchColumnType.map((v) => ({ label: v, value: v })),
                          },
                          width: 150,
                        },
                        {
                          title: '字段',
                          dataIndex: 'columns',
                          valueType: 'select',
                          tooltip: '不存在的字段请自行输入，比如whereHas，请输入关联名称',
                          width: 300,
                          fieldProps: {
                            options: [...foreignOptions, ...devDefaultFields],
                            mode: 'tags',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  title: '唯一字段检测',
                  dataIndex: 'unique_fields',
                  valueType: 'formList',
                  columns: [
                    {
                      title: '字段',
                      dataIndex: 'columns',
                      valueType: 'select',
                      width: 300,
                      fieldProps: {
                        options: [...foreignOptions, ...devDefaultFields],
                        mode: 'multiple',
                      },
                    },
                  ],
                },
              ];
            },
          },

          'parent_id',
        ]}
      />
    </>
  );
};
