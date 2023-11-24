import { LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { App, Avatar, Space, Spin } from 'antd';
import React, { useCallback } from 'react';

import { loginOut } from '@/services/ant-design-pro/sadmin';
import type { MenuInfo } from 'rc-menu/lib/interface';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { message } = App.useApp();
  const onMenuClick = useCallback(
    async (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        message.loading({
          content: '退出登录中...',
          duration: 0,
          key: 'request_message_key',
        });
        await loginOut(() => {
          setInitialState((s) => ({ ...s, currentUser: undefined }));
          message.info('退出成功');
        });
        return;
      } else {
        history.push(`/dashboard/${key}`);
      }
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }
  return (
    <HeaderDropdown
      menu={{
        items: [
          {
            label: (
              <Space>
                <SettingOutlined />
                个人设置
              </Space>
            ),
            key: 'user',
          },
          {
            type: 'divider',
          },
          {
            label: (
              <Space>
                <LogoutOutlined />
                退出登录
              </Space>
            ),
            key: 'logout',
          },
        ],
        onClick: onMenuClick,
      }}
      placement="bottomRight"
    >
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar
          size="small"
          className={styles.avatar}
          src={currentUser.avatar ? currentUser.avatar : initialState?.settings.logo}
          alt="avatar"
        />
        <span className={`${styles.name} anticon`}>{currentUser.name}</span>
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;
