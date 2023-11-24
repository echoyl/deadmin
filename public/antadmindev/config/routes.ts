import { appRoutes } from './route/default';

export default [
  {
    path: '/login',
    layout: false,
    title: '登录页面',
    component: './login',
  },
  {
    path: '/web',
    name: '菜单导航',
    icon: 'bars',
    routes: [
      {
        path: 'menu/:id',
        component: './menu/menu/post',
      },
    ],
  },
  {
    path: 'dev',
    name: '开发管理',
    routes: [
      {
        path: 'menu',
        component: 'dev/menu',
        name: '菜单',
      },
      {
        path: 'setting',
        component: 'dev/setting',
        name: '配置',
      },
      {
        path: 'model',
        name: '模型',
        component: 'dev/model',
      },
      {
        path: 'test',
        name: '测试专用',
        component: 'dev/test',
      },
    ],
  },

  {
    path: '403',
    component: './403',
  },
  ...appRoutes,
  { path: '/', component: './404' },
  { path: '/*', component: './404' },
];
