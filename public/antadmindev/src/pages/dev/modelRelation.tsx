import SaTable from '@/components/Sadmin/posts/table';
import { TreeNodeProps, TreeSelect } from 'antd';
import { useState } from 'react';
import { devDefaultFields } from './model';

//生成关联模型的字段及其管理模型
export const getModelColumnsTree = (id: number, allModels, pid: string = '', level = 1) => {
  const select_data = allModels?.find((v) => v.id == id);
  //console.log(foreign_model_id, allModels, select_data);
  const fields: Array<TreeNodeProps> = [...select_data?.columns, ...devDefaultFields].map((v) => ({
    title: v.label ? v.label : [v.title, v.name].join(' - '),
    value: pid ? [pid, v.name ? v.name : v.value].join('-') : v.name ? v.name : v.value,
  }));
  level += 1;

  if (level > 3) {
    //3层迭代后 直接终止 防止出现无限循环
    return fields;
  }
  //关联模型
  const guanlian: Array<TreeNodeProps> = select_data?.relations?.map((v) => ({
    title: [v.title, v.name].join(' - '),
    value: pid ? [pid, v.name].join('-') : [v.name, ''].join('-'),
    children: getModelColumnsTree(
      v.foreign_model_id,
      allModels,
      pid ? [pid, v.id].join('-') : v.id,
      level,
    ),
  }));
  return [...fields, ...guanlian];
};

export default (props) => {
  const { model, contentRender } = props;
  //console.log('props', props);
  const [allModels, setAllModels] =
    useState<[{ id?: number; columns?: Array<any>; relations?: Array<any> }]>();
  const relationType = ['one', 'many', 'cascaders', 'cascader'];
  //const [toolbar, setToolbar] = useState();
  const getModelColumns = (foreign_model_id: number) => {
    const select_data = allModels?.find((v) => v.id == foreign_model_id);
    //console.log(foreign_model_id, allModels, select_data);
    return select_data?.columns?.map((v) => ({
      label: [v.title, v.name].join(' - '),
      value: v.name,
    }));
  };

  return (
    <SaTable
      name="relation"
      url="dev/relation"
      tableProps={{ params: { model_id: model?.id }, search: false }}
      //toolBarRender={false}
      tableColumns={[
        'id',
        { dataIndex: 'title', title: '名称' },
        { dataIndex: 'name', title: 'name' },
        { dataIndex: 'type', title: '类型' },
        'option',
      ]}
      beforeTableGet={(data) => {
        //data.columns = data.columns ? JSON.parse(data.columns) : [];
        //console.log(data);
        setAllModels(data.search.allModels);
        // data.perms = data.perms ? JSON.parse(data.perms) : {};
      }}
      paramExtra={{ model_id: model?.id }}
      postExtra={{ model_id: model?.id }}
      // beforePost={(data) => {
      //   data.model_id = model?.id;
      // }}
      selectRowRender={(dom) => {
        return contentRender?.(null, dom);
      }}
      formColumns={[
        { dataIndex: 'title', title: 'title' },
        { dataIndex: 'name', title: 'name' },
        {
          dataIndex: 'local_key',
          title: '本地字段',
          valueType: 'select',
          requestDataName: 'columns',
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'foreign_model_id',
              width: 'md',
              title: '关联模型',
              valueType: 'treeSelect',
              requestDataName: 'models',
              fieldProps: {
                treeLine: { showLeafIcon: true },
                treeDefaultExpandAll: true,
              },
            },
            {
              valueType: 'dependency',
              name: ['foreign_model_id'],
              columns: ({ foreign_model_id }: any) => {
                if (!foreign_model_id) {
                  return [];
                }
                return [
                  {
                    dataIndex: 'foreign_key',
                    title: '关联模型字段',
                    valueType: 'select',
                    width: 'md',
                    fieldProps: {
                      options: getModelColumns(foreign_model_id),
                    },
                  },
                ];
                //return [];
              },
            },
          ],
        },
        {
          title: '关系类型',
          dataIndex: 'type',
          valueType: 'select',
          fieldProps: { options: relationType.map((v) => ({ label: v, value: v })) },
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'can_search',
              width: 'md',
              title: '是否支持搜索',
              valueType: 'switch',
            },
            {
              valueType: 'dependency',
              name: ['foreign_model_id', 'can_search'],
              columns: ({ foreign_model_id, can_search }: any) => {
                if (!foreign_model_id || !can_search) {
                  return [];
                }
                return [
                  {
                    dataIndex: 'search_columns',
                    title: '搜索包含字段',
                    valueType: 'select',
                    width: 'md',
                    fieldProps: {
                      options: getModelColumns(foreign_model_id),
                      mode: 'multiple',
                    },
                  },
                ];
                //return [];
              },
            },
          ],
        },
        {
          valueType: 'dependency',
          name: ['type', 'foreign_model_id'],
          columns: ({ type, foreign_model_id }: any) => {
            if (type == 'many') {
              return [
                {
                  valueType: 'group',
                  columns: [
                    {
                      dataIndex: 'with_count',
                      title: '是否计算数量总和',
                      valueType: 'switch',
                      width: 'md',
                    },
                    {
                      dataIndex: 'with_sum',
                      title: '求和包含字段',
                      valueType: 'select',
                      width: 'md',
                      fieldProps: {
                        options: getModelColumns(foreign_model_id),
                        mode: 'multiple',
                      },
                    },
                  ],
                },
              ];
            }
            return [];
          },
        },
        {
          valueType: 'group',
          columns: [
            {
              title: '是否加入with',
              dataIndex: 'is_with',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: '是',
                unCheckedChildren: '否',
                defaultChecked: true,
              },
            },
            {
              valueType: 'dependency',
              name: ['foreign_model_id', 'is_with'],
              columns: ({ foreign_model_id, is_with }: any) => {
                if (!foreign_model_id || !is_with) {
                  return [];
                }
                return [
                  {
                    dataIndex: 'select_columns',
                    title: '关联模型包含字段',
                    tooltip: '不选表示全部获取',
                    valueType: 'treeSelect',
                    width: 'md',
                    fieldProps: {
                      options: getModelColumnsTree(foreign_model_id, allModels),
                      multiple: true,
                      treeLine: { showLeafIcon: false },
                      showCheckedStrategy: TreeSelect.SHOW_PARENT,
                      treeCheckable: true,
                    },
                  },
                ];
                //return [];
              },
            },
          ],
        },
        {
          valueType: 'dependency',
          name: ['type', 'foreign_model_id'],
          columns: ({ type, foreign_model_id }: any) => {
            if (type == 'one' && foreign_model_id) {
              return [
                {
                  valueType: 'group',
                  columns: [
                    {
                      title: '是否加入with_in_page',
                      dataIndex: 'is_with_in_page',
                      valueType: 'switch',
                      fieldProps: {
                        checkedChildren: '是',
                        unCheckedChildren: '否',
                        defaultChecked: false,
                      },
                    },
                    {
                      valueType: 'dependency',
                      name: ['is_with_in_page'],
                      columns: ({ is_with_in_page }: any) => {
                        if (!is_with_in_page) {
                          return [];
                        }
                        return [
                          {
                            dataIndex: 'in_page_select_columns',
                            title: '关联模型包含字段',
                            tooltip: '不选表示全部获取',
                            valueType: 'select',
                            width: 'md',
                            fieldProps: {
                              options: getModelColumns(foreign_model_id),
                              mode: 'multiple',
                              multiple: true,
                            },
                          },
                        ];
                        //return [];
                      },
                    },
                  ],
                },
              ];
            }
            return [];
          },
        },
        { dataIndex: 'with_default', title: 'withDefault', valueType: 'jsonEditor' },
        { dataIndex: 'filter', title: '筛选条件', valueType: 'jsonEditor' },
        { dataIndex: 'order_by', title: '排序', valueType: 'jsonEditor' },

        'id',
      ]}
      pageType="drawer"
      openType="drawer"
    />
  );
};
