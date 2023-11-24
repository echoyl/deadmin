import { PlusCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { BetaSchemaForm, DrawerForm } from '@ant-design/pro-components';
import { useSearchParams } from '@umijs/max';
import { App, Button, Space } from 'antd';
import { FC, useRef, useState } from 'react';
import { isDev, saValueTypeMapType } from '../helpers';
const JsonForm: FC<{
  height?: number;
  value?: { config: any[]; value: any };
  onChange?: (value: any) => void;
}> = (props) => {
  const [openValue, setOpenValue] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const { value = { config: [], value: {} } } = props;
  //console.log('json form init props', props);
  const [config, setConfig] = useState(value ? value.config : []);
  const [searchParams] = useSearchParams();

  const configFormRef = useRef();

  const rowType = (type: string): saValueTypeMapType => {
    if (type == '2') {
      return {
        title: '',
        dataIndex: '',
        valueType: '',
        formItemProps: {
          rules: [
            {
              required: true,
              message: '请输入',
            },
          ],
        },
        fieldProps: {
          placeholder: '请输入',
        },
      };
    } else if (type == '3') {
      return {
        title: '',
        dataIndex: '',
        valueType: 'formList',
        columns: [
          {
            valueType: 'group',
            columns: [
              {
                title: '',
                dataIndex: '',
              },
            ],
          },
        ],
      };
    } else if (type == '4') {
      return {
        title: '',
        dataIndex: '',
        valueType: 'saEditorTable',
        fieldProps: {
          columns: [
            {
              title: '',
              dataIndex: '',
            },
          ],
        },
      };
    } else {
      return {
        title: '',
        dataIndex: '',
      };
    }
  };
  const addRow = (type: string): void => {
    const row = rowType(type);
    const nowConfig = configFormRef.current?.getFieldValue('config');
    configFormRef.current?.resetFields();
    nowConfig.push(row);
    configFormRef.current?.setFieldsValue({ config: [...nowConfig] });
  };
  const { message } = App.useApp();
  return (
    <>
      <Space>
        {config.length > 0 && (
          <Button
            icon={<SettingOutlined />}
            onClick={() => {
              if (config.length < 1) {
                message.error('未初始化配置');
                return;
              }
              setOpenValue(true);
            }}
          >
            点击配置页面
          </Button>
        )}
        {config.length <= 0 && '-'}

        {(isDev() || searchParams.get('dev') == '1') && (
          <Button
            onClick={() => {
              setOpenConfig(true);
            }}
          >
            开发者工具
          </Button>
        )}
      </Space>
      <DrawerForm
        title="页面编辑"
        width={1200}
        visible={openValue}
        initialValues={value?.value}
        onVisibleChange={(open) => {
          setOpenValue(open);
        }}
        onFinish={async (v) => {
          console.log('新值', {
            config: config,
            value: v,
          });
          setOpenValue(false);
          props.onChange?.({
            config: config,
            value: v,
          });
          return;
        }}
      >
        <BetaSchemaForm layoutType="Embed" columns={config} />
      </DrawerForm>
      <DrawerForm
        title="页面配置"
        width={1000}
        visible={openConfig}
        onVisibleChange={(open) => {
          setOpenConfig(open);
        }}
        initialValues={{ config: config }}
        onFinish={async (v) => {
          console.log(v);
          setConfig(v.config);
          setOpenConfig(false);
          setOpenValue(true);
          return true;
        }}
        formRef={configFormRef}
      >
        <BetaSchemaForm
          layoutType="Embed"
          onFinish={async (values) => {
            console.log(values);
          }}
          columns={[
            {
              title: (
                <Space>
                  <span>配置信息</span>
                  <Button onClick={() => addRow('1')} size="small" icon={<PlusCircleOutlined />}>
                    一行
                  </Button>
                  <Button onClick={() => addRow('2')} size="small">
                    复杂的
                  </Button>
                  <Button onClick={() => addRow('3')} size="small">
                    formList
                  </Button>
                  <Button onClick={() => addRow('4')} size="small">
                    editorTable
                  </Button>
                </Space>
              ),
              dataIndex: 'config',
              valueType: 'jsonEditor',
              fieldProps: { height: 700 },
            },
          ]}
        />
      </DrawerForm>
    </>
  );
};

export default JsonForm;
