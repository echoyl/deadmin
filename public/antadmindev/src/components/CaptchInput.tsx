import { SafetyCertificateOutlined } from '@ant-design/icons';
import { Button, Input, Space, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';

import { captcha } from '@/services/ant-design-pro/sadmin';

interface CaptchaInputValue {
  captchaCode?: string;
  captchaKey?: string;
}

interface CaptchaInputProps {
  value?: CaptchaInputValue;
  onChange?: (value: CaptchaInputValue) => void;
  reload?: number;
  placeholder?: string;
}

const CaptchaInput: React.FC<CaptchaInputProps> = ({
  value = {},
  onChange,
  reload = 0,
  placeholder = '请输入验证码',
}) => {
  //const intl = useIntl();
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [captchaKey, setCaptchaKey] = useState<string>('');
  const [imageData, setImageData] = useState<string>('');
  const [loading, setLoading] = useState(false);

  /**
   * 获取验证码
   */
  const getCaptcha = async () => {
    try {
      const data = await captcha({ key: captchaKey });
      if (data.code === 0) {
        return data.data;
      }
    } catch (error) {
      message.error('获取部门树失败,请重试');
      return [];
    }
    message.error('获取部门树失败,请重试');
    return [];
  };

  // 触发改变
  const triggerChange = (changedValue: { captchaCode?: string; captchaKey?: string }) => {
    if (onChange) {
      onChange({ captchaCode, captchaKey, ...value, ...changedValue });
    }
  };

  const getCaptchaing = (trigger: boolean) => {
    setLoading(true);
    getCaptcha().then((data: any) => {
      setLoading(false);
      setCaptchaKey(data.key);
      setImageData(data.img);
      if (trigger) {
        triggerChange({ captchaKey: data.key });
      }
    });
  };

  useEffect(() => {
    getCaptchaing(false);
  }, []);
  useEffect(() => {
    //console.log('reload is now', reload);
    if (reload > 0) {
      getCaptchaing(true);
    }
  }, [reload]);

  // 输入框变化
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value || '';
    if (code) {
      setCaptchaCode(code);
    }

    triggerChange({ captchaCode: code });
  };

  // 时间类型变化
  const onClickImage = () => {
    getCaptchaing(true);
  };

  return (
    <Space>
      <Input
        prefix={<SafetyCertificateOutlined />}
        size="large"
        placeholder={placeholder}
        onChange={onChangeInput}
      />

      <Button size="large" style={{ overflow: 'hidden', padding: 0, width: 112 }}>
        <Spin spinning={loading} size="small">
          <img src={imageData} onClick={onClickImage} />
        </Spin>
      </Button>
    </Space>
  );
};
export default CaptchaInput;
