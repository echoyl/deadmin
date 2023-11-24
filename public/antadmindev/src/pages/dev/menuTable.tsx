import { saTableColumnsType } from '@/components/Sadmin/helpers';
import { SaForm } from '@/components/Sadmin/posts/post';
import { ProFormInstance } from '@ant-design/pro-components';
import { TreeNodeProps } from 'antd';
import { useRef, useState } from 'react';
import { devDefaultFields, devTabelFields } from './model';

export const getModelColumnsSelect = (id: number, allModels, level = 1) => {
  const select_data = allModels?.find((v) => v.id == id);
  //console.log(foreign_model_id, allModels, select_data);
  const fields: Array<TreeNodeProps> = [...select_data?.columns].map((v) => ({
    label: v.label ? v.label : [v.title, v.name].join(' - '),
    value: v.name,
  }));
  level += 1;

  if (level > 3) {
    //3层迭代后 直接终止 防止出现无限循环
    return fields;
  }
  //关联模型
  const guanlian: Array<TreeNodeProps> = select_data?.relations?.map((v) => ({
    label: [v.title, v.name].join(' - '),
    value: v.name,
    children: getModelColumnsSelect(v.foreign_model_id, allModels, level),
  }));
  return [...fields, ...guanlian];
};

export const getModelRelationSelect = (id: number, allModels, level = 1) => {
  const select_data = allModels?.find((v) => v.id == id);
  level += 1;
  if (level > 3) {
    //3层迭代后 直接终止 防止出现无限循环
    return [];
  }
  //关联模型
  const guanlian: Array<TreeNodeProps> = select_data?.relations?.map((v) => ({
    label: [v.title, v.name].join(' - '),
    value: v.name,
    children: getModelRelationSelect(v.foreign_model_id, allModels, level),
  }));
  //console.log('guanlian', guanlian);
  return guanlian;
};

export default (props) => {
  const { model, setOpen, actionRef, contentRender } = props;
  const [modelColumns2, setModelColumns2] = useState<[{ [key: string]: any }]>();
  const [relationModel, setRelationModel] = useState([]);
  const [allMenus, setAllMenus] = useState([]);

  const columnType = [
    { label: '日期 - date', value: 'date' },
    { label: '日期区间 - dateRange', value: 'dateRange' },
    { label: '时间 - dateTime', value: 'dateTime' },
    { label: '时间区间 - dateTimeRange', value: 'dateTimeRange' },
    { label: '上传-uploader', value: 'uploader' },
    { label: '自定义组件 - customerColumn', value: 'customerColumn' },
    { label: '密码 - password', value: 'password' },
    { label: '头像 - avatar', value: 'avatar' },
    { label: '导出 - export', value: 'export' },
    { label: '导入 - import', value: 'import' },
    { label: '操作栏 - toolbar', value: 'toolbar' },
    { label: 'slider', value: 'slider' },
    { label: '省市区 - pca', value: 'pca' },
    { label: '用户权限 - userPerm', value: 'userPerm' },
    { label: 'html', value: 'html' },
    { label: 'select', value: 'select' },
  ];

  const dfColumns: saTableColumnsType = [
    {
      dataIndex: 'key',
      title: '字段',
      width: 'sm',
      valueType: 'cascader',
      fieldProps: {
        options: modelColumns2,
        showSearch: true,
        changeOnSelect: true,
      },
    },

    {
      valueType: 'dependency',
      name: ['props'],
      columns: ({ props }: any) => {
        //console.log(props);
        //return [];
        return [
          {
            dataIndex: '',
            title: '自定义表头',
            readonly: true,
            render: () => {
              return <div style={{ width: 100 }}>{props?.title ? props.title : ' - '}</div>;
            },
          },
        ];
      },
    },
    {
      dataIndex: 'can_search',
      valueType: 'checkbox',
      title: '搜索',
      fieldProps: {
        options: [{ label: '可搜索', value: 1 }],
      },
    },
    {
      dataIndex: 'hide_in_table',
      valueType: 'checkbox',
      title: '表中隐藏',
      width: 75,
      fieldProps: {
        options: [{ label: '隐藏', value: 1 }],
      },
    },
    {
      dataIndex: 'table_menu',
      valueType: 'checkbox',
      title: '开启tab',
      width: 75,
      fieldProps: {
        options: [{ label: 'tab', value: 1 }],
      },
    },
    {
      dataIndex: 'sort',
      valueType: 'checkbox',
      title: '开启排序',
      width: 75,
      fieldProps: {
        options: [{ label: '排序', value: 1 }],
      },
    },
    {
      dataIndex: 'props',
      title: '更多',
      valueType: 'customerColumnDev',
      fieldProps: {
        relationModel,
        allMenus,
      },
      width: 75,
    },
    {
      dataIndex: 'type',
      width: 220,
      valueType: 'select',
      title: '字段类型',
      fieldProps: {
        options: columnType,
        placeholder: '请选择表字段类型',
      },
    },

    {
      dataIndex: 'left_menu',
      valueType: 'checkbox',
      title: '左侧菜单',
      fieldProps: {
        options: [{ label: '左侧菜单', value: 1 }],
      },
      width: 100,
    },
    {
      valueType: 'dependency',
      name: ['left_menu'],
      columns: ({ left_menu }: any) => {
        if (left_menu && left_menu.length > 0) {
          return [
            {
              dataIndex: 'left_menu_field',
              fieldProps: {
                placeholder: '请输入左侧菜单label，value字段名称',
              },
            },
          ];
        }
        return [];
      },
    },
  ];

  const cascaderColumns = (data) => {
    if (!data.admin_model) {
      return;
    }

    const oldModelColumns = data.admin_model.columns;

    const foreignOptions = oldModelColumns.map((v) => ({
      label: [v.title, v.name].join(' - '),
      value: v.name,
    }));

    const manyRelation: any[] = [];
    const oneRelation: any[] = [];
    const manyFields = data.admin_model.relations
      ?.filter((v) => v.type == 'one' || v.type == 'many')
      .map((v) => {
        //读取关联模型的字段信息
        //const foreign_model_columns = JSON.parse(v.foreign_model.columns);
        // const children = foreign_model_columns.map((v) => ({
        //   label: [v.title, v.name].join(' - '),
        //   value: v.name,
        //   children:getModelColumnsSelect(v.foreign_model_id,data.allModels)
        // }));
        const children = getModelRelationSelect(v.foreign_model_id, data.allModels, 2);
        //console.log('my children ', children);
        if (v.type == 'many') {
          manyRelation.push({
            label: [v.title, v.name, 'many'].join(' - '),
            value: v.name,
            children,
          });
        }
        if (v.type == 'one') {
          oneRelation.push({
            label: [v.title, v.name, 'one'].join(' - '),
            value: v.name,
            children,
          });
        }
        return {
          label: [v.title, v.name, v.type == 'one' ? 'hasOne' : 'hasMany'].join(' - '),
          value: v.name,
          children: children,
        };
      });
    setRelationModel([...manyRelation, ...oneRelation]);
    //console.log('data.menus', data.menus);
    setAllMenus(data.menus);
    //设置form表单需要选择的字段
    //检测模型关系 提供给table列选择字段
    data.admin_model.relations?.forEach((v) => {
      if (v.type == 'many') {
        if (v.with_count) {
          foreignOptions.push({
            label: [v.title, 'count'].join(' - '),
            value: [v.name, 'count'].join('_'),
          });
        }
        if (v.with_sum) {
          v.with_sum.split(',').forEach((vs) => {
            foreignOptions.push({
              label: [v.title, 'sum', vs].join(' - '),
              value: [v.name, 'sum', vs].join('_'),
            });
          });
        }
      }
    });
    const allColumns = getModelColumnsSelect(data.admin_model_id, data.allModels);
    //console.log('cascaderColumns5', data);
    //检测模型搜索设置 提供给table列选择字段 20230904 可能存在重复键值导致组件错误，暂时不要这个功能
    const existColumns = [...foreignOptions, ...devDefaultFields];
    const search_columns = data.admin_model.search_columns ? data.admin_model.search_columns : [];
    const searchColumn = search_columns
      .filter((v) => {
        return existColumns.findIndex((val) => val.value == v.name) < 0;
      })
      .map((v) => ({
        label: [v.name, '搜索字段'].join(' - '),
        value: v.name,
      }));
    setModelColumns2([...allColumns, ...devDefaultFields, ...devTabelFields, ...searchColumn]);

    if (!data.table_config) {
      data.table_config = oldModelColumns.map((v) => {
        return { key: v.name };
      });
      data.table_config.push({ key: 'option' });
    }

    return;
  };

  const formRef = useRef<ProFormInstance>();
  return (
    <SaForm
      beforeGet={(data) => {
        cascaderColumns(data);
      }}
      msgcls={({ code }) => {
        if (!code) {
          console.log('loading dispear here');
          setOpen(false);
          actionRef.current?.reload();
          return;
        }
      }}
      formColumns={[
        'id',
        {
          dataIndex: 'table_config',
          valueType: 'saFormList',
          fieldProps: { showtype: 'table' },
          columns: dfColumns,
        },
      ]}
      formRef={formRef}
      paramExtra={{ id: model?.id }}
      url="dev/menu/show"
      postUrl="dev/menu/tableConfig"
      showTabs={false}
      formProps={{
        contentRender,
        submitter: {
          searchConfig: { resetText: '取消' },
          resetButtonProps: {
            onClick: () => {
              setOpen(false);
            },
          },
        },
      }}
      align="left"
      dataId={model.id}
      pageType="drawer"
    />
  );
};
