import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

const NoFoundPage2: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="你没有此页面的访问权限"
    extra={
      <Button type="primary" onClick={() => history.push('/')}>
        返回工作台
      </Button>
    }
  />
);

export default NoFoundPage2;
