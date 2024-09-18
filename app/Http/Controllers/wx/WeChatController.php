<?php

namespace App\Http\Controllers\wx;

use Echoyl\Sa\Services\AdminAppService;
use Closure;
use Echoyl\Sa\Http\Controllers\ApiBaseController;
use Echoyl\Sa\Services\admin\SocketService;
use Echoyl\Sa\Services\AdminService;
use Echoyl\Sa\Services\HelperService;
use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\WechatService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
/**
 * @property \Echoyl\Sa\Services\AppApiService               $service
 */
class WeChatController extends ApiBaseController
{

    var $app;
    var $user;
    var $account;
    var $login = true;//是否直接对接项目用户表
    var $is_admin = false;
    var $key_name = 'offiaccount_account';//后台base配置中 公众号选择的name
    public function __construct()
    {
        parent::__construct();
        $ss = new SetsService();
        $account = $ss->getBase($this->key_name);
        try{
            if(!HelperService::isDev())
            {
                $this->app = WechatService::getOffiaccountApp($account['id']);
            }
        }catch(Exception $e)
        {
            Log::channel('daily')->info('wechat request arrived and account not found.',request()->all());
            return $this->fail([1,$e->getMessage()]);
        }
        [,$this->account] = WechatService::getOffiaccount($account['id']);
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
        $default_msg = "你好，欢迎关注".$this->account['appname'];
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
                return $this->account['subscribe_reply']?:$default_msg;
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
        return $this->account['auto_reply']?:$default_msg;
    }

    protected function getSessionKey()
    {
        return 'wechat.oauth_user.'.$this->account['id'];
    }

    protected function getUser()
    {
        $sessionKey = $this->getSessionKey();
        $wechat_user = session($sessionKey);
        return $wechat_user;
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
            $sessionKey = $this->getSessionKey();
            
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

    public function adminLogin()
    {
        //获取当前openid绑定的后台用户情况
        $test_open = true;
        $we_user = $this->getUser();
        //d($we_user);
        //先获取一个test
        $test_user_id = 28;
        $users = [];
        if($test_open)
        {
            $users[] = ['username'=>'test','id'=>$test_user_id];
        }
        //获取后台绑定的用户
        $logs = DB::table('wechat_offiaccount_admin')->where(['openid'=>$we_user['id'],'state'=>1])->get()->toArray();
        //d($logs);
        $adminModel = AdminService::getUserModel();
        foreach($logs as $log)
        {
            if($log->user_id == $test_user_id)
            {
                continue;
            }
            $admin = $adminModel->where(['id'=>$log->user_id])->first();
            if(!$admin)
            {
                continue;
            }
            $users[] = ['username'=>$admin['username'],'id'=>$log->user_id];
        }

        $client_id = request('client_id');
        $user_id = request('id');
        $message = '';
        if($user_id && $client_id)
        {
            $type = 'success';
            $message = '登录成功';
            //获取是否有绑定的用户信息
            $bind = collect($users)->first(function($item) use($user_id){
                return $item['id'] == $user_id;
            });
            if(!$bind)
            {
                $type = 'success';
                $message = '未绑定该用户';
            }else
            {
                $model = AdminService::getUserModel();
                $user = $model->where(['id'=>$user_id])->first();
                if($user)
                {
                    //检测是否已经登录了这个client
                    $login_log = DB::table('socket_log')->where(['client_id'=>$client_id,'user_id'=>$user_id])->first();
                    if($login_log)
                    {
                        $message = '已登录，请勿刷新';
                    }else
                    {
                        $info =  AdminService::doLogin($user);
                        $as = new AdminAppService;
                        $info['userinfo'] = $as->parseUserInfo($info['userinfo'],$info['user']);
                        unset($info['user']);
                        $info['action'] = 'login';
                        $info['msg'] = '登录成功，页面跳转中...';
                        SocketService::sendToClient($client_id,['type'=>'login','data'=>$info]);
                    }
                    
                }
            }
            
        }else
        {
            $type = 'chose';
        }

        return view('wxLogin',['users'=>$users,'client_id'=>$client_id,'type'=>$type,'message'=>$message]);
    }
}
