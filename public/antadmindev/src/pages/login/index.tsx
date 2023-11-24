import CaptchaInput from '@/components/CaptchInput';
import Footer from '@/components/Footer';
import request, { adminTokenName } from '@/services/ant-design-pro/sadmin';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import {
  LoginForm,
  ProForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormDependency,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { history, useModel, useSearchParams } from '@umijs/max';
import { Alert, Tabs, message } from 'antd';
import React, { CSSProperties, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import styles from './index.less';
const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [captchaReload, setCaptchaReload] = useState(0);

  // const fetchUserInfo = async () => {
  //   //const userInfo = await initialState?.fetchUserInfo?.();
  //   const userInfo = await currentUser();
  //   if (userInfo.data) {
  //     await setInitialState((s) => ({ ...s, currentUser: userInfo.data }));
  //   }
  //   return;
  // };

  const [searchParams] = useSearchParams();

  const [messageApi, contextHolder] = message.useMessage();

  //console.log('redirect', searchParams.get('redirect'));

  const handleSubmit = async (values: API.LoginParams) => {
    // 登录
    await request.post('login', {
      data: { ...values, loginType },
      duration: 1,
      msgcls: async (res) => {
        if (res.code) {
          console.log('reload captcha');
          setCaptchaReload(captchaReload + 1);
          //setCaptchaReload(false);
        } else {
          if (!res.code) {
            if (values.autoLogin) {
              localStorage.setItem('Sa-Remember', '1');
            } else {
              localStorage.setItem('Sa-Remember', '0');
            }
            localStorage.setItem(adminTokenName, res.data.access_token);
            //await fetchUserInfo();
            flushSync(() => {
              setInitialState((s) => ({
                ...s,
                currentUser: res.data.userinfo,
                settings: { ...s?.settings, ...res.data.setting },
              })).then(() => {
                //const redirect = searchParams.get('redirect') || '/';
                const redirect = '/';
                if (res.data.userinfo.redirect) {
                  //后台登录后指定跳转页面
                  history.push(res.data.userinfo.redirect);
                } else if (initialState?.settings?.baseurl) {
                  history.push(redirect.replace(initialState?.settings?.baseurl, '/'));
                } else {
                  history.push(redirect);
                }
              });
            });
          }
        }
      },
    });
    return;
  };

  const containerStyle: CSSProperties = {};
  const [loginType, setLoginType] = useState(initialState?.settings?.loginTypeDefault);
  if (initialState?.settings?.loginBgImgage) {
    containerStyle.backgroundImage = 'url("' + initialState?.settings.loginBgImgage + '")';
  }
  const formRef = useRef<ProFormInstance>();

  const loginTypeItems = [
    {
      label: '手机号登录',
      key: 'phone',
      children:
        loginType != 'phone' ? null : (
          <>
            <ProFormText
              name="mobile"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder="请输入手机号码"
              rules={[
                {
                  required: true,
                  message: '请输入手机号！',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '手机号格式错误！',
                },
              ]}
            />
            <ProForm.Item
              name="captcha"
              rules={[
                {
                  required: true,
                  message: '获取手机验证码请输入图形验证码',
                },
              ]}
            >
              <CaptchaInput reload={captchaReload} placeholder="获取手机验证码请输入图形验证码" />
            </ProForm.Item>
            <ProFormDependency name={['captcha']}>
              {({ captcha }) => {
                return (
                  <ProFormCaptcha
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined />,
                    }}
                    countDown={60}
                    captchaProps={{
                      size: 'large',
                    }}
                    phoneName="mobile"
                    placeholder="请输入验证码"
                    captchaTextRender={(timing, count) => {
                      if (timing) {
                        return `${count} 获取验证码`;
                      }
                      return '获取验证码';
                    }}
                    name="mobilecode"
                    rules={[
                      {
                        required: true,
                        message: '请输入验证码！',
                      },
                    ]}
                    onGetCaptcha={async (phone) => {
                      try {
                        await formRef.current?.validateFields(['captcha']);
                      } catch (errorInfo) {
                        //setConfirmLoading(false);
                        throw new Error('表单验证失败');
                      }
                      const { code, msg } = await request.post('sms', {
                        data: { mobile: phone, captcha },
                      });
                      if (code) {
                        throw new Error(msg);
                      }
                    }}
                  />
                );
              }}
            </ProFormDependency>
          </>
        ),
    },
    {
      label: '账号密码登录',
      key: 'password',
      children:
        loginType != 'password' ? null : (
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              placeholder="请输入账号名称"
              rules={[
                {
                  required: true,
                  message: '请输入用户名!',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined className={styles.prefixIcon} />,
              }}
              placeholder="请输入登录密码"
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
            <ProForm.Item
              name="captcha"
              rules={[
                {
                  required: true,
                  message: '请输入验证码',
                },
              ]}
            >
              <CaptchaInput reload={captchaReload} />
            </ProForm.Item>
          </>
        ),
    },
  ];
  return (
    <div className={styles.container} style={{ ...containerStyle }}>
      <div className={styles.content}>
        <ProCard
          style={{
            maxWidth: 440,
            margin: '60px auto',
            padding: '20px 0',
            background: containerStyle.backgroundImage ? '#fff' : 'none',
          }}
        >
          {contextHolder}
          <LoginForm
            formRef={formRef}
            logo={initialState?.settings.logo}
            title={initialState?.settings.title}
            subTitle={initialState?.settings.subtitle}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values as API.LoginParams);
            }}
          >
            <Tabs
              centered
              activeKey={loginType}
              onChange={(activeKey) => setLoginType(activeKey)}
              items={initialState?.settings.loginType?.map((v) => {
                return loginTypeItems.find((item) => item.key == v);
              })}
            />
            <div
              style={{
                marginBottom: 24,
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                自动登录
              </ProFormCheckbox>
              <a
                style={{
                  float: 'right',
                }}
                onClick={() => {
                  messageApi.info('请使用手机号登录后修改,或联系后台管理员修改账号密码！');
                }}
              >
                忘记密码
              </a>
            </div>
          </LoginForm>
        </ProCard>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
