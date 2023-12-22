---
nav:
  title: 文档
  order: 0
---

# 安装

```bash
#github
$ git clone https://github.com/echoyl/deadmin.git
#或码云
$ git clone https://gitee.com/deadmin/deadmin.git

#复制配置文件 

$ cp .env.backup .env
#修改配置文件中
#APP_NAME=你的项目名称如：echoyl
#DB_DATABASE=你的数据库名称如：echoyl 并创建该数据库
#数据库账号及密码

#安装拓展包
$ composer update


#迁移前端静态文件 及 配置文件
$ php artisan deadmin:publish

#生成基础的数据文件
$ php artisan migrate

#生成文件文件夹超链
$ php artisan storage:link

```

## 更新
```bash

#更新拓展包
$ composer update echoyl/sa
#发布前端静态文件(强制移除旧文件)
$ php artisan deadmin:publish --update

```

## 服务器

需要在 nginx 服务器或 web 服务器中配置 rewrite

```nginx
# laravel配置
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
# 默认图片转发 根据配置图片size大小返回图片 可不配置
location /img {
    try_files $uri $uri/ /index.php?$query_string;
}
#后台前端配置
location /antadmin/ {
    # 用于配合 browserHistory使用
    try_files $uri $uri/index.html /antadmin/index.html;
}
```

## 前端

安装完毕后 直接访问 http:://域名/antadmin

默认账号密码 admin 123456

如果需要修改的话需要启动/public/antadmindev 下面的 antdesign pro 项目

### 更新日志先记录在这里
20231220 
1.增加表单dependencyOn 配置可以切换显示组件或渲染显示
2.修改登录的图形二维码显示规则，超过一定次数后才会需要输入图形验证码

20231222
1.更新table中的selectbar 操作栏
2.在配置中加入清除缓存功能