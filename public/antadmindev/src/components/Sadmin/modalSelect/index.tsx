import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { CheckCard } from '@ant-design/pro-components';
import { App, Modal, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { inArray, isArr, isUndefined } from '../checkers';
import { getBread, getFromObject } from '../helpers';
import SaTable, { SaContext } from '../posts/table';

const ModalSelect = (props) => {
  const defaultFieldNames = {
    avatar: ['titlepic', 0, 'url'],
    description: 'desc',
    title: 'title',
  };
  const {
    width = 1200,
    multiple = false,
    dataName = 'data', //只在多选的情况下才会设置 用户存放所选数据 字段名
    onChange,
    fieldNames = defaultFieldNames,
    columns = [],
    query: iquery,
    url,
    title = '请选择',
    name,
    relationname,
    page, //新增 直接读取 已有页面的配置
    max = 9,
  } = props;
  const { formRef } = useContext(SaContext);
  let breadTableColumns = [];
  let breadUrl = '';
  const { message } = App.useApp();

  if (page) {
    const bread = getBread(page.path);
    if (bread) {
      breadTableColumns = bread?.data?.tableColumns?.filter((v) => {
        if (page?.columns) {
          return inArray(v.dataIndex, page?.columns) > -1;
        } else {
          return (
            inArray(v.dataIndex, ['state', 'created_at']) < 0 &&
            inArray(v, ['option', 'displayorder']) < 0
          );
        }
      });
      breadUrl = bread?.data.url;
    }

    //message.error({ content: '无' + page.path + '页面权限', key: 'modal_select_error' });
  }

  const [query, setQuery] = useState({});
  const [getData, setGetData] = useState(false); //是否已经通过form获取了数据信息

  const [open, setOpen] = useState(false);
  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    //点击确认选择关闭弹层赋值
    if (selectItems.length < 1) {
      message.error('请选择选项');
      return;
    }
    //单选和多选的话都 选择对象
    //onChange?.(selectItems);
    if (multiple) {
      //多选的话传输数据类型为对象非id
      onChange?.(selectItems);
    } else {
      onChange?.(selectItems[0]);
    }

    setSelectedItems([...selectItems]);
    setOpen(false);
  };
  const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
    setOpen(false);
  };
  //列表中选中的项
  const [selectItems, setSelectItems] = useState([]);
  //点击确认后选中的项
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (formRef?.current && !getData) {
      const selected = relationname
        ? formRef?.current?.getFieldValue?.(relationname)
        : formRef?.current?.getFieldValue?.(name);

      //console.log('modalselect formRef name value:', name, selected, formRef);
      const parseValue = selected
        ? multiple
          ? isArr(selected)
            ? selected
            : [selected]
          : [selected]
        : [];
      //console.log('selected', selected, props);
      const query: { [key: string]: any } = {};
      const formValues = formRef.current?.getFieldsValue?.(true);
      for (let i in iquery) {
        if (!isUndefined(formValues[iquery[i]])) {
          query[i] = formValues[iquery[i]];
        } else {
          query[i] = iquery[i];
        }
      }
      setSelectItems(parseValue);
      setSelectedItems(parseValue);
      setQuery(query);
      setGetData(true);
    }
  }, [formRef?.current]);

  //选择选项的事件 处理
  const checkEvent = (record) => {
    if (multiple) {
      //多选 将数据放入 fieldname 是data中
      const has_index = selectItems.findIndex((v) => v[dataName]?.id == record.id);
      if (has_index >= 0) {
        //有删除
        selectItems.splice(has_index, 1);
        setSelectItems([...selectItems]);
      } else {
        //没有添加
        //添加时检测最大数量
        if (max && selectItems.length >= max) {
          message.info('最大可选取数量为' + max);
        } else {
          selectItems.push({ id: 0, [dataName]: record });
          setSelectItems([...selectItems]);
        }
      }
    } else {
      //单选
      setSelectItems([record]);
    }
  };
  const radioSelect = {
    title: '操作',
    dataIndex: 'id',
    width: 120,
    search: false,
    render: (text, record, _, action) => {
      const selected_index: number = multiple
        ? selectItems.findIndex((v) => v[dataName]?.id == record.id)
        : selectItems.findIndex((v) => v.id == record.id);
      if (selected_index >= 0) {
        if (multiple) {
          return (
            <CheckCircleOutlined
              onClick={() => {
                checkEvent(record);
              }}
              style={{ color: '#52c41a', fontSize: 18 }}
            />
          );
        } else {
          return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
        }
      } else {
        return (
          <a
            onClick={() => {
              checkEvent(record);
            }}
          >
            选择
          </a>
        );
      }
    },
  };
  const closeItem = (index) => {
    const deleteItem = selectedItems[index];
    const innerIndex = selectItems.findIndex((v) => deleteItem.id == v.id);
    selectedItems.splice(index, 1);
    setSelectedItems([...selectedItems]);
    if (innerIndex > -1) {
      //如果弹层列表中有该删除的选项 才将他删除
      selectItems.splice(innerIndex, 1);
      setSelectItems([...selectItems]);
    }

    if (multiple) {
      //多选的话传输数据类型为对象非id
      onChange?.(selectItems);
    } else {
      onChange?.(0);
    }
  };
  const selectButton = (
    <div
      className="sa-select-button"
      onClick={() => {
        setOpen(true);
      }}
    >
      <div className="sa-select-button-select">
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 4 }}>选择</div>
        </div>
      </div>
    </div>
  );
  return (
    <>
      <ModalSelectList
        multiple={multiple}
        dataName={dataName}
        button={selectButton}
        items={selectedItems}
        close={closeItem}
        fieldNames={{ ...defaultFieldNames, ...fieldNames }}
        max={max}
      />
      <Modal
        width={width}
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        title={title}
        okButtonProps={{ disabled: selectItems.length > 0 ? false : true }}
      >
        <SaTable
          url={url ? url : breadUrl}
          paramExtra={query}
          tableColumns={[...breadTableColumns, ...columns, radioSelect]}
          addable={false}
          deleteable={false}
          pageType="drawer"
          openType="drawer"
          checkEnable={false}
          tableProps={{
            //pagination: { pageSize: 20 },
            scroll: { y: 400 },
            size: 'small',
            className: 'sa-modal-table',
          }}
        />
      </Modal>
    </>
  );
};
const ModalSelectList = (props) => {
  const {
    items,
    close,
    button,
    multiple = false,
    dataName = 'data',
    fieldNames = { avatar: 'avatar', description: 'description', title: 'title' },
    max,
  } = props;
  const { Paragraph } = Typography;
  return (
    <>
      {items?.map((item, i) => {
        //多选的话显示的数据是关联数据信息
        const data = multiple ? item[dataName] : item;
        return (
          <CheckCard
            key={i}
            checked={false}
            title={getFromObject(data, fieldNames.title)}
            avatar={getFromObject(data, fieldNames.avatar)}
            description={
              <Paragraph ellipsis={{ rows: 2 }}>
                {getFromObject(data, fieldNames.description)}
              </Paragraph>
            }
            extra={
              <CloseCircleOutlined
                onClick={() => {
                  close(i);
                }}
              />
            }
            style={{ height: 98 }}
            size="small"
          />
        );
      })}
      {(multiple && max && max > items.length) || items.length == 0 ? button : ''}
    </>
  );
};
export const ModalSelectRender = (text, props) => {
  //这不是函数组件 不能使用hook

  //console.log(text, props.record, formRef, formRef.current?.getFieldValue('shop'));
  //获取显示的数据
  const { fieldProps } = props;
  const { name = '', query = {}, multiple = false } = fieldProps;
  //console.log('render', props);
  return (
    <ModalSelect
      //parseValue={selected ? (multiple ? selected : [selected]) : []}
      {...props.fieldProps}
      //formItemProps={{ ...props.formItemProps }}
      query={query}
    />
  );
};
export default ModalSelect;
