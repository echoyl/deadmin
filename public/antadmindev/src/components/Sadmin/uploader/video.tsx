import request from '@/services/ant-design-pro/sadmin';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import OSS from 'ali-oss/dist/aliyun-oss-sdk.min';
import { Button, Modal, Upload, UploadFile, UploadProps, message } from 'antd';
import { FC, useState } from 'react';
import './aliyun-upload-sdk-1.5.6.min.js';

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { css } from '@emotion/css';
import { useModel } from '@umijs/max';
window.OSS = OSS;
interface Props {
  max?: number;
  type?: string;
  value?: UploadFile[];
  onChange?: (value: any) => void;
  size?: object | number;
  fieldProps?: UploadProps;
  buttonType?: string;
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
const AliyunVideo: FC<Props> = (props) => {
  const {
    max = 1,
    value = [],
    fieldProps = {
      name: 'file',
      listType: 'picture-card',
      accept: 'video/*',
    },
    buttonType = 'card',
  } = props;
  //
  // console.log(AliyunUpload);
  const [messageApi, contextHolder] = message.useMessage();
  const loadin_key = 'aliyun_video_uploader_progress';
  const { initialState } = useModel('@@initialState');
  const baseUrl = initialState?.settings?.baseurl;
  const createUploader = (e) => {
    var uploader = new AliyunUpload.Vod({
      timeout: 600000,
      partSize: 1048576,
      parallel: 5,
      retryCount: 3,
      retryDuration: 2,
      region: 'cn-shanghai',
      userId: '1303984639806000',
      // 添加文件成功
      addFileSuccess: function (uploadInfo) {
        //console.log('addFileSuccess');
        //清空选择文件
        //user_pars.event.target.value = '';
        uploader.startUpload();
      },
      // 开始上传
      onUploadstarted: function (uploadInfo) {
        var t = this;
        // 如果是 UploadAuth 上传方式, 需要调用 uploader.setUploadAuthAndAddress 方法
        // 如果是 UploadAuth 上传方式, 需要根据 uploadInfo.videoId是否有值，调用点播的不同接口获取uploadauth和uploadAddress
        // 如果 uploadInfo.videoId 有值，调用刷新视频上传凭证接口，否则调用创建视频上传凭证接口
        // 注意: 这里是测试 demo 所以直接调用了获取 UploadAuth 的测试接口, 用户在使用时需要判断 uploadInfo.videoId 存在与否从而调用 openApi
        // 如果 uploadInfo.videoId 存在, 调用 刷新视频上传凭证接口(https://help.aliyun.com/document_detail/55408.html)
        // 如果 uploadInfo.videoId 不存在,调用 获取视频上传地址和凭证接口(https://help.aliyun.com/document_detail/55407.html)
        const url = uploadInfo.videoId
          ? 'uploader/refreshUploadVideo'
          : 'uploader/createUploadVideo';
        request
          .post(url, {
            data: uploadInfo.videoId
              ? { VideoId: uploadInfo.videoId }
              : { title: uploadInfo.file.name, name: uploadInfo.file.name },
            then: () => {},
          })
          .then((res) => {
            if (!res.data) {
              messageApi.error(res.msg);
              //uploader.stopUpload();
            } else {
              //这里一定要设置变量 传值不行？？？
              const uploadAuth = res.data.UploadAuth;
              const uploadAddress = res.data.UploadAddress;
              const videoId = res.data.VideoId;
              //sadmin.loading();
              uploader.setUploadAuthAndAddress(uploadInfo, uploadAuth, uploadAddress, videoId);
            }
          });
      },
      // 文件上传成功
      onUploadSucceed: function (uploadInfo) {
        //console.log("onUploadSucceed: " + uploadInfo.file.name + ", endpoint:" + uploadInfo.endpoint + ", bucket:" + uploadInfo.bucket + ", object:" + uploadInfo.object)
        //console.log(uploadInfo);
        //sadmin.removeLoading();
        setLoading(false);
        messageApi.open({
          key: loadin_key,
          type: 'success',
          content: '上传完成',
          duration: 2,
        });
        //console.log('上传完成后的uploadInfo', uploadInfo);
        const index = fileList.findIndex((v) => v.uid == uploadInfo.file.uid);
        const file = {
          uid: uploadInfo.file.uid,
          name: uploadInfo.file.name,
          url: baseUrl + 'video.png',
          value: uploadInfo.videoId,
          status: 'done',
        };
        if (index >= 0) {
          //已经有了
          fileList.splice(index, 1, file);
        } else {
          fileList.push(file);
        }
        console.log('index and list is', index, fileList);
        setFileList([...fileList]);
        props.onChange?.([...fileList]);
        //layui.$(user_pars.id).html('点击上传');
        //user_pars.up_obj.parseList([uploadInfo.videoId]);
        //layui.$("input[name='"+user_pars.name+"']").val(uploadInfo.videoId);
      },
      // 文件上传失败
      onUploadFailed: function (uploadInfo, code, message) {
        // console.log(
        //   'onUploadFailed: file:' + uploadInfo.file.name + ',code:' + code + ', message:' + message,
        // );
        messageApi.error('文件上传失败!');
      },
      // 取消文件上传
      onUploadCanceled: function (uploadInfo, code, message) {
        // console.log(
        //   'Canceled file: ' + uploadInfo.file.name + ', code: ' + code + ', message:' + message,
        // );
      },
      // 文件上传进度，单位：字节, 可以在这个函数中拿到上传进度并显示在页面上
      onUploadProgress: function (uploadInfo, totalSize, progress) {
        // console.log(
        //   'onUploadProgress:file:' +
        //     uploadInfo.file.name +
        //     ', fileSize:' +
        //     totalSize +
        //     ', percent:' +
        //     Math.ceil(progress * 100) +
        //     '%',
        // );

        var progressPercent = Math.ceil(progress * 100) + '%';

        messageApi.open({
          key: loadin_key,
          type: 'loading',
          content: '上传中，进度：' + progressPercent,
        });
      },
      // 上传凭证超时
      onUploadTokenExpired: function (uploadInfo) {
        // 上传大文件超时, 如果是上传方式一即根据 UploadAuth 上传时
        // 需要根据 uploadInfo.videoId 调用刷新视频上传凭证接口(https://help.aliyun.com/document_detail/55408.html)重新获取 UploadAuth
        // 然后调用 resumeUploadWithAuth 方法, 这里是测试接口, 所以我直接获取了 UploadAuth
        //console.log("上传凭证超时");
        //sadmin.removeLoading();
        messageApi.error('上传凭证超时,请重试!');
        return;
      },
      // 全部文件上传结束
      onUploadEnd: function (uploadInfo) {
        //console.log('onUploadEnd: uploaded all the files');
      },
    });
    return uploader;
  };

  const [fileList, setFileList] = useState<UploadFile[]>(
    value && typeof value !== 'string'
      ? value.map((v) => {
          v.url = v.url ? v.url : baseUrl + 'video.png';
          return v;
        })
      : [],
  );
  const [loading, setLoading] = useState(false);
  fieldProps.maxCount = max;
  fieldProps.multiple = max > 1 ? true : false;
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 4 }}>选择视频</div>
      <div>
        {fileList.length}/{max}
      </div>
    </div>
  );
  const uploadButtonOne =
    buttonType == 'card' ? (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>选择视频</div>
      </div>
    ) : (
      <Button icon={<PlusOutlined />}>选择视频</Button>
    );

  const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
    setLoading(true);
    setFileList([...fileList, file]);
    const uploader = createUploader(true);
    var userData = '{"Vod":{}}';
    uploader.addFile(file, null, null, null, userData);
    return false;
  };
  const [viewFile, setViewFile] = useState();
  const [showModal, setShowModal] = useState(false);

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
    if (info.file.status === 'uploading') {
      setLoading(true);
      setFileList([...info.fileList]);
      //return;
    } else {
      //console.log('fileChange', info);
    }
    if (info.file.status === 'removed') {
      //console.log('remove', info.file);
      const newfiles = fileList.filter((v) => v.uid != info.file.uid);
      props.onChange?.([...newfiles]);
      setFileList(newfiles);
    }
  };

  const onPreview = (f) => {
    //获取播放地址
    if (f.play_url) {
      setShowModal(true);
      setViewFile(f);
    } else {
      messageApi.open({
        key: loadin_key,
        type: 'loading',
        content: '读取播放地址中',
      });
      request
        .post('uploader/getVideoUrl', {
          data: { VideoId: f.value },
          then: () => {},
        })
        .then((res) => {
          if (res.data) {
            if (res.data.cover_url) {
              f.url = res.data.cover_url;
            }
            if (res.data.play_url) {
              messageApi.destroy(loadin_key);
              f.play_url = res.data.play_url;
              setShowModal(true);
              setViewFile(f);
              //打开弹层预览视频
            } else {
              messageApi.info({
                key: loadin_key,
                content: '视频上传后需要一点时间获取播放地址，请稍后重试',
              });
            }
          } else {
            messageApi.error({ key: loadin_key, content: '视频地址未获取到' });
          }
        });
    }

    //console.log(f.value);
  };

  return (
    <>
      {max == 1 ? (
        <Upload
          {...fieldProps}
          beforeUpload={beforeUpload}
          listType={buttonType == 'card' ? 'picture-card' : 'text'}
          className="sa-upload-list"
          showUploadList={fileList.length && !loading ? true : false}
          fileList={fileList}
          onChange={fileChange}
          onPreview={onPreview}
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
              beforeUpload={beforeUpload}
              listType={buttonType == 'card' ? 'picture-card' : 'text'}
              itemRender={(originNode, file) => (
                <DraggableUploadListItem originNode={originNode} file={file} />
              )}
              fileList={fileList}
              onChange={fileChange}
              onPreview={onPreview}
            >
              {fileList.length && fileList.length == max && !loading ? null : uploadButton}
            </Upload>
          </SortableContext>
        </DndContext>
      )}
      <Modal
        title="预览视频"
        open={showModal}
        footer={false}
        afterOpenChange={(open) => {
          setShowModal(open);
        }}
        onCancel={() => {
          setShowModal(false);
        }}
        onOk={() => {
          setShowModal(false);
        }}
      >
        <video src={viewFile?.play_url} width="100%" height="auto" controls />
      </Modal>
      {contextHolder}
    </>
  );
};

export default AliyunVideo;
