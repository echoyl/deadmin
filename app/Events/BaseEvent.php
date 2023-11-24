<?php
namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BaseEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messages = [];
    public $tpl_id = '';

    var $miniprogram = [
        "appid"=>"",
        "pagepath"=>'/pages/index/index'
    ];

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