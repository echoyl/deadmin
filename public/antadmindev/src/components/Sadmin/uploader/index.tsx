import { requestHeaders, request_prefix } from '@/services/ant-design-pro/sadmin';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Image, Upload, message } from 'antd';
import { UploadFile, UploadProps } from 'antd/lib/upload/interface';
import React, { useState } from 'react';
import './index.less';

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { css } from '@emotion/css';

interface Props {
  max?: number;
  type?: string;
  value?: UploadFile[];
  onChange?: (value: any) => void;
  size?: object | number;
  fieldProps?: UploadProps;
  buttonType?: 'card' | 'table' | 'text';
}

interface DraggableUploadListItemProps {
  originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  file: UploadFile<any>;
}

const DraggableUploadListItem = ({ originNode, file }: DraggableUploadListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
  });
  const commonStyle = {
    cursor: 'move',
    transition: 'unset', // Prevent element from shaking after drag
    height: '100%',
    width: '100%',
  };
  // const style: React.CSSProperties = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  // };
  const style = transform
    ? {
        ...commonStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? 'unset' : transition, // Improve performance/visual effect when dragging
        ...(isDragging ? { zIndex: 9999 } : {}),
      }
    : commonStyle;

  // prevent preview event when drag end
  const className = isDragging
    ? css`
        a {
          pointer-events: none;
        }
      `
    : '';

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes} {...listeners}>
      {/* hide error tooltip when dragging */}
      {file.status === 'error' && isDragging ? originNode.props.children : originNode}
    </div>
  );
};

const Uploader: React.FC<Props> = (props) => {
  const {
    max = 1,
    type = 'image',
    value = [],
    size = 0,
    fieldProps = {
      headers: requestHeaders(),
      name: 'file',
      listType: 'picture-card',
      accept: 'image/*',
      data: { toSize: size }, //数组则固定大小 数字等比例缩放
    },
    buttonType = 'card',
  } = props;
  //console.log('value', value);
  const [fileList, setFileList] = useState<UploadFile[]>(
    value && typeof value !== 'string' ? value : [],
  );
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  fieldProps.maxCount = max;
  fieldProps.multiple = max > 1 ? true : false;

  const handlePreview = async (file: UploadFile) => {
    //console.log(fileList, file);
    if (type == 'file') {
      return;
    }
    fileList.forEach((f, i) => {
      if (file.uid == f.uid) {
        //console.log('=', f.uid, i);
        setCurrent(i);
      }
    });
    setVisible(true);
  };

  //const fieldProps = ;
  if (type == 'image') {
    fieldProps.onPreview = handlePreview;
  }
  if (type == 'file') {
    fieldProps.accept =
      '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.xls,.xlsx,.ppt,.rar,.zip,.chm';
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 4 }}>{type == 'image' ? '选图片' : '选文件'}</div>
      <div>
        {fileList.length}/{max}
      </div>
    </div>
  );
  const uploadButtonOne =
    buttonType == 'card' || buttonType == 'table' ? (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>{type == 'image' ? '选图片' : '选文件'}</div>
      </div>
    ) : (
      <Button icon={<PlusOutlined />}>{type == 'image' ? '选图片' : '选文件'}</Button>
    );

  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = fileList.findIndex((i) => i.uid === active.id);
      const overIndex = fileList.findIndex((i) => i.uid === over?.id);
      const new_sort_data = arrayMove(fileList, activeIndex, overIndex);
      setFileList([...new_sort_data]);
      props.onChange?.([...new_sort_data]);
    }
  };

  const fileChange = (info) => {
    //console.log(info);
    if (info.file.status === 'uploading') {
      setLoading(true);
      setFileList([...info.fileList]);
      //return;
    }
    if (info.file.status === 'done') {
      //console.log(info.file);

      const { code, msg, data } = info.file.response;
      const index = fileList.findIndex((v) => v.uid == info.file.uid);
      const file = {
        uid: info.file.uid,
        name: info.file.name,
        url: !code ? data.src : '',
        value: !code ? data.url : '',
        status: !code ? 'done' : 'error',
      };
      if (index >= 0) {
        //已经有了
        fileList.splice(index, 1, file);
      } else {
        fileList.push(file);
      }

      if (!code) {
        props.onChange?.([...fileList]);
      } else {
        //上传失败了
        message.error(msg);
        info.file.status = 'error';
      }
      setFileList([...fileList]);
      setLoading(false);
    }
    if (info.file.status === 'removed') {
      //console.log('remove', info.file);
      const newfiles = fileList.filter((v) => v.uid != info.file.uid);
      props.onChange?.([...newfiles]);
      setFileList(newfiles);
    }
    if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败.`);
      const index = fileList.findIndex((v) => v.uid == info.file.uid);
      fileList.splice(index, 1);
      setFileList([...fileList]);
      setLoading(false);
    }
  };

  const action = request_prefix + 'uploader/index';

  return (
    <>
      {max == 1 ? (
        <Upload
          {...fieldProps}
          listType={buttonType == 'card' || buttonType == 'table' ? 'picture-card' : 'text'}
          className={
            buttonType == 'table' ? 'sa-upload-list sa-upload-list-table' : 'sa-upload-list'
          }
          showUploadList={fileList.length && !loading ? true : false}
          action={action}
          fileList={fileList}
          onChange={fileChange}
        >
          {fileList.length && !loading ? null : uploadButtonOne}
        </Upload>
      ) : (
        <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
          <SortableContext
            items={fileList.map((i) => i.uid)}
            //strategy={horizontalListSortingStrategy}
          >
            <Upload
              {...fieldProps}
              action={action}
              listType={buttonType == 'card' || buttonType == 'table' ? 'picture-card' : 'text'}
              className={
                buttonType == 'table' ? 'sa-upload-list sa-upload-list-table' : 'sa-upload-list'
              }
              itemRender={(originNode, file) => (
                <DraggableUploadListItem originNode={originNode} file={file} />
              )}
              fileList={fileList}
              onChange={fileChange}
            >
              {fileList.length && fileList.length == max && !loading ? null : uploadButton}
            </Upload>
          </SortableContext>
        </DndContext>
      )}
      {fileList.length > 0 && (
        <div style={{ display: 'none' }}>
          <Image.PreviewGroup
            preview={{
              visible,
              current,
              onVisibleChange: (value) => {
                setVisible(value);
              },
              onChange: (current) => {
                setCurrent(current);
              },
            }}
            items={fileList.map((file) => {
              if (file.url) {
                const [url] = file.url.split('?');
                return url;
              } else {
                return '';
              }
            })}
          />
        </div>
      )}
    </>
  );
};
export default Uploader;
