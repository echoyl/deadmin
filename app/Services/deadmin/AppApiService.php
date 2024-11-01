<?php
namespace App\Services\deadmin;
use Echoyl\Sa\Services\AppApiService as ServicesAppApiService;

class AppApiService extends ServicesAppApiService
{
    /**
     * 获取微信小程序app实例
     *
     * @return void
     */
    public function wxMiniApp()
    {
        return $this->wechatMiniprogramApp('user_miniprogram_account_id.id');
    }

    public function wxPayApp()
    {
        return $this->getPayApp();
    }
}