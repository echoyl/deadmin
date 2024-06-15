<?php

namespace App\Http\Controllers\wxappapi;

use App\Services\ApiUserService;
use Echoyl\Sa\Models\wechat\Session;
use Echoyl\Sa\Services\WechatService;
use Exception;
use OpenApi\Annotations as OA;

/**
 * @property \Echoyl\Sa\Services\AppApiService               $service
 */
class WxappController extends BaseController
{
    var $dev_session_key = 'Rshqye0gtM7aKWGOqQCEug==';
    var $dev_app_id = 'wx5ec86bf589e57eb8';
    var $dev;
    var $account_id = 0;
    var $app;

    var $app_name_arr = [
        'user'=>'user_miniprogram_account_id.id'
    ];

    public function __construct()
    {
        parent::__construct();
        $this->dev = env('APP_ENV') == 'local' ? true : false;
    }

    /**
     * @OA\Post(
     *      tags={"wxapp"},
     *     path="/wxapp/loginGetToken",
     *     summary="微信小程序用户登录获取token",
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 type="object",
     *                 @OA\Property(format="string", default="code", description="小程序登录code", property="code"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(ref="#/components/schemas/Result")
     *     )
     * )
     */
    public function loginGetToken()
    {
        if ($this->dev) {
            return $this->code(false, true);
        }
        [$code,$app] = $this->service->wechatMiniprogramApp($this->app_name_arr['user']);
        if ($code) {
            return $this->fail([1, $app]);
        }
        //d($app->config->app_id);
        return $this->code($app, true);
    }


    /**
     * Undocumented function
     *
     * @param \EasyWeChat\MiniApp\Application $app
     * @param boolean $login
     * @return void
     */
    public function code($app, $login = false)
    {
        //在这里获取小程序 用户数据

        $code = webapi_request('code', '');
        $data = [];
        $session_key = $this->dev_session_key;
        $app_id = $this->dev_app_id;
        if (!$this->dev) {
            $app_id = $app->getAccount()->getAppId();
        }
        if ($code && !$this->dev) {
            //通过code 获取 session_key
            try{
                $data = $app->getUtils()->codeToSession($code);
            }catch(Exception $e)
            {
                return $this->fail([1,'code失效，请重新授权']);
            }

            

            if (isset($data['session_key'])) {
                //d($data);
                $session_key = $data['session_key'];
                //存储session_key
                $has_session = Session::where(['openid' => $data['openid']])->first();
                if ($has_session) {
                    Session::where(['id' => $has_session['id']])->update(['session_key' => $session_key, 'unionid' => $data['unionid'] ?? '']);
                } else {
                    Session::insert([
                        'session_key' => $session_key,
                        'openid' => $data['openid'],
                        'unionid' => $data['unionid'] ?? '',
                    ]);
                }
            }
        }
        if ($session_key) {
            if (empty($data)) {
                $data = Session::where(['session_key' => $session_key])->first();
            }

            if (empty($data)) {
                return $this->fail([1, 'code解析失败']);
            }

            if ($login) {
                //需要直接登录小程序用户
                $miniprogramUser = WechatService::miniprogramUser($data, $app_id);

                //修改逻辑 不再自动创建用户信息 - 而是在检测到没有用户信息的时候 返回错误信息后 让用户自己完善用户信息的时候创建
                //即改变创建用户的触发场景
                //$this->service->checkUser($data);

                $aus = new ApiUserService;

                $token = $aus->wechatMiniprogramUserLogin($data['openid']);

                $session_key = $token;
                
            }

            return $this->success($session_key);
        } else {
            return $this->fail([1, 'code解析失败']);
        }
    }






    /**
     * Undocumented function
     *
     * @param \EasyWeChat\MiniApp\Application $app
     * @param boolean $login
     * @return void
     */
    public function mobile($app, $code)
    {
        // $data = $app->getUtils()->decryptSession($sessionKey, $iv, $encryptedData);


        $data = [
            'code' => $code,
        ];

        $ret = $app->getClient()->postJson('wxa/business/getuserphonenumber', $data);

        if ($ret['errcode']) {
            return false;
        }

        $phone = $ret['phone_info'];

        if (isset($phone['purePhoneNumber']) && $phone['purePhoneNumber']) {
            return $phone['purePhoneNumber'];
        }

        return false;
    }

    public function getWxPhone()
    {
        $user = $this->service->apiUser();

        if(!$user)
        {
            return $this->fail([1, '需要微信授权']);
        }

        [$code,$app] = $this->service->wechatMiniprogramApp($this->app_name_arr['user']);
        if ($code) {
            return $this->fail([$code, $app]);
        }

        //d($user);
        $openid = $user['openid'];
        $detail = webapi_request('detail');

        $mobile = $this->mobile($app, $detail['code']);

        if ($mobile) {
            //$this->service->updateUserMobile($user, $detail['code']);
            
            WechatService::miniprogramUserMobile($openid, $mobile);
            //return $this->success($mobile);
            return $this->wxPhoneLogin($mobile);
        } else {
            return $this->fail([1, '获取手机号码失败']);
        }
    }
}
