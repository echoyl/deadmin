import { iconMap } from '@/components/Sadmin/helpers';
import Category from '@/components/Sadmin/posts/category';
import { CopyOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { Space } from 'antd';
import { useRef } from 'react';
import MenuConfig, { MenuOther } from './menuConfig';
import MenuTable from './menuTable';

export default () => {
  const iconmap2Options = (map) => {
    const ret = [];
    for (let i in map) {
      ret.push({ label: map[i], value: i });
    }
    return ret;
  };
  const actionRef = useRef<ActionType>();

  const tableColumns = (enums) => [
    {
      title: '菜单名称',
      dataIndex: 'title2',
      key: 'title2',
      render: (dom, record) => (
        <Space>
          {iconMap[record.icon]}
          {record.title}
        </Space>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'path',
      dataIndex: 'path',
      key: 'path',
    },
    'displayorder',
    {
      title: '配置',
      dataIndex: 'type',
      valueType: 'customerColumn',
      search: false,
      readonly: true,
      fieldProps: {
        items: [
          {
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 列表配置"}}',
              drawerProps: {
                width: 1600,
              },
              childrenRender: (record) => (
                <MenuTable model={{ id: record?.id }} actionRef={actionRef} />
              ),
            },
            action: 'drawer',
            btn: { text: '列表', size: 'small' },
          },
          {
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 表单配置"}}',
              drawerProps: {
                width: 1600,
              },
              childrenRender: (record) => (
                <MenuConfig model={{ id: record?.id }} actionRef={actionRef} />
              ),
            },
            action: 'drawer',
            btn: { text: '表单', size: 'small' },
          },
          {
            domtype: 'button',
            modal: {
              title: '{{record.title + " - 其它配置"}}',
              drawerProps: {
                width: 1600,
              },
              childrenRender: (record) => (
                <MenuOther model={{ id: record?.id }} actionRef={actionRef} />
              ),
            },
            action: 'drawer',
            btn: { text: '其它', size: 'small' },
          },
          {
            domtype: 'button',
            modal: {
              msg: '请选择复制到',
              formColumns: [
                {
                  dataIndex: 'toid',
                  width: 'md',
                  title: '复制到',
                  valueType: 'treeSelect',
                  fieldProps: {
                    options: enums?.menus,
                    treeLine: { showLeafIcon: true },
                    treeDefaultExpandAll: true,
                  },
                },
              ],
            },
            request: { url: 'dev/menu/copyTo' },
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
    //'state',
    {
      dataIndex: 'state',
      title: '状态',
      valueType: 'customerColumn',
      search: false,
      readonly: true,
      fieldProps: {
        items: [
          {
            domtype: 'text',
            action: 'dropdown',
            request: {
              url: '{{url}}',
              modelName: 'state',
              fieldNames: 'value,label',
              data: {
                actype: 'state',
              },
            },
          },
        ],
      },
    },
    {
      dataIndex: 'status',
      title: '显示',
      valueType: 'select',
      search: false,
      valueEnum: [
        { text: '隐藏', status: 'error' },
        { text: '显示', status: 'success' },
      ],
    },
    'option',
  ];

  return (
    <Category
      name="菜单"
      title={false}
      actionRef={actionRef}
      table_menu_key="state"
      table_menu_all={false}
      tableColumns={tableColumns}
      formColumns={[
        {
          valueType: 'group',
          columns: [
            {
              title: '菜单名称',
              dataIndex: 'title',
              width: 'md',
              fieldProps: { placeholder: '为空时菜单会隐藏' },
            },
            {
              title: 'path',
              dataIndex: 'path',
              width: 'sm',
              fieldProps: { placeholder: '请输入路径' },
            },
            {
              title: '图标',
              dataIndex: 'icon',
              valueType: 'select',
              width: 'sm',
              tooltip: '需要先将要使用到的图标配置到iconmap中才能选择',
              fieldProps: {
                placeholder: '请选择图标',
                options: iconmap2Options(iconMap),
              },
            },
            {
              title: '菜单类型',
              dataIndex: 'type',
              valueType: 'select',
              requestDataName: 'types',
              width: 'sm',
            },
            {
              title: '新增按钮',
              dataIndex: 'addable',
              valueType: 'switch',
              tooltip: '开启后列表中无新建按钮',
              fieldProps: {
                checkedChildren: '显示',
                unCheckedChildren: '隐藏',
                defaultChecked: true,
              },
            },
            {
              title: 'form是否可编辑',
              dataIndex: 'editable',
              valueType: 'switch',
              tooltip: '开启后表单无提交按钮',
              fieldProps: {
                checkedChildren: '可编辑',
                unCheckedChildren: '只读',
                defaultChecked: true,
              },
            },
            {
              title: '是否可删除',
              dataIndex: 'deleteable',
              valueType: 'switch',
              tooltip: '数据是否可以删除',
              fieldProps: {
                checkedChildren: '可删除',
                unCheckedChildren: '不可删',
                defaultChecked: true,
              },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'admin_model_id',
              title: '关联模型',
              valueType: 'treeSelect',
              requestDataName: 'admin_model_ids',
              fieldProps: {
                treeLine: { showLeafIcon: true },
                treeDefaultExpandAll: true,
                allowClear: true,
              },
              width: 'md',
            },
            // {
            //   title: 'model',
            //   dataIndex: 'model',
            //   fieldProps: { placeholder: '请输入模型名称' },
            //   formItemProps: { tooltip: '暂时只支持posts一种模型' },
            //   width: 'sm',
            // },
            // {
            //   title: '分类选择',
            //   dataIndex: 'category_id',
            //   valueType: 'cascader',
            //   request: searchCategory,
            //   fieldProps: {
            //     fieldNames: {
            //       label: 'title',
            //       value: 'id',
            //     },
            //     changeOnSelect: true,
            //   },
            //   width: 'sm',
            // },
            {
              title: '页面类型',
              dataIndex: 'page_type',
              valueType: 'radioButton',
              fieldProps: {
                options: [
                  { label: '列表', value: 'table' },
                  { label: '分类', value: 'category' },
                  { label: '表单', value: 'form' },
                  { label: '面板', value: 'panel' },
                ],
              },
            },
            {
              title: 'form打开方式',
              dataIndex: 'open_type',
              valueType: 'radioButton',
              fieldProps: {
                options: [
                  { label: 'page', value: 'page' },
                  { label: 'drawer', value: 'drawer' },
                  { label: 'modal', value: 'modal' },
                ],
              },
            },

            'displayorder',
            'state',
            {
              title: '显示',
              dataIndex: 'status',
              valueType: 'switch',
              tooltip: '隐藏后菜单不显示，但还是可以访问',
              fieldProps: {
                checkedChildren: '显示',
                unCheckedChildren: '隐藏',
                defaultChecked: true,
              },
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
                    dataIndex: 'steps_form',
                    title: '分步表单',
                    valueType: 'switch',
                  },
                ],
              },
            },
          ],
        },

        // {
        //   title: 'router',
        //   dataIndex: 'router',
        //   fieldProps: { placeholder: '请输入router' },
        // },

        {
          title: '属性设置',
          dataIndex: 'desc',
          valueType: 'jsonEditor',
          fieldProps: { height: 600 },
        },
        { title: '子权限', dataIndex: 'perms', valueType: 'jsonEditor' },
        'parent_id',
      ]}
      expandAll={false}
      level={4}
      openWidth={1600}
      tableProps={{
        scroll: { y: 600 },
      }}
      url="dev/menu"
    />
  );
};
