<?php
namespace App\Events;

use Echoyl\Sa\Models\wechat\miniprogram\User;
use Echoyl\Sa\Models\wechat\miniprogram\user\Bind;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BaseEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messages = [];
    public $tpl_id = '';

    var $miniprogram = [
        "appid"=>"",
        "pagepath"=>'/pages/index/index'
    ];

    public function getUserOpenid($user_id)
    {
        $bind = (new Bind())->where(['user_id'=>$user_id])->first();
        if(!$bind)
        {
            return '';
        } 
        $wxappuser = (new User())->where(['openid'=>$bind['openid']])->with(['offiaccountUser'])->first();
        //d($wxappuser);
        if(!$wxappuser)
        {
            return '';
        }
        $wxappuser = $wxappuser->toArray();
        if(!$wxappuser['offiaccount_user'])
        {   
            Log::channel('daily')->info('用户无微信用户',[]);
            return '';
        }
        return $wxappuser['offiaccount_user']['openid'];
    }

    public function toMiniprogram($mini,$param = [],$path = 'pages/index/index')
    {
        $query = http_build_query($param);
        $pagepath = [$path];
        if($query)
        {
            $pagepath[] = $query;
        }
        return [
            'appid'=>$mini['appid'],
            'pagepath'=>implode('?',$pagepath)
        ];
    }
}