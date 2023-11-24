import PostsForm from '@/components/Sadmin/posts/post';
import request from '@/services/ant-design-pro/sadmin';
import { getMenuData } from '@ant-design/pro-components';
import { useLocation, useModel, useParams } from '@umijs/max';

export default () => {
  const param = useParams();
  const localtion = useLocation();
  const { initialState } = useModel('@@initialState');
  const { breadcrumb } = getMenuData(initialState?.currentUser?.menuData);
  const listPathname = localtion.pathname.replace('/' + param.id, '');
  const { data: baseData = { formColumns: [] } } = breadcrumb[listPathname];
  //log('breadcrumb', breadcrumb, baseData);

  const searchMiniprogram = async () => {
    const { data } = await request.get('wechat/miniprogram/account', {
      params: { pageSize: 50, search: 1 },
    });
    return data;
  };
  const searchOffiaccount = async () => {
    const { data } = await request.get('wechat/offiaccount/account', {
      params: { pageSize: 50, search: 1 },
    });
    return data;
  };
  const searchPay = async () => {
    const { data } = await request.get('wechat/pay', {
      params: { pageSize: 50, search: 1 },
    });
    return data;
  };
  const searchGoodsCategory = async () => {
    const { data } = await request.get('donglifeng/shop/goods/category', {
      params: { pageSize: 50, level: 1 },
    });
    return data;
  };
  // 备注将多余的设置全部写入到自定义当中去
  // {
  //   "title": "用户端小程序",
  //   "dataIndex": "user_miniprogram_account_id",
  //   "valueType": "debounceSelect",
  //   "fieldProps": {
  //     "fetchOptions": "wechat/miniprogram/account",
  //     "fieldNames": {
  //       "label": "appname",
  //       "value": "id"
  //     },
  //     "params": {
  //       "select[]": [
  //         "id",
  //         "appname"
  //       ]
  //     }
  //   }
  // },
  // {
  //   "title": "公众号",
  //   "dataIndex": "offiaccount_account_id",
  //   "valueType": "debounceSelect",
  //   "fieldProps": {
  //     "fetchOptions": "wechat/offiaccount/account",
  //     "fieldNames": {
  //       "label": "appname",
  //       "value": "id"
  //     }
  //   }
  // },
  // {
  //   "title": "微信支付选择",
  //   "dataIndex": "pay",
  //   "valueType": "debounceSelect",
  //   "fieldProps": {
  //     "fetchOptions": "wechat/pay",
  //     "fieldNames": {
  //       "label": "name",
  //       "value": "id"
  //     }
  //   }
  // },
  return (
    <PostsForm
      beforeGet={(data) => {
        //data.latlng = { lat: data.lat, lng: data.lng };
        data.user_goods_category = data.user_goods_category?.map((v) => {
          v = v + '';
          return v;
        });
      }}
      beforePost={(data) => {
        //data.lat = data.latlng.lat;
        //data.lng = data.latlng.lng;
        //console.log(data);
        //return false;
      }}
      tabs={[
        {
          title: '基本设置',
          formColumns: [
            {
              title: '平台名称',
              dataIndex: 'name',
            },
            {
              title: '联系电话',
              dataIndex: 'mobile',
            },
            ...baseData?.formColumns,
            // {
            //   "title": "首页展示商品分类",
            //   "dataIndex": "user_goods_category",
            //   "request": "searchGoodsCategory",
            //   "valueType": "select",
            //   "fieldProps": {
            //     "fieldNames": {
            //       "label": "title",
            //       "value": "id"
            //     },
            //     "mode": "multiple"
            //   },
            //   "formItemProps": {
            //     "rules": [
            //       {
            //         "required": true
            //       }
            //     ]
            //   }
            // },
          ],
        },
        {
          title: '其它配置',
          formColumns: [
            {
              title: '用户端小程序',
              dataIndex: 'user_miniprogram_account_id',
              request: searchMiniprogram,
              valueType: 'select',
              fieldProps: {
                fieldNames: {
                  label: 'appname',
                  value: 'id',
                },
              },
              formItemProps: {
                rules: [{ required: true }],
              },
            },
            {
              title: '商家端小程序',
              dataIndex: 'merch_miniprogram_account_id',
              request: searchMiniprogram,
              valueType: 'select',
              fieldProps: {
                fieldNames: {
                  label: 'appname',
                  value: 'id',
                },
              },
              formItemProps: {
                rules: [{ required: true }],
              },
            },
            {
              title: '公众号',
              dataIndex: 'offiaccount_account_id',
              request: searchOffiaccount,
              valueType: 'select',
              fieldProps: {
                fieldNames: {
                  label: 'appname',
                  value: 'id',
                },
              },
              formItemProps: {
                rules: [{ required: true }],
              },
            },
            {
              valueType: 'dependency',
              name: ['offiaccount_account_id'],
              columns: ({ offiaccount_account_id }) => {
                if (offiaccount_account_id) {
                  return [
                    {
                      title: '订单通知平台',
                      dataIndex: 'message_openids',
                      valueType: 'debounceSelect',

                      fieldProps: {
                        fetchOptions: async (searchval) => {
                          const { data } = await request.get('wechat/offiaccount/user', {
                            params: {
                              pageSize: 50,
                              level: 1,
                              account_id: offiaccount_account_id,
                              keyword: searchval,
                              'select[]': ['nickname', 'openid'],
                            },
                          });
                          return data;
                        },
                        fieldNames: {
                          label: 'nickname',
                          value: 'openid',
                        },
                        mode: 'multiple',
                      },

                      formItemProps: {
                        rules: [{ required: true }],
                      },
                    },
                  ];
                }
                return [];
              },
            },
            {
              title: '微信支付选择',
              dataIndex: 'pay',
              request: searchPay,
              valueType: 'select',
              fieldProps: {
                fieldNames: {
                  label: 'name',
                  value: 'id',
                },
              },
              formItemProps: {
                rules: [{ required: true }],
              },
            },

            {
              title: '客户端首页轮播',
              dataIndex: 'user_banner',
              valueType: 'saEditorTable',
              fieldProps: {
                columns: [
                  {
                    title: '图片',
                    dataIndex: 'pic',
                    valueType: 'uploader',
                  },
                  {
                    title: '跳转路径',
                    dataIndex: 'path',
                  },
                ],
              },
            },
          ],
        },
      ]}
      url="setting/base"
      msgcls={false}
      formTitle={false}
    />
  );
};
