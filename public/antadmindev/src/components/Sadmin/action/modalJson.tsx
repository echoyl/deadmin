import { ModalForm, ProFormItem, ProFormTextArea } from '@ant-design/pro-components';
import { Button } from 'antd';
import { FC } from 'react';
import JsonEditor from '../jsonEditor';

const ModalJson: FC<{
  title?: string;
  onChange?: (value: any) => void;
  value?: any;
  type?: string;
  trigger?: React.ReactNode;
}> = (props) => {
  const { title = '点击编辑', value, type = 'json', trigger } = props;

  const button = <Button>{title}</Button>;

  return (
    <ModalForm
      trigger={trigger ? trigger : button}
      title="请输入设置"
      initialValues={{ content: value }}
      onFinish={async (values) => {
        //console.log(values);
        props.onChange?.(values.content);
        return true;
      }}
    >
      <ProFormItem name="content">
        {type == 'json' ? <JsonEditor /> : <ProFormTextArea />}
      </ProFormItem>
    </ModalForm>
  );
};

export default ModalJson;
