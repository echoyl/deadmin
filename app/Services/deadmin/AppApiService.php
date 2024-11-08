<?php
namespace App\Services\deadmin;
use Echoyl\Sa\Services\AppApiService as ServicesAppApiService;

class AppApiService extends ServicesAppApiService
{
    /**
     * 获取微信小程序app实例
     *
     * @return void
     */
    public function wxMiniApp()
    {
        return $this->wechatMiniprogramApp('user_miniprogram_account_id.id');
    }

    public function wxPayApp()
    {
        return $this->getPayApp();
    }

    public function updateUserInfo($update_fields,$user)
    {
        $this->userModel->where(['id'=>$user['id']])->update($update_fields);
        return;
    }

    public function getUser($value,$by = 'username')
    {
        if(is_array($by))
        {
            return $this->userModel->where(function($q) use($by,$value){
                foreach($by as $k=>$name)
                {
                    if($k == 0)
                    {
                        $q->where([$name=>$value]);
                    }else
                    {
                        $q->orWhere([$name=>$value]);
                    }
                }
            })->first();
        }else
        {
            $where = [$by=>$value];
            return $this->userModel->where($where)->first();
        }
        
    }

    public function login($user_id,$merge = [])
    {
        $user = $this->userModel->where(['id'=>$user_id])->first();
        $now = now();
        $update = array_merge([
            'last_login_at'=>$now,
            'last_used_at'=>$now,
        ],$merge);

        $this->userModel->where(['id'=>$user['id']])->update($update);

        $token = $user->createToken($this->login_name);

        return $token->plainTextToken;
    }
}