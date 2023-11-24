import {
  DoubleRightOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  EditableFormInstance,
  EditableProTable,
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormList,
  ProFormText,
} from '@ant-design/pro-components';
import { App, Button, InputNumber, Space, Switch, Tooltip } from 'antd';
import React, { FC, useEffect, useRef, useState } from 'react';
import ButtonDrawer from '../action/buttonDrawer';
import { isStr } from '../checkers';
import { saFormColumnsType, uid } from '../helpers';
const getData = (attributes: any[], values: any) => {
  const tableRows: any[] = [];
  const editableKeys: React.Key[] = [];
  var data: any[] = [],
    table = [[]];
  attributes?.forEach((attr) => {
    const temp: any[] = [];
    attr.items?.forEach((row) => {
      const rowId = uid();

      temp.push({ id: row.id ? row.id : rowId, ...row, group: attr.id });
    });
    data.push(temp);
  });
  data.forEach(function (rows) {
    var temp = [];
    table.forEach(function (line) {
      rows.forEach(function (item) {
        temp.push(line.concat(item));
      });
    });
    table = temp;
  });
  table.forEach((rowField) => {
    const item = {};
    const rowId = [];
    rowField.forEach((f) => {
      item[f.group] = f.name;
      //log('set feild', f);
      rowId.push(f.id);
    });
    const nowId = rowId.join(':');
    //检测是否有值了
    const hasValue = values?.find((v) => v.id == nowId);
    tableRows.push({
      ...hasValue,
      ...item,
      id: nowId,
    });
    editableKeys.push(nowId);
  });

  return [tableRows, editableKeys];
};

const columnsName: Array<{ title: string; name: string; required?: boolean; prefix?: string }> = [
  { title: '价格', name: 'price', required: true, prefix: '￥' },
  { title: '库存', name: 'sku', required: true, prefix: '' },
  { title: '市场价', name: 'old_price', prefix: '￥' },
  { title: '结算价', name: 'jiesuan_price', prefix: '￥' },
  { title: '成本价', name: 'chengben_price', prefix: '￥' },
  { title: '每次最大购买', name: 'max', prefix: '' },
];

const PiliangInput = (props) => {
  const { name, action } = props;
  const [value, setValue] = useState<any>();
  return (
    <InputNumber
      style={{ width: '100%' }}
      size="small"
      onChange={(v) => {
        setValue(v);
      }}
      addonAfter={
        <DoubleRightOutlined
          title="批量设置"
          onClick={() => {
            //log('pliang value', piliang);
            action(name, value);
          }}
          style={{ cursor: 'pointer' }}
          rotate={90}
        />
      }
    />
  );
};

const getColumnsName = (_columns: Array<an>) => {
  let _columnsName = [];
  if (_columns.length == 0) {
    //默认全部字段都选择
    _columnsName = columnsName;
  } else {
    _columnsName = _columns
      .map((item) => {
        if (isStr(item)) {
          //读取预设置的字段
          return columnsName.find((v) => v.name == item);
        } else {
          //自定义字段
          return item;
        }
      })
      .filter((v) => v);
  }
  return _columnsName;
};

const getColumns = (
  attributes: any[],
  piliangAction: (value: string, v: number) => void,
  _columnsName: any[] = [],
) => {
  const columns: any[] = [];
  attributes?.forEach((attr) => {
    columns.push({
      title: attr.name,
      dataIndex: attr.id,
      readonly: true,
    });
  });

  columns.push({
    title: '图片',
    dataIndex: 'titlepic',
    valueType: 'uploader',
    fieldProps: {
      buttonType: 'table',
    },
  });

  const normalColumns: saFormColumnsType = _columnsName.map((item) => {
    return {
      title: (
        <>
          {item.tooltip ? <Tooltip title={item.tooltip}>{item.title}</Tooltip> : item.title}
          <br />
          <PiliangInput name={item.name} action={piliangAction} />
        </>
      ),
      dataIndex: item.name,
      valueType: 'digit',
      fieldProps: { prefix: item.prefix, style: { width: '100%' } },
      formItemProps: item.required?{
        rules: [
          {
            required: true,
            message: '此项必填',
          },
        ],
      }:false,
    };
  });

  return columns.concat(normalColumns);
};

const GuigeTable: FC<{
  formRef?: any;
  tableForm?: any;
  isSync?: number;
  columns?: any[]; //自定义列表字段设置
}> = (props) => {
  const { isSync, formRef, tableForm, columns: ccolumns = [] } = props;
  const [editableKeys, setEditableKeys] = useState([]);
  //const [tableRows, editableKeys] = getData(items, formRef?.current?.getFieldValue('attrs'));
  const [datas, setDatas] = useState<Array<any>>([]);
  const [columns, setColumns] = useState<Array<any>>([]);
  const getGuiges = (value: any) => {
    setDatas([...value]);
    //console.log('form set value', value, datas);
    formRef?.current?.setFieldValue('attrs', value);
  };

  const parseTable = (setValue?: boolean) => {
    const attrs = formRef.current?.getFieldValue('attrs');
    const items = formRef.current?.getFieldValue('items');
    //console.log('form get attrs and items are', attrs, items);
    const [_datas, editableKeys] = getData(items, attrs);
    setDatas([..._datas]);
    setEditableKeys([...editableKeys]);
    formRef.current?.setFieldValue('attrs', [..._datas]);
  };

  useEffect(() => {
    if (isSync) {
      //手动更新 必定有form
      parseTable(true);
    } else {
      if (formRef.current) {
        //初始化 如果form已经有了  才初始化
        parseTable();
      }
    }
  }, [isSync, formRef]);

  useEffect(() => {
    //console.log('now datas is ', datas);
    if (datas.length > 0) {
      const items = formRef.current?.getFieldValue('items');
      setColumns(
        getColumns(
          items,
          (name: string, value: number) => {
            //console.log('old data', datas, name, value, columns);
            datas?.forEach((v) => {
              v[name] = value;
            });
            getGuiges([...datas]);
          },
          getColumnsName(ccolumns),
        ),
      );
    }
  }, [datas]);
  return (
    <EditableProTable
      columns={columns}
      value={datas}
      onChange={(v) => {
        getGuiges([...v]);
      }}
      controlled={true}
      rowKey="id"
      editable={{
        type: 'multiple',
        editableKeys,
        onValuesChange: (record, recordList) => {
          //console.log('onValuesChange', recordList);
          getGuiges([...recordList]);
        },
      }}
      recordCreatorProps={false}
      editableFormRef={tableForm}
    />
  );
};

const GuigePanel: FC<{
  value?: any;
  contentRender?: any;
  setOpen?: any;
  onChange?: any;
  columns?: any[];
}> = (props) => {
  const { value, contentRender, setOpen, onChange, columns = [] } = props;
  const { message } = App.useApp();
  const formRef = useRef();
  const tableForm = useRef<EditableFormInstance>();
  const [isSync, setIsSync] = useState(0);

  return (
    <ProForm
      formRef={formRef}
      initialValues={value}
      contentRender={contentRender}
      submitter={{
        searchConfig: { resetText: '取消' },
        resetButtonProps: {
          onClick: () => {
            setOpen?.(false);
          },
        },
      }}
      onFinish={async (v) => {
        try {
          await tableForm.current?.validateFields();
        } catch (errorInfo) {
          return;
        }
        //这里将未设置的值过滤掉

        //console.log('submit here unparse v is ', v);

        const items = [];
        const attrs = [];
        const items_id = [];
        v.items.forEach((item) => {
          if (item.name) {
            const _items = [];
            item.items.forEach((_item) => {
              if (_item.name) {
                _items.push(_item);
              }
            });
            if (_items.length > 0) {
              item.items = _items;
              items_id.push(item.id);
              items.push(item);
            }
          }
        });

        v.attrs.forEach((attr) => {
          let no_name = false;
          items_id.forEach((id) => {
            if (!attr[id] && !attr.id) {
              //没有规格值的时候 不会将数据加入
              //console.log('noname is ', id);
              no_name = true;
            } else {
              //有数据 先将规格id的值删掉，后台直接自动读取规格属性值
              delete attr[id];
            }
          });
          if (!no_name) {
            attrs.push(attr);
          }
        });

        //log('items:', items, 'attrs', attrs);
        const newValue = { items, attrs, open: true };
        onChange?.(newValue);
        //console.log('submit here v is ', newValue);
        setOpen(false);
      }}
    >
      <ProFormList
        name="items"
        label="规格属性"
        creatorButtonProps={{
          creatorButtonText: '添加规格项',
        }}
        min={1}
        copyIconProps={false}
        itemRender={({ listDom, action }, { index }) => (
          <ProCard
            bordered
            style={{ marginBlockEnd: 8 }}
            title={
              <ProFormText
                style={{ padding: 0 }}
                rules={[{ required: true }]}
                width="md"
                name="name"
                label="规格名"
              />
            }
            extra={action}
            bodyStyle={{ paddingBlockEnd: 0 }}
          >
            {listDom}
          </ProCard>
        )}
        creatorRecord={() => ({ name: '', items: [{ name: '', id: uid() }], id: uid() })}
        //initialValue={[{ name: '', items: [{ name: '', id: uid() }], id: uid() }]}
      >
        <ProFormList
          label="规格值"
          name="items"
          creatorRecord={() => ({ name: '', id: uid() })}
          creatorButtonProps={{
            creatorButtonText: '新建',
            icon: <PlusCircleOutlined />,
            type: 'link',
            style: { width: 'unset' },
          }}
          min={1}
          copyIconProps={false}
          deleteIconProps={{ tooltipText: '删除' }}
          itemRender={({ listDom, action }) => (
            <div
              style={{
                display: 'inline-flex',
                marginInlineEnd: 25,
              }}
            >
              {listDom}
              {action}
            </div>
          )}
        >
          <ProFormText allowClear={false} width="xs" rules={[{ required: true }]} name={['name']} />
        </ProFormList>
      </ProFormList>
      <ProFormText name="attrs" hidden />
      <ProForm.Item
        label={
          <Space>
            <span>规格详情</span>
            <Button
              onClick={() => {
                setIsSync(isSync + 1);
              }}
              icon={<SyncOutlined />}
            >
              同步属性
            </Button>
          </Space>
        }
      >
        <GuigeTable isSync={isSync} formRef={formRef} tableForm={tableForm} columns={columns} />
      </ProForm.Item>
    </ProForm>
  );
};

export const Guiges = (props) => {
  //const [tableFormRef] = Form.useForm();
  const [openValue, setOpenValue] = useState(false);
  const value = props.value
    ? typeof props.value == 'string'
      ? JSON.parse(props.value)
      : props.value
    : { items: [{ name: '', items: [{ name: '', id: uid() }], id: uid() }] };
  //log('inner value is', value);
  const [hidden, setHidden] = useState(value.open ? false : true);
  const { columns = [] } = props;
  const columnsName = getColumnsName(columns);
  return (
    <>
      {hidden && (
        <ProForm.Group>
          {columnsName.map((item) => {
            return (
              <ProForm.Item
                key={item.name}
                label={item.title}
                required={item.required}
                tooltip={item.tooltip}
              >
                <ProFormDigit name={item.name} width="xs" />
              </ProForm.Item>
            );
          })}
        </ProForm.Group>
      )}
      <ProForm.Item label="开启多规格">
        <Space>
          <Switch
            checked={value.open ? true : false}
            onChange={(v) => {
              setHidden(v ? false : true);
              props.onChange?.({ ...value, open: v });
            }}
          />
          <ButtonDrawer
            trigger={
              <Button icon={<SettingOutlined />} disabled={hidden}>
                点击配置
              </Button>
            }
            afterOpenChange={(open) => {
              setOpenValue(open);
            }}
            open={openValue}
            width={1200}
            title="规格参数设置"
          >
            <GuigePanel value={value} onChange={props.onChange} columns={columns} />
          </ButtonDrawer>
        </Space>
      </ProForm.Item>
    </>
  );
};

export default GuigePanel;
