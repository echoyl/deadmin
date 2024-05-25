<?php

namespace App\Http\Middleware;

use Closure;
use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\WechatService;
// use Overtrue\Socialite\User as SocialiteUser;
class Wx
{
    public function handle($request,Closure $next)
    {
        //d(session('wechat.oauth_user.default'));

        $ss = new SetsService();
        $offiaccount_account = $ss->getBase('offiaccount_account');
        //d($offiaccount_account);
        $sessionKey = 'wechat.oauth_user';
        if(!$offiaccount_account)
        {
            $offiaccount_account = [
                'id'=>0,'appid'=>''
            ];
        }
        if($offiaccount_account)
        {
            $sessionKey .= '.'.$offiaccount_account['id'];
        }
        if(env('APP_ENV') == 'local')
        {
            $openid = 'o_qRwt_GnGw5zzXY-1eg-wwf1plE';
            $appid = $offiaccount_account['appid'];
            //$wechat_user = session('wechat.oauth_user.default');
            $wechat_user = session($sessionKey, []);
            if(!$wechat_user)
            {
                $user = [
                    'id'=>$openid,
                    'name'=>'echoyl',
                    'nickname'=>'echoyl',
                    'avatar'=>'http://thirdwx.qlogo.cn/mmopen/wdAF8HQCBLLAV79wM4bTtsn41OVLDw72jiautpiaSU974ibEZfAZGbg2jt2YYBtnDsGXJLs32nAQqCmnbvLPWHibCr0ib8icKiaPmD5/132',
                    'email'=>'',
                    'raw'=>[
                        'openid'=>$openid,
                        'nickname'=>'echoyl',
                        'sex'=>'1',
                        'language'=>'zh_CN',
                        'city'=>'南昌',
                        'province'=>'江西',
                        'country'=>'中国',
                        'headimgurl'=>'http://thirdwx.qlogo.cn/mmopen/wdAF8HQCBLLAV79wM4bTtsn41OVLDw72jiautpiaSU974ibEZfAZGbg2jt2YYBtnDsGXJLs32nAQqCmnbvLPWHibCr0ib8icKiaPmD5/132',
                        'privilege'=>[],
                        'unionid'=>'owDKc1fFbb4ohbbjw2KAVJgpW5Tc'
                    ],
                    'token'=>'25_Op8aKbxxa9iCPpEQiOfhU8MEA_Q9iY1xtJmTggADmY--gdlOUa7QFl3v_dOZ20GqHC4FGaa5be_HUHxR-B95wg',
                    'provider'=>'WeChat'
                ];
                //手动注入用户
                $data = WechatService::offiaccountUser($user['raw'],$appid);
                session([$sessionKey => $data]);
            }
        }

        $se_user = session($sessionKey);
        //d($se_user);
        if(!$se_user)
        {
            if(request()->isJson())
            {
                return response()->json(['code'=>-1,'msg'=>'请先授权微信用户信息']);
            }else
            {
                $url = urlencode(request()->fullUrl());
                return redirect('/'.env('APP_PREFIX','').'wx/auth?url='.$url);
            }
            
        }

        return $next($request);
    }

}
