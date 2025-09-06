<?php
namespace App\Events;

use Echoyl\Sa\Events\WxMessageEvent as EventsWxMessageEvent;

class WxMessageEvent extends EventsWxMessageEvent
{
    //重写父类方法 比如自定义逻辑通过user_id获取用户的公众号openid
    // public function getUserOpenid($user_id)
    // {
    //     $openids= [];
    //     return $openids;
    // }
}