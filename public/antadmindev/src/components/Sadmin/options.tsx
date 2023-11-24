import { DownCircleOutlined, InsertRowAboveOutlined, UpCircleOutlined } from '@ant-design/icons';
import {
  EditableProTable,
  FormListActionType,
  ProCard,
  ProFormList,
  ProProvider,
} from '@ant-design/pro-components';
import { Space, Tooltip } from 'antd';
import React, { ReactNode, useCallback, useContext, useRef } from 'react';
import { uid } from './helpers';
import { GetFormFields } from './posts/formDom';

interface SaOptionsProps {
  columns?: any[];
  showtype?: 'card' | 'table';
  name: string;
  id: string;
}

const type = 'saFormListDrag';

interface DragableUploadListItemProps2 {
  originNode: ReactNode | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  index?: number;
  moveRow: (dragIndex: any, hoverIndex: any) => void;
  addRow: (addIndex: number) => void;
  action?: any;
  showtype?: 'card' | 'table'; //两种展示方式 card和table简单模式
  item?: any;
}

const DragableUploadListItem = ({
  originNode,
  moveRow,
  addRow,
  index = 0,
  action,
  showtype = 'card',
  item,
}: DragableUploadListItemProps2) => {
  const { hashId } = useContext(ProProvider);

  const upAndDown = (index: number, type: string) => {
    if (type == 'down') {
      moveRow(index, index + 1);
    } else {
      if (index > 0) {
        moveRow(index, index - 1);
      }
    }
  };
  const style0 = {
    cursor: 'grab',
    display: 'flex',
    height: 32,
    lineHeight: 32,
  };
  const stylex = {
    cursor: 'grab',
    display: 'flex',
    height: 32,
    lineHeight: 32,
  };
  if (showtype == 'table') {
    style0.marginBlockStart = 6;
    stylex.marginBlockEnd = 24;
  }
  const moreIcons = (
    <>
      <UpCircleOutlined
        style={{ ...(index == 0 ? style0 : stylex), cursor: 'pointer' }}
        onClick={() => upAndDown(index, 'up')}
      />

      <DownCircleOutlined
        style={{ ...(index == 0 ? style0 : stylex), cursor: 'pointer' }}
        onClick={() => upAndDown(index, 'down')}
      />
      <Tooltip title="向上插入一行">
        <InsertRowAboveOutlined
          style={{ ...(index == 0 ? style0 : stylex), marginRight: -8, cursor: 'pointer' }}
          onClick={() => addRow(index)}
        />
      </Tooltip>
    </>
  );
  //drop(ref);
  //const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;
  return (
    <div
      className={`ant-pro-form-list-item ant-pro-form-list-item-default ${hashId}`}
      style={{ display: 'flex', alignItems: 'flex-end' }}
    >
      {showtype == 'card' ? (
        <ProCard
          //ref={ref}
          //className={isOver ? dropClassName : ''}
          bordered
          size="small"
          type="inner"
          //title={`${index + 1}`}
          title={
            <Space>
              {moreIcons}
              <div style={{ marginBlockEnd: -24 }}>{action}</div>
            </Space>
          }
          style={{
            marginBottom: 8,
          }}
        >
          {originNode}
        </ProCard>
      ) : (
        <div //ref={ref}
        >
          <Space>
            {moreIcons}
            <div style={index == 0 ? { paddingTop: 30 } : {}}>{action}</div>
            {originNode}
          </Space>
        </div>
      )}
    </div>
  );
};

const SaOptions: React.FC<SaOptionsProps> = (props) => {
  const { columns = [], showtype = 'card', name, id } = props;
  //console.log('inner', props);
  const actionRef = useRef<
    FormListActionType<{
      name: string;
    }>
  >();
  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    //console.log(dragIndex, hoverIndex);
    actionRef.current?.move(dragIndex, hoverIndex);
  }, []);
  const addRow = useCallback((addIndex: number) => {
    //console.log(dragIndex, hoverIndex);
    actionRef.current?.add({ id: uid() }, addIndex);
  }, []);
  //const name = props.id.replace('basic_', '');

  return (
    <ProFormList
      key={id}
      actionRef={actionRef}
      name={name}
      //name={name}
      //alwaysShowItemLabel={false}
      //initialValue={[...props.value]}
      //name={props.sprops.id.replace('basic_', '')}
      // itemContainerRender={(doms) => {
      //   return <ProForm.Group>{doms}</ProForm.Group>;
      // }}
      creatorRecord={() => {
        return { id: uid() };
      }}
      itemRender={({ listDom, action }, { index }) => {
        return (
          <DragableUploadListItem
            originNode={listDom}
            action={action}
            index={index}
            moveRow={moveRow}
            addRow={addRow}
            showtype={showtype}
          />
        );
      }}
    >
      {() => {
        //console.log(f, index, action);
        return <GetFormFields columns={[{ valueType: 'group', columns: columns }]} />;
        // return (
        //   <BetaSchemaForm
        //     layoutType="Embed"
        //     columns={[
        //       {
        //         valueType: 'group',
        //         columns: columns,
        //       },
        //     ]}
        //   />
        // );
      }}
    </ProFormList>
  );
};

export default SaOptions;

export const SaEditorTable: React.FC<SaOptionsProps> = (props) => {
  return (
    <EditableProTable
      {...props}
      columns={[
        ...props.columns,
        {
          title: '操作',
          valueType: 'option',
          render: (text, record, _, action) => [
            <a
              key="editable"
              onClick={() => {
                action?.startEditable?.(record.id);
              }}
            >
              编辑
            </a>,
          ],
        },
      ]}
      rowKey="id"
      recordCreatorProps={{
        // 每次新增的时候需要Key
        record: () => ({ id: Date.now() }),
        creatorButtonText: '新增一行',
      }}
      editable={{
        type: 'multiple',
      }}
    />
  );
};
