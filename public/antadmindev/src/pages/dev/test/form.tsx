import PostsForm from '@/components/Sadmin/posts/post';

export default () => {
  const tabs = [
    {
      tab: {
        title: '客户信息',
      },
      formColumns: [
        'id',
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'sn1',
              title: '订单编号',
              fieldProps: {
                disabled: true,
                placeholder: '请输入订单编号',
              },
              tooltip: '如未填写，提交后会自动生成订单号',
              disabled: true,
              width: 148,
            },
            {
              dataIndex: 'sn2',
              title: '-',
              fieldProps: {
                placeholder: '请输入-',
              },
              width: 148,
            },
            {
              dataIndex: 'sn3',
              title: '-',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                placeholder: '请输入-',
              },
              width: 148,
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'quhuo_id',
              title: '取货方式',
              valueType: 'select',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                fieldNames: {
                  label: 'title',
                  value: 'id',
                },
                placeholder: '请选择取货方式',
              },
              requestDataName: 'quhuo_ids',
              width: 'md',
            },
            {
              dataIndex: 'peisong_date',
              title: '预约发货日期',
              valueType: 'date',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                placeholder: '请输入预约发货日期',
              },
              width: 'md',
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: ['wuliu', 'area'],
              title: '所属行政区',
              valueType: 'pca',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                level: 1,
                topCode: '360000,360100',
                placeholder: '请输入所属行政区',
              },
              width: 'md',
            },
            {
              dataIndex: ['wuliu', 'address'],
              title: '详细地址',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                placeholder: '请输入详细地址',
              },
              width: 'md',
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: ['wuliu', 'type_id'],
              title: '楼房性质',
              valueType: 'select',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                fieldNames: {
                  label: 'title',
                  value: 'id',
                },
                placeholder: '请选择楼房性质',
              },
              requestDataName: ['wuliu', 'type_ids'],
              width: 'md',
            },
            {
              dataIndex: ['wuliu', 'lptype_id'],
              title: '楼盘性质',
              valueType: 'select',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                fieldNames: {
                  label: 'title',
                  value: 'id',
                },
                placeholder: '请选择楼盘性质',
              },
              requestDataName: ['wuliu', 'lptype_ids'],
              width: 'md',
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: ['wuliu', 'username'],
              title: '联系人',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                placeholder: '请输入联系人',
              },
              width: 'md',
            },
            {
              dataIndex: ['wuliu', 'mobile'],
              title: '联系电话',
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
              fieldProps: {
                placeholder: '请输入联系电话',
              },
              width: 'md',
            },
          ],
        },
      ],
    },
    {
      tab: {
        title: '商品信息',
      },
      formColumns: [
        {
          dataIndex: 'goodss',
          valueType: 'saFormTable',
          fieldProps: {
            readonly: '{{record.state_id && record.state_id != 1}}',
            alwaysenable: true,
            path: 'order/goods',
            foreign_key: 'order_id',
            local_key: 'id',
            name: '订单商品',
            placeholder: '请输入订单商品',
          },
        },
      ],
    },
    {
      tab: {
        title: '提交订单',
      },
      formColumns: [
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'price',
              title: '订单金额',
              valueType: 'digit',
              width: 'md',
              fieldProps: {
                placeholder: '请输入订单金额',
              },
            },
            {
              dataIndex: 'cheyun_fee',
              title: '车运费',
              valueType: 'digit',
              width: 'md',
              fieldProps: {
                placeholder: '请输入车运费',
              },
            },
          ],
        },
        {
          dataIndex: 'desc',
          title: '备注',
          valueType: 'textarea',
          fieldProps: {
            rows: 4,
            placeholder: '请输入备注',
          },
        },
      ],
    },
  ];
  return (
    <PostsForm
      formTitle={false}
      setting={{ steps_form: true }}
      tabs={tabs}
      url="order/order/show"
      match={true}
      dataId={0}
    />
  );
};
