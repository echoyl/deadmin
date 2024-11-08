<?php
namespace App\Http\Controllers\wxappapi\deadmin\user;

use App\Http\Controllers\wxappapi\BaseController;
use Echoyl\Sa\Services\HelperService;
use Echoyl\Sa\Services\utils\SmsService;
use Illuminate\Support\Facades\Validator;

class UserController extends BaseController
{
    public function getUserInfo()
    {
        $user = $this->service->user();

        HelperService::deImagesOne($user,['titlepic']);

        $data = [
            'avatar'=>$user['titlepic'],
            'id'=>$user['id'],
            'username'=>$user['username'],

        ];

        return $this->success($data);
    }

    public function updateUserInfo()
    {

        $user = $this->service->user();

        $update = [
            'username'=>webapi_request('username'),
            'titlepic'=>webapi_request('avatar'),
            'originData'=>$user
        ];

        $update = HelperService::enImages($update,['titlepic']);

        $this->service->updateUserInfo($update,$user);

        return $this->success();

    }

    public function valiEmail($post)
    {
        $validator = Validator::make($post,[
            'email'=>['email','required']
        ],[
            'email.email' => '邮箱格式不正确',
            'email.required' => '邮箱为必填项',
        ]);
        if ($validator->fails()) 
        {
            return $this->fail([1,$validator->errors()->first()]);
        }
        return;
    }

    public function valiPassword($post,$name = 'password')
    {
        $validator = Validator::make($post,[
            $name=>['required','min:6']
        ],[
            $name.'.required' => '密码为必填项',
            $name.'.min'=>'密码长度最小为6位'
        ]);
        if ($validator->fails()) 
        {
            return $this->fail([1,$validator->errors()->first()]);
        }
        return;
    }


    public function emailCode()
    {
        $post = webapi_request();
        $vali = $this->valiEmail($post);
        if($vali)
        {
            return $vali;
        }
        $email = $post['email'];
        $ss = new SmsService($email,30);
        [$code,$msg] =  $ss->sendEmail('emails.test');

        if($code)
        {
            return $this->fail([$code,$msg]);
        }

        return $this->success();
    }

    public function login()
    {
        $post = webapi_request();
        $username = webapi_request('username');
        $vali2 = $this->valiPassword($post);
        if(!$username || $vali2)
        {
            return $vali2?:'请输入登录账号';
        }


        $user = $this->service->getUser($username);

        if(!$user || $user['password'] != HelperService::pwd($post['password']))
        {
            return $this->fail([1,'登录失败']);
        }

        if(!$user['state'])
        {
            return $this->fail([1,'该账号已注销或禁用']);
        }

        //登录返回token
        $user_id = $user['id'];

        $token = $this->service->login($user_id);

        return $this->success($token);
    }

    public function logout()
    {
        request()->user()->currentAccessToken()->delete();
        return $this->successMsg();
    }

    public function chpwd()
    {
        $post = webapi_request();
        $vali = $this->valiPassword($post,'old_password');
        $vali2 = $this->valiPassword($post,'new_password');
        if($vali || $vali2)
        {
            return $vali?:$vali2;
        }
        $user = $this->service->user();
        if(!$user || $user['password'] != HelperService::pwd($post['old_password']))
        {
            return $this->fail([1,'登录失败']);
        }

        $update = ['password'=>HelperService::pwd($post['new_password'])];

        $this->service->updateUserInfo($update,$user);

        return $this->successMsg('修改成功');

    }

}
