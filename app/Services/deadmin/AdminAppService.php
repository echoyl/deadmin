<?php

namespace App\Services\deadmin;

use Echoyl\Sa\Services\AdminAppService as ServicesAdminAppService;
use Echoyl\Sa\Services\AdminService;

class AdminAppService extends ServicesAdminAppService
{
    /**
     * 返回给前端的用户信息，可以编辑自定义字段信息，前端使用{{user?.field}} 可以获取到相应的用户字段信息
     *
     * @param [type] $userinfo
     * @param [type] $user
     * @return void
     */
    public function parseUserInfo($userinfo, $user)
    {
        $userinfo['is_super'] = AdminService::isSuper($userinfo);
        return $userinfo;
    }

    /**
     * 登录后触发，比如用户登录后发送消息到页面中
     *
     * @param [登录用户信息] $info
     * @return void
     */
    public function triggerLogin($info)
    {
        return;
    }
}
