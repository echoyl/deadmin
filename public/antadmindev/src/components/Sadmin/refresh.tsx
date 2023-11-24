import { currentUser } from '@/services/ant-design-pro/sadmin';
import { SyncOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { message } from 'antd';
export default () => {
  const { setInitialState } = useModel('@@initialState');
  const [messageApi, contextHolder] = message.useMessage();
  const reload = async () => {
    const msg = await currentUser();
    //const msg = await cuser();
    setInitialState((s) => ({
      ...s,
      currentUser: msg.data,
    })).then(() => {
      messageApi.success('刷新菜单成功');
    });
    return msg.data;
  };

  return (
    <span onClick={reload} style={{ width: '100%', textAlign: 'left', display: 'inline-block' }}>
      {contextHolder}
      <SyncOutlined />
    </span>
  );
};
