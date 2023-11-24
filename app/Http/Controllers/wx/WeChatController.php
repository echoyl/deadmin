<?php

namespace App\Http\Controllers\wx;

use Closure;
use Echoyl\Sa\Http\Controllers\ApiBaseController;
use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\WechatService;
use Exception;
use Illuminate\Support\Facades\Log;
/**
 * @property \App\Services\ganchangshangcheng\AppApiService               $service
 */
class WeChatController extends ApiBaseController
{

    var $app;
    var $user;
    var $account;
    var $login = true;//是否直接对接项目用户表
    var $is_admin = false;
    public function __construct()
    {
        parent::__construct();
        $ss = new SetsService();
        $this->account = $ss->getBase('offiaccount_account');

        try{
            $this->app = WechatService::getOffiaccount($this->account['id']);
        }catch(Exception $e)
        {
            Log::channel('daily')->info('wechat request arrived and account not found.',request()->all());
            return $this->fail([1,$e->getMessage()]);
        }
    }


    public function serve()
    {
        Log::channel('daily')->info('wechat request arrived.',request()->all());

        $server = $this->app->getServer();

        $server->with(function($message,Closure $next) {
            Log::channel('daily')->info('wechat msg_body:',(array)$message);
            $ret = $this->handleMsg($message);
            if($ret)
            {
                return $ret;
            }
            return $next($message);
        });

        ob_clean();
        //d($server->serve());
        return $server->serve();
    }

    /**
     * Undocumented function
     *
     * @param \EasyWeChat\OfficialAccount\Message $data
     * @return void
     */
    public function handleMsg($message)
    {
        $openid = $message->FromUserName;
        
        //获取信息前处理用户信息
        $user = WechatService::getOffiaccountUser($openid,$this->app);
        //$from_scene = '';
        if($message->MsgType == 'event')
        {
            $event = $message->Event;
            if($event == 'subscribe' && $message['EventKey'])
            {
                //$from_scene = str_replace('qrscene_', '', $data['EventKey']);
            }
            if($event == 'subscribe')
            {
                //关注事件
                //获取用户信息
                Log::channel('daily')->info('wechat event is :subscribe');
                //$user = $this->app->user->get($openid);
                Log::channel('daily')->info('wechat user_info:',$user?:['no info']);
                WechatService::subscribe($openid,true,$user,$this->app);
                //Log::channel('daily')->info('user_info:',$user);
                return "你好，欢迎关注".$this->account['appname'].'！';
            }
            if($event == 'unsubscribe')
            {
                //取消关注事件
                WechatService::subscribe($openid,false,false,$this->app);
            }
            if($event == 'SCAN')
            {
                //$from_scene = $data['EventKey'];
            }
        }
        return '你好，欢迎关注'.$this->account['appname'].'！';
    }

    public function auth()
    {
        $app = $this->app;
        
        $oauth = $app->getOauth();
        //d(session('target_url'));
        $code = request('code','');
        if($code)
        {
            //$code = request('code','');
            //d($code);
            $app_id = $app->getConfig()->get('app_id');
            $sessionKey = 'wechat.oauth_user.'.$this->account['id'];
            
            try{
                $user = $oauth->userFromCode($code);
                //Log::channel('daily')->info('user_info:',$user->toArray());
                session([$sessionKey => $user?? []]);
                $user = $user->toArray();
                $data = WechatService::offiaccountUser($user['raw'],$app_id);
                //获取微信用户信息后 对接系统的用户绑定微信用户openid
                //$this->service->checkUser($data);
                if(isset($user['subscribe']) && $user['subscribe'])
                {
                    WechatService::subscribe($user['openid'],true,false,$app);
                }

                $target_url = session('target_url');
                //Log::channel('daily')->info('target_url:',['url'=>$target_url]);
                session(['target_url'=>'']);
                //d(session($sessionKey));
                return redirect($target_url?:'');
            }catch(Exception $e)
            {
                return redirect('');
            }
        }else
        {
            $url = request('url','');
            session(['target_url'=>$url]);
            $redirectUrl = $oauth->redirect();
            return redirect($redirectUrl);
        }
    }

    public function wxjsconfig()
    {
        $url = webapi_request('url','');
        $config = WechatService::wxconfig($url);
        return ['code'=>0,'msg'=>'','data'=>$config];
    }
}
