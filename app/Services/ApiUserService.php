<?php
namespace App\Services;

use App\Models\user\User;
use Echoyl\Sa\Models\wechat\miniprogram\User as MiniprogramUser;
use Laravel\Sanctum\PersonalAccessToken;

class ApiUserService
{
    public static function user($type = 'wechat_miniprogram')
    {
        $user = request()->user();
        //return $user;
        if($user && $user->currentAccessToken()->name == $type)
        {
            return $user;
        }else
        {
            return false;
        }
    }

    public static function userid()
    {
        static $userid = 0;
        if(!$userid)
        {
            $user = self::user();
            if($user)
            {
                $userid = $user['id'];
            }
        }
        
        return $userid;
    }

    public static function update($update)
    {
        $user = self::user();
        
        if(!$user)
        {
            return false;
        }else
        {
            $model_name = $user->currentAccessToken()->tokenable_type;
            $model = new $model_name;
            $model->where(['id'=>$user['id']])->update($update);
            return true;
        }
    }

    /**
     * 更新用户手机号码
     *
     * @param [type] $user_id 用户id
     * @param [type] $mobile 用户手机
     * @return void
     */
    public static function updateMobile($mobile)
    {
        $mobile_user = User::where(['mobile'=>$mobile])->first();

        $user = self::user();
        if(!$mobile_user)
        {
            $model_name = $user->currentAccessToken()->tokenable_type;
            $model = new $model_name;
            $model->where(['id'=>$user['id']])->update(['mobile'=>$mobile]);
        }else
        {
            // if($mobile_user['user_wxapp_id'])
            // {
            //     //该手机号码已经绑定了用户
            //     return ['code'=>0,'msg'=>'该手机号码已经被绑定了'];
            // }else
            // {
                
            // }
            if($mobile_user['id'] != $user['id'])
            {
                User::where(['id'=>$mobile_user['id']])->update(['user_wxapp_id'=>$user['user_wxapp_id']]);
                PersonalAccessToken::where(['name'=>'wxapp','tokenable_id'=>$user['id']])->update(['tokenable_id'=>$mobile_user['id']]);
                User::where(['id'=>$user['id']])->delete();
            }
            
        }
        
        return true;
        
    }

    public static function login($model,$account,$field,$from)
    {
        //d($account_id);
        $id = $account['id'];
        $user = $model->where([$field=>$id])->first();
        if(!$user)
        {
            $id = $model->insertGetId([
                $field=>$id,
                'created_at'=>now()
            ]);
            $user = $model->find($id);
        }
        $token = $user->createToken($from);
        return $token->plainTextToken;
    }

    public static function wxappLogin($model,$account)
    {
        return  self::login($model,$account,'wechat_wxapp_id','wxapp');
    }

    public static function wxLogin($model,$account)
    {
        return  self::login($model,$account,'wechat_wx_id','wx');
    }

    public static function wechatMiniprogramUserLogin($openid)
    {
        $user = (new MiniprogramUser())->where(['openid'=>$openid])->first();
        if(!$user)
        {
            return false;
        }
        $token = $user->createToken('wechat_miniprogram');
        return $token->plainTextToken;
    }
    

}
