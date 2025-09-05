<?php
namespace App\Events;

use Echoyl\Sa\Models\wechat\miniprogram\User;
use Echoyl\Sa\Models\wechat\miniprogram\user\Bind;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;
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
        if(!is_array($user_id))
        {
            $user_id = [$user_id];
        }

        $data = (new Bind())->with(['user.offiaccountUser'])->whereIn('user_id',$user_id)->get()->toArray();
        $openids= [];
        foreach($data as $val)
        {
            $openid = Arr::get($val,'user.offiaccount_user.openid');
            if($openid)
            {
                $openids[] = $openid;
            }
        }
        return $openids;
    }

    public function getWxappOpenid($openid)
    {
        if(!is_array($openid))
        {
            $openid = [$openid];
        }

        $data = (new User())->with(['offiaccountUser'])->whereIn('openid',$openid)->get()->toArray();
        $openids= [];
        foreach($data as $val)
        {
            $openid = Arr::get($val,'offiaccount_user.openid');
            if($openid)
            {
                $openids[] = $openid;
            }
        }
        return $openids;
    }

    public function getOpenid($openid)
    {
        if(!is_array($openid))
        {
            $openid = [$openid];
        }
        return $openid;
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