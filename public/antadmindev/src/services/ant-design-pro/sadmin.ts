// @ts-ignore
/* eslint-disable */
import { history, request as orequest } from '@umijs/max';
import { message, notification } from 'antd';
import { extend } from 'umi-request';
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

export const request_prefix = '/sadmin/';

export const loginPath = '/login';

export const adminTokenName = 'sadmin-token';

function errorHandler(error) {
  // 请求已发送但服务端返回状态码非 2xx 的响应
  if (error.response) {
    const { status, statusText } = error.response;
    const description = codeMessage[status] || statusText;
    notification.error({
      message: '服务器错误:' + status,
      description,
      placement: 'top',
    });
    // 请求初始化时出错或者没有响应返回的异常
    throw error;
  } else {
    const description = error.message || error.errDesc || '系统异常';
    // notification.error({
    //   message: '系统异常',
    //   description,
    //   placement: 'top',
    // });
    if (description != 'error') {
      message.error(description);
    }
    throw error;
  }
}
export async function saRequest(url: string, method = 'GET', options?: { [key: string]: any }) {
  //const method = options?.method;
  //console.log(options);
  return orequest('/sadmin/' + url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    ...(options || {}),
  });
}

const request = extend({
  prefix: request_prefix,
  errorHandler,
});
export function requestHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem(adminTokenName)}`,
    'Sa-Remember': `${localStorage.getItem('Sa-Remember')}`,
    'X-Requested-With': 'XMLHttpRequest',
  };
}

export function getFullUrl(url: string) {
  return request_prefix + url;
}

request.interceptors.request.use(async (url, options) => {
  const headers = options.headers
    ? options.headers
    : {
        'Content-Type': 'application/json',
      };
  return {
    url: url,
    options: {
      ...options,
      headers: { ...headers, ...requestHeaders() },
    },
  };
});

export const responseCodeAction = (code: number, method: string, drawer: boolean) => {
  //登录失效
  //const baseurl = process.env.NODE_ENV === 'production' ? './' : '/';
  if (code == 1001) {
    // if (window.location.pathname.replace(baseurl, '/') == loginPath) {
    //   return true;
    // }

    const gourl = loginPath + '?redirect=' + history.location.pathname;
    console.log('gourl', gourl);
    history.push(gourl);
    return true;
  } else if (code == 401301) {
    //这里检测 是post还是get post传数据的话 不跳转页面。
    //如果设置了drawer参数 get方式也是不会跳转页面的 示例，当打开一个form时 post和get都指向一个路由 都没有权限的话 会有不用跳转页面的需求
    if (method == 'GET' && !drawer) {
      history.push('/403');
      console.log('noauth go push');
      return true;
    }
  }
  return false;
};

request.interceptors.response.use(async (response, options) => {
  if (response.status == 200) {
    const res = await response.clone().json();
    const { code, msg, data } = res;

    if (code) {
      //message.error(msg);
      if (responseCodeAction(code, options.method, options.drawer)) {
        return false;
      }
    }

    if (options.then) {
      //自定义接管之后的操作设置
      options.then({ code, msg, data, res });
    } else {
      //默认的操作设置
      if (code) {
        message.error(msg);
        options.msgcls && options.msgcls({ code, msg, data, res });
      } else {
        if (msg) {
          if (options.method == 'POST' || options.method == 'DELETE') {
            message.success({
              content: msg,
              duration: 1,
              key: 'request_message_key',
              onClose: async () => {
                //如果有退出命令
                if (data?.logout) {
                  message.loading({
                    content: '退出登录中...',
                    duration: 0,
                    key: 'request_message_key',
                  });
                  await loginOut(() => {
                    message.destroy('request_message_key');
                  });
                } else {
                  options.msgcls && options.msgcls({ code, msg, data, res });
                }
              },
            });
          } else {
            options.msgcls && options.msgcls({ code, msg, data, res });
          }
          //添加导出跳转下载页面功能
          if (data?.download) {
            const a = document.createElement('a');
            a.target = '_blank';
            a.download = data.download;
            a.href = data.url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }
      }
    }
  } else {
    throw new Error();
  }

  return response;
});

export default request;

export async function saUpload(data?: { [key: string]: any }) {
  //const method = options?.method;
  //console.log(data);
  return request.post('uploader/index', {
    data: data,
    requestType: 'form',
  });
}

export async function captcha(options?: { [key: string]: any }) {
  return request.get('captcha', { params: options });
}

export async function currentUser(options?: { [key: string]: any }) {
  return request.get('currentUser');
}

export async function loginOut(cb?: Function) {
  return request.get('index/logout', {
    msgcls: () => {
      //删除数据
      localStorage.setItem(adminTokenName, '');
      if (cb) {
        cb();
      }

      history.push({
        pathname: loginPath,
        search: '?redirect=' + history.location.pathname,
      });
      return;
    },
  });
}
