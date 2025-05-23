<?php
namespace App\Listeners;

use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\WechatService;
use Exception;
use Illuminate\Support\Facades\Log;

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
            //本地环境不发送消息
            return 'local env';
        }

        $ss = new SetsService();
        $id = $ss->getBase('offiaccount_account_id.id');

        try{
            $app= WechatService::getOffiaccountApp($id);
        }catch(Exception $e)
        {
            Log::channel('daily')->info('wechat message send but account not found.',['error_msg'=>$e->getMessage()]);
            return $e->getMessage();
        }

        return WechatService::sendMessages($event->messages,$app);
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
            ['Echoyl\Sa\Events\WxMessageEvent','App\Listeners\EventSubscriber@wechatMessage'],
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