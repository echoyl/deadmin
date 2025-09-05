<?php
namespace App\Events;

use Echoyl\Sa\Models\wechat\offiaccount\Templatemessage;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class WxMessageEvent extends BaseEvent
{

    public $messages = [];

    public function __construct($event_name,$data,$to_id)
    {
        $event = $this->getEventData($event_name);
        if(!$event){
            //未设置事件
            return;
        }

        $message_body = $this->getMessageBody($event['data'],$data);

        //解析to_id  支持本地user_id,wxapp_openid,openid 读取后获取公众号openid
        $openids = $this->getOpenids($to_id);
        
        //处理事件是否需要跳转小程序
        $miniprogram = $this->getMiniprogram($event,$data);

        foreach($openids as $openid)
        {
            $message = [
                'touser' => $openid,
                'template_id' =>$event['template_id'],
                //'url' => $url,
                'data' => $message_body,
                //'miniprogram'=>$this->miniprogram
            ];
            if($miniprogram)
            {
                $message['miniprogram'] = $miniprogram;
            }
            $this->messages[] = $message;
        }
        //Log::channel('daily')->info('公众号模板消息内容:',$this->messages);
        //d($this->messages);
    }

    public function getEventData($name)
    {
        static $events = [];
        if(isset($events[$name]))
        {
            return $events[$name];
        }
        $event = Templatemessage::where('name',$name)->first();
        if(!$event)
        {
            return false;
        }
        $events[$name] = $event;
        return $event;
    }

    public function getMessageBody($fields,$data)
    {
        //解析消息事件中消息体key 值对应数据信息
        $body = [];
        if(!$fields)
        {
            return $body;
        }
        $fields = is_string($fields) ? json_decode($fields,true) : $fields;
        foreach($fields as $key=>$field)
        {
            $val = $field;
            if(substr($field,0,1) == '.')
            {
                //使用变量获取数据
                $val = Arr::get($data,substr($field,1));
            }
            $body[$key] = $val;
        }
        return $body;
    }

    public function getOpenids($to_id)
    {
        if(isset($to_id['openid']))
        {
            return $this->getOpenid($to_id['openid']);
        }
        if(isset($to_id['user_id']))
        {
            return $this->getUserOpenid($to_id['user_id']);
        }
        if(isset($to_id['wxapp_openid']))
        {
            return $this->getWxappOpenid($to_id['wxapp_openid']);
        }
    }

    public function getMiniprogram($event,$data)
    {
        if($event['app_id'])
        {
            $param = $this->getMessageBody($event['app_param'],$data);
            $miniprogram = $this->toMiniprogram(['appid'=>$event['app_id']],$param,$event['app_path']?:'pages/index/index');
            return $miniprogram;
        }else{
            return false;
        }
    }
}