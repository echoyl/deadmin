import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import { Space } from 'antd';
import React from 'react';
import NoticeIconView from '../NoticeIcon';
import Avatar from './AvatarDropdown';
import styles from './index.less';
export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout, lang = true } = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'dark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <Space className={className}>
      <NoticeIconView />
      <Avatar menu={true} />
      {lang && (
        <UmiSelectLang
          style={{
            padding: 4,
          }}
        />
      )}
    </Space>
  );
};

export default GlobalHeaderRight;
