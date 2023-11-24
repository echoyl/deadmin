<?php
namespace App\Listeners;

use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\WechatService;

class EventSubscriber
{
    /**
     * Handle user login events.
     */
    public function wechatMessage($event) 
    {
        //d($event->message);
        if(env('APP_ENV') == 'local')
        {
            return;
        }

        $ss = new SetsService();
        $id = $ss->get('base.offiaccount_account_id');
        [$code,$app] = WechatService::getOffiaccount($id);
        if($code)
        {
            return;
        }

        WechatService::sendMessages($event->messages,$app);
    }


    /**
     * Register the listeners for the subscriber.
     *
     * @param  Illuminate\Events\Dispatcher  $events
     */
    public function subscribe($events)
    {
        $arr = [
            ['App\Events\WxMessageEvent','App\Listeners\EventSubscriber@wechatMessage'],
        ];

        foreach($arr as $val)
        {
            $events->listen($val[0],$val[1]);
        }

        return;
        
    }

    // public function doPrinter($event) 
    // {
    //     //d($event->message);
        
    //     // WxmessageService::send($event->tpl_name,[
    //     //     'openid'=>$event->openid,
    //     //     'data'=>$event->message
    //     // ]);
        
    //     if(!$event->sn || !$event->content)
    //     {
    //         return;
    //     }
    //     $fs = new FeieService;
    //     return $fs->print($event->sn,$event->content,$event->times);

    // }

}