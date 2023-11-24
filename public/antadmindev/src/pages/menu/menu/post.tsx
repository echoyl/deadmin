import { boolSwitchProps, saFormColumnsType } from '@/components/Sadmin/helpers';
import PostsForm from '@/components/Sadmin/posts/post';
import request from '@/services/ant-design-pro/sadmin';
import { useState } from 'react';
export default () => {
  const [menuModules, setMenuModules] = useState<
    Array<{
      id?: string;
      type?: string;
      title?: string;
      url?: object;
    }>
  >([]);
  const searchCategory = async (value: string) => {
    const { data } = await request.get('category', {
      params: { title: value, pageSize: 50, search: 1 },
    });
    return data;
  };

  const searchMenu = async (value: string) => {
    const { data } = await request.get('web/menu', {
      params: { title: value, pageSize: 50, search: 1 },
    });
    return data;
  };

  const searchPosts = async (value: string) => {
    const { data } = await request.get('posts/posts', {
      params: { title: value, pageSize: 50, search: 1 },
    });
    return data;
  };

  const baseColumns: saFormColumnsType = (detail) => [
    'title',
    'small_title',
    {
      title: 'Banner图片',
      dataIndex: 'banner',
      valueType: 'uploader',
      fieldProps: {
        max: 9,
      },
      tooltip: '如果未上传会读取上级菜单的banner图片',
      formItemProps: { tooltip: '最多9张' },
    },
    {
      title: '菜单图片',
      dataIndex: 'pics',
      valueType: 'uploader',
      fieldProps: {
        max: 9,
      },
      formItemProps: { tooltip: '最多9张' },
    },
    {
      title: '模块类型',
      dataIndex: 'module',
      valueType: 'select',
      requestDataName: 'modules',
      fieldProps: {
        fieldNames: { value: 'id', label: 'title' },
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请选择模块类型',
          },
        ],
      },
    },
    'alias',
    {
      valueType: 'dependency',
      name: ['module'],
      columns: ({ module }) => {
        const el: saFormColumnsType = [];
        const moduleVar = menuModules.find((v) => v.id == module);
        if (module) {
          if (module != 'link') {
            el.push({
              title: 'URL别名',
              dataIndex: 'alias',
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: '请输入URL别名',
                  },
                ],
              },
              fieldProps: {
                placeholder: '请输入URL别名',
              },
            });
          }
          if (['link', 'menu'].includes(module)) {
            if (module == 'link') {
              el.push({
                title: '外链',
                dataIndex: 'link',
                formItemProps: {
                  rules: [
                    {
                      required: true,
                      message: '请输入外链',
                    },
                  ],
                },
                fieldProps: {
                  placeholder: '请输入外链',
                },
              });
            }
          } else {
            el.push({
              title: '模板标识',
              dataIndex: 'tpl',
              fieldProps: {
                placeholder: '为空则读取选中模块下默认模板',
              },
            });
            if (moduleVar?.type == 'content') {
              console.log(moduleVar, menuModules);
              el.push({
                valueType: 'group',
                columns: [
                  {
                    dataIndex: 'admin_model_id',
                    title: '关联模型',
                    valueType: 'treeSelect',
                    fieldProps: {
                      options: detail?.admin_model_ids,
                      treeLine: { showLeafIcon: true },
                      treeDefaultExpandAll: true,
                      allowClear: true,
                    },
                    width: 'md',
                  },
                  {
                    title: '页面类型',
                    dataIndex: 'pagetype',
                    valueType: 'radioButton',
                    fieldProps: {
                      options: [
                        { label: '列表', value: 'list' },
                        { label: '详情页', value: 'detail' },
                      ],
                      buttonStyle: 'solid',
                    },
                  },
                ],
              });
              el.push({
                valueType: 'dependency',
                name: ['pagetype', 'admin_model_id'],
                columns: ({ pagetype, admin_model_id }) => {
                  console.log(pagetype);
                  if (pagetype == 'list' && admin_model_id) {
                    return [
                      {
                        valueType: 'group',
                        columns: [
                          {
                            title: '分类选择',
                            dataIndex: 'category_id',
                            valueType: 'cascader',
                            width: 'md',
                            request: async (value: string) => {
                              const { data } = await request.get('web/menu/category', {
                                params: { admin_model_id },
                              });
                              return data;
                            },
                            fieldProps: {
                              fieldNames: {
                                label: 'title',
                                value: 'id',
                              },
                              changeOnSelect: true,
                            },
                          },
                          {
                            title: '显示子分类',
                            valueType: 'switch',
                            dataIndex: 'category_all',
                            fieldProps: boolSwitchProps,
                          },
                          {
                            title: '分页数量',
                            valueType: 'digit',
                            dataIndex: 'pagesize',
                          },
                        ],
                      },
                    ];
                  } else if (pagetype == 'detail') {
                    return [
                      {
                        title: '内容选择',
                        dataIndex: 'content_id',
                        valueType: 'debounceSelect',
                        fieldProps: {
                          placeholder: '请输入搜索',
                          fetchOptions: moduleVar?.url?.posts,
                          fieldNames: {
                            label: 'title',
                            value: 'id',
                          },
                        },
                        formItemProps: {
                          rules: [
                            {
                              required: true,
                              message: '请选择内容',
                            },
                          ],
                        },
                      },
                    ];
                  } else {
                    return [];
                  }
                },
              });
            }
          }
        }
        return el;
      },
    },

    {
      valueType: 'group',
      columns: [
        'displayorder',
        {
          title: '新开页面打开',
          dataIndex: 'blank',
          valueType: 'switch',
          fieldProps: boolSwitchProps,
        },
        {
          title: '顶部显示',
          dataIndex: 'top',
          valueType: 'switch',
          fieldProps: boolSwitchProps,
        },
        {
          title: '底部显示',
          dataIndex: 'bottom',
          valueType: 'switch',
          fieldProps: boolSwitchProps,
        },
        'state',
      ],
    },

    'parent_id',
    'id',
  ];

  const otherColums: saFormColumnsType = [
    {
      valueType: 'group',
      columns: [
        {
          title: '首页显示',
          dataIndex: 'index_show',
          valueType: 'switch',
          fieldProps: boolSwitchProps,
        },
        {
          title: '列表显示',
          dataIndex: 'list_show',
          valueType: 'switch',
          fieldProps: boolSwitchProps,
        },
      ],
    },
    { title: '页面配置', dataIndex: 'specs', valueType: 'jsonForm' },
    {
      title: '简介',
      dataIndex: 'desc',
      valueType: 'tinyEditor',
    },
    {
      title: '内容',
      dataIndex: 'content_detail',
      valueType: 'tinyEditor',
    },
    {
      title: '相关联菜单',
      request: searchMenu,
      dataIndex: 'relate_menu_id',
      valueType: 'cascader',
      fieldProps: {
        fieldNames: {
          label: 'title',
          value: 'id',
        },
        changeOnSelect: true,
        multiple: true,
      },
    },
  ];

  return (
    <PostsForm
      url="web/menu/show"
      formTitle={false}
      beforePost={(v) => {
        //console.log(v);
        //return false;
      }}
      beforeGet={(v) => {
        //console.log(v.modules);
        // if (v.specs) {
        //   v.specs = JSON.parse(v.specs);
        // }
        setMenuModules(v.modules);
      }}
      tabs={[
        {
          title: '基本设置',
          formColumns: baseColumns,
        },
        {
          title: '页面设置',
          formColumns: otherColums,
        },
      ]}
      labels={{ title: '菜单名称' }}
      match={true}
    />
  );
};
