<?php
namespace App\Events;

use Illuminate\Support\Facades\Log;

class WxMessageEvent extends BaseEvent
{

    public $messages = [];
    public $tpl_id = 'zdVmCQtA0Vux3fP5ai9X8pSx0f7ST1yHlmlmvMZ-XP0';

    public function __construct($orderid)
    {

        $message_body = [
            'character_string1'=>'',
        ];
        $openid = '';
        $message = [
            'touser' => $openid,
            'template_id' =>$this->tpl_id,
            //'url' => $url,
            'data' => $message_body,
            //'miniprogram'=>$this->miniprogram
        ];
        $this->messages[] = $message;

        Log::channel('daily')->info('公众号模板消息内容:',$this->messages);
        //d($this->messages);
    }
}