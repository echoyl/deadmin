import ConfirmForm from '@/components/Sadmin/action/confirmForm';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { FC } from 'react';
interface SaReord {
  [key: string]: any;
}
const QuickCreate: FC<{ menus: SaReord; models: SaReord; foldermodels: SaReord }> = (props) => {
  const { menus, models, foldermodels } = props;
  return (
    <ConfirmForm
      key="quick_button"
      trigger={
        <Button key="quick_button" icon={<ThunderboltOutlined />}>
          快速创建
        </Button>
      }
      msg="快速创建内容模块"
      value={{}}
      formColumns={[
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'type',
              title: '类型',
              width: 'md',
              valueType: 'select',
              fieldProps: {
                options: [
                  { label: '内容模块', value: 'posts' },
                  { label: '角色用户', value: 'perm' },
                ],
              },
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: '类型为必填',
                  },
                ],
              },
            },
            {
              valueType: 'dependency',
              name: ['type'],
              columns: ({ type }) => {
                if (type == 'posts') {
                  return [
                    {
                      title: '指定已有分类模型',
                      dataIndex: 'category_id',
                      valueType: 'treeSelect',
                      fieldProps: {
                        options: models,
                        treeLine: { showLeafIcon: true },
                        treeDefaultExpandAll: true,
                        placeholder: '不选择的自动创建新的分类模型',
                      },
                      width: 'md',
                    },
                  ];
                }
                return [];
              },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'title',
              title: '内容名称',
              width: 'md',
            },
            {
              dataIndex: 'name',
              title: '路径名称',
              width: 'md',
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'model_to_id',
              width: 'md',
              title: '模型创建到',
              valueType: 'treeSelect',
              fieldProps: {
                options: foldermodels,
                treeLine: { showLeafIcon: true },
                treeDefaultExpandAll: true,
                placeholder: '不选择的话创建到根',
              },
            },
            {
              dataIndex: 'menu_to_id',
              width: 'md',
              title: '菜单创建到',
              valueType: 'treeSelect',
              fieldProps: {
                options: menus,
                treeLine: { showLeafIcon: true },
                treeDefaultExpandAll: true,
                placeholder: '不选择的话创建到根',
              },
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              dataIndex: 'category_level',
              title: '分类层级',
              fieldProps: {
                defaultValue: 1,
              },
              valueType: 'digit',
              width: 'md',
            },
            {
              dataIndex: 'category_type',
              title: '分类类型',
              width: 'md',
              valueType: 'radioButton',
              fieldProps: {
                defaultValue: 'single',
                options: [
                  { label: '单选', value: 'single' },
                  { label: '多选', value: 'multiple' },
                ],
              },
            },
          ],
        },
      ]}
      url="dev/model/quickCreate"
      callback={(ret) => {
        //location.reload();
        if (!ret) {
          return;
        }
        if (!ret.code) {
          location.reload();
          //actionRef?.current?.reload();
        }
      }}
    />
  );
};

export default QuickCreate;
