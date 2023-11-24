import { saFormColumnsType } from '@/components/Sadmin/helpers';
import { SaForm } from '@/components/Sadmin/posts/post';
import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ProFormInstance } from '@ant-design/pro-components';
import { Input, InputRef, Space, Tag, theme, Tooltip } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';

import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core/dist/types/index';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';

export const MenuOther = (props) => {
  const { model, setOpen, actionRef, contentRender } = props;
  const formRef = useRef<ProFormInstance>();
  return (
    <SaForm
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
          dataIndex: 'other_config',
          valueType: 'jsonEditor',
          title: '配置信息',
          fieldProps: { height: 700 },
        },
      ]}
      formRef={formRef}
      paramExtra={{ id: model?.id }}
      url="dev/menu/show"
      postUrl="dev/menu/otherConfig"
      showTabs={false}
      submitter="dom"
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

export default (props) => {
  const { model, setOpen, actionRef, contentRender } = props;
  const [modelColumns, setModelColumns] = useState<[{ [key: string]: any }]>();
  const [relationModel, setRelationModel] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const formMoreType = [
    { label: '编辑表格 - saFormTable', value: 'saFormTable' },
    { label: '自定义显示 - customerColumn', value: 'customerColumn' },
    { label: '属性配置 - jsonForm', value: 'jsonForm' },
    { label: '多行编辑 - formList', value: 'formList' },
    { label: 'json编辑器 - jsonEditor', value: 'jsonEditor' },
    { label: 'jsonCode', value: 'jsonCode' },
    { label: '头像显示 - avatar', value: 'avatar' },
    { label: '弹层选择器 - modalSelect', value: 'modalSelect' },
    { label: '富文本 - tinyEditor', value: 'tinyEditor' },
    { label: '规格编辑 - guigePanel', value: 'guigePanel' },
    { label: '权限配置 - permGroup', value: 'permGroup' },
    { label: '自定义 - cdependency', value: 'cdependency' },
    { label: '微信自定义菜单 - wxMenu', value: 'wxMenu' },
    { label: '穿梭框 - saTransfer', value: 'saTransfer' },
    { label: 'html显示', value: 'html' },
    { label: '地图点显示 - tmapShow', value: 'tmapShow' },
  ];
  const dfColumns: saFormColumnsType = [
    {
      dataIndex: 'columns',
      valueType: 'formList',
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: '字段选择',
              valueType: 'cascader',
              dataIndex: 'key',
              width: 240,
              fieldProps: {
                options: modelColumns,
                showSearch: true,
                changeOnSelect: true,
              },
            },
            {
              dataIndex: 'props',
              title: '更多配置',
              valueType: 'customerColumnDev',
              fieldProps: {
                relationModel,
                allMenus,
              },
              width: 160,
            },
            {
              dataIndex: 'type',
              title: '表单类型',
              width: 'sm',
              valueType: 'select',
              fieldProps: {
                options: formMoreType,
                placeholder: '请选择表单额外类型',
              },
            },
            // {
            //   title: '自定义title',
            //   dataIndex: 'title',
            //   width: 120,
            // },
            // {
            //   title: '关联属性字段',
            //   dataIndex: 'label',
            //   width: 120,
            // },
            {
              dataIndex: 'readonly',
              title: '是否只读',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'readonly',
                unCheckedChildren: 'readonly',
                defaultChecked: false,
              },
            },
            {
              dataIndex: 'required',
              title: '是否必填',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'required',
                unCheckedChildren: 'required',
                defaultChecked: false,
              },
            },
            {
              dataIndex: 'hidden',
              title: '是否隐藏',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'hidden',
                unCheckedChildren: 'hidden',
                defaultChecked: false,
              },
            },
            {
              dataIndex: 'disabled',
              title: '是否禁用',
              valueType: 'switch',
              fieldProps: {
                checkedChildren: 'disabled',
                unCheckedChildren: 'disabled',
                defaultChecked: false,
              },
            },
            // {
            //   title: 'placeholder',
            //   dataIndex: 'placeholder',
            // },

            // {
            //   dataIndex: 'name',
            //   title: '额外信息',
            //   valueType: 'modalJson',
            //   fieldProps: {
            //     placeholder:
            //       '如果是with数据 请输入要显示关联数据的字段名称 多级用.拼接',
            //   },
            // },
          ],
        },
      ],
    },
    // {
    //   dataIndex: 'key',
    //   valueType: 'select',
    //   width: 'xl',
    //   fieldProps: {
    //     options: modelColumns,
    //     mode: 'multiple',
    //   },
    // },
  ];
  const [tabs, setTabs] = useState([]);
  const [tags, setTags] = useState<Array<{ [key: string]: any }>>([]);
  const [tabIndex, setTabIndex] = useState('0');
  const formRef = useRef<ProFormInstance>();
  useEffect(() => {
    onTagsChange(tags);
  }, [tags]);

  const onTagsChange = (tags: Array<{ [key: string]: any }>) => {
    //如果有deleteIndex 删除的标签index 需要先删除这个tab再设置
    // if (!isUndefined(deleteIndex)) {
    //   tabs?.map((tag, i) => {
    //     if (deleteIndex <= i && i + 1 <= tabs?.length) {
    //       //往后推一格
    //       const name = `form_config${i == 0 ? '' : i}`;
    //       const next_name = `form_config${i+1 == 0 ? '' : i+1}`;
    //       const next_value = formRef?.current?.getFieldValue(next_name);
    //       formRef?.current?.setFieldValue(name, next_value);
    //     }
    //   });
    // }
    //console.log('now tags is', tags);
    const newTabs = tags
      ?.map((tag, i) => {
        if (tag.hidden) {
          return null;
        }
        const cl = {
          dataIndex: `form_config${i == 0 ? '' : i}`,
          valueType: 'saFormList',
          columns: [...dfColumns],
        };
        return {
          title: tag.title,
          formColumns: i == 0 ? ['id', cl] : [cl],
        };
      })
      .filter((v) => v);
    //console.log(newTabs);
    setTabs(newTabs);
    setTags(tags);
  };
  return (
    <>
      <Space>
        <EditTag
          tags={tags}
          onChange={(tags) => {
            onTagsChange(tags);
          }}
          formRef={formRef}
        />
        <Tooltip title="清空当前tab的值">
          <DeleteOutlined
            onClick={() => {
              const key = 'form_config' + (tabIndex == '0' ? '' : tabIndex);
              formRef.current?.setFieldValue(key, []);
            }}
          />
        </Tooltip>
      </Space>
      <br />
      <SaForm
        onTabChange={(index) => {
          setTabIndex(index);
        }}
        beforeGet={(data) => {
          const oldModelColumns = data.admin_model?.columns;
          if (!data.form_config) {
            data.form_config = oldModelColumns.map((v) => {
              return { columns: [{ key: v.name }] };
            });
          }
          setAllMenus(data.menus);

          if (data.admin_model) {
            const foreignOptions = oldModelColumns.map((v) => ({
              label: [v.title, v.name].join(' - '),
              value: v.name,
            }));
            const manyFields = data.admin_model.relations
              ?.filter((v) => v.type == 'one' || v.type == 'many')
              .map((v) => {
                const foreign_model_columns = JSON.parse(v.foreign_model.columns);
                const children = foreign_model_columns.map((v) => ({
                  label: [v.title, v.name].join(' - '),
                  value: v.name,
                }));
                return {
                  label: [v.title, v.name, v.type == 'one' ? 'hasOne' : 'hasMany'].join(' - '),
                  value: v.name,
                  children: children,
                };
              });
            //设置form表单需要选择的字段
            setRelationModel(manyFields);
            const modelColumns = [...foreignOptions, ...manyFields];
            setModelColumns(modelColumns);
            setTags(data.tabs);
          }
        }}
        msgcls={({ code }) => {
          if (!code) {
            console.log('loading dispear here');
            setOpen(false);
            actionRef.current?.reload();
            //刷新菜单
            return;
          }
        }}
        tabs={tabs}
        formRef={formRef}
        paramExtra={{ id: model?.id }}
        postExtra={{ id: model?.id, tags: tags }}
        url="dev/menu/show"
        postUrl="dev/menu/formConfig"
        showTabs={true}
        submitter="dom"
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
    </>
  );
};

type Item = {
  id: number;
  title: string;
  hidden?: boolean;
};

type DraggableTagProps = {
  tag: Item;
  index: number;
  handleClose: any;
  setTag: any;
};

const DraggableTag: FC<DraggableTagProps> = (props) => {
  const { tag = { title: '基础信息' }, index, handleClose, setTag } = props;
  const { listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: tag.title,
    });
  const [editing, setEditing] = useState(false);
  const commonStyle = {
    cursor: 'move',
    transition: 'unset', // Prevent element from shaking after drag
    display: 'inline-block',
  };

  const style = transform
    ? {
        ...commonStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
      }
    : commonStyle;

  const [editInputValue, setEditInputValue] = useState('');

  const isLongTag = tag?.title?.length > 20;
  const tagElem = (
    <>
      <Tag
        key={tag?.title}
        closable={index !== 0}
        style={{ userSelect: 'none' }}
        onClose={(e) => {
          //console.log('close here');
          handleClose(tag);
          e.preventDefault();
        }}
      >
        <span
          onDoubleClick={(e) => {
            if (index !== -1) {
              setEditInputValue(tag.title);
              setEditing(true);
              e.preventDefault();
            }
          }}
        >
          {isLongTag ? `${tag.title.slice(0, 20)}...` : tag.title}
        </span>
      </Tag>
    </>
  );

  return (
    <div style={style} ref={setNodeRef} {...listeners}>
      {tag.hidden ? null : editing ? (
        <Input
          key={tag.title}
          size="small"
          style={{ width: 'auto', verticalAlign: 'top' }}
          value={editInputValue}
          onChange={(e) => {
            setEditInputValue(e.target.value);
          }}
          onBlur={() => {
            setEditing(false);
            setTag(editInputValue, index);
          }}
          onPressEnter={() => {
            setEditing(false);
            setTag(editInputValue, index);
          }}
        />
      ) : isLongTag ? (
        <Tooltip title={tag.title} key={tag.title}>
          {tagElem}
        </Tooltip>
      ) : (
        tagElem
      )}
    </div>
  );
};

const EditTag: React.FC<{
  onChange?: (value: string[], index?: number) => void;
  tags?: string[];
  formRef?: ProFormInstance;
}> = (props) => {
  const { formRef } = props;
  const { token } = theme.useToken();
  const [tags, setTags] = useState<Array<any>>([]);
  useEffect(() => {
    if (props.tags) {
      setTags(props.tags);
    }
  }, [props.tags]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [inputValue]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const newTags = ((data) => {
        const oldIndex = data.findIndex((item) => item.title === active.id);
        const newIndex = data.findIndex((item) => item.title === over.id);

        //将form的值 新index后面的tab所有的值往后挪一位
        const allValues = formRef?.current?.getFieldsValue(true);

        const old_key = 'form_config' + (oldIndex ? oldIndex : '');
        const new_key = 'form_config' + (newIndex ? newIndex : '');
        const old_value = formRef?.current?.getFieldValue(old_key);
        //const new_value = formRef?.current?.getFieldValue(new_key);
        const newValues = { [new_key]: old_value };
        if (oldIndex > newIndex) {
          //往前移动
          for (let i = newIndex + 1; i <= oldIndex; i++) {
            let vk = 'form_config' + (i ? i : '');
            let pk = 'form_config' + (i - 1 ? i - 1 : '');
            newValues[vk] = allValues[pk];
          }
        } else {
          //往后移动
          for (let i = oldIndex; i < newIndex; i++) {
            let vk = 'form_config' + (i ? i : '');
            let pk = 'form_config' + (i + 1 ? i + 1 : '');
            newValues[vk] = allValues[pk];
          }
        }

        formRef?.current?.setFieldsValue({ ...newValues });
        return arrayMove(data, oldIndex, newIndex);
      })(tags);

      setTags(newTags);
      props.onChange?.(newTags);
    }
  };

  const handleClose = (removedTag: { [key: string]: any }) => {
    const deleteTagIndex = tags?.findIndex((tag) => tag.title == removedTag.title);
    tags[deleteTagIndex].hidden = true;
    //const newTags = tags?.filter((tag) => tag.title !== removedTag.title);
    //console.log(newTags);
    //console.log('close tag', removedTag);
    setTags(tags);
    props.onChange?.(tags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && tags.findIndex((v) => v.title == inputValue) === -1) {
      setTags([...tags, { title: inputValue }]);
      props.onChange?.([...tags, { title: inputValue }]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const tagInputStyle: React.CSSProperties = {
    width: 78,
    verticalAlign: 'top',
  };

  const tagPlusStyle: React.CSSProperties = {
    background: token.colorBgContainer,
    borderStyle: 'dashed',
  };

  return (
    <Space size={[0, 8]} wrap>
      <Space size={[0, 8]} wrap>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <SortableContext
            items={tags.map((t) => t.title)}
            strategy={horizontalListSortingStrategy}
          >
            {tags?.map((tag, index) => {
              return (
                <DraggableTag
                  tag={tag}
                  key={tag.title}
                  index={index}
                  handleClose={handleClose}
                  setTag={(value, index) => {
                    tags[index].title = value;
                    setTags(tags);
                    props.onChange?.([...tags]);
                  }}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </Space>
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag style={tagPlusStyle} onClick={showInput}>
          <PlusOutlined /> new Tab
        </Tag>
      )}
      <Tooltip title="删除或拖拽排序tab 表单渲染可能需要一点时间">
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );
};
