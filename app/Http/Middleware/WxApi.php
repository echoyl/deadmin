<?php

namespace App\Http\Middleware;
use App\Services\WxUserService;
use Closure;
class WxApi
{
    public function handle($request,Closure $next)
    {
        //单页式网页
        $user = WxUserService::user();
        if(!$user)
        {
            //header("Access-Control-Allow-Origin:*");
            //header("Access-Control-Allow-Methods:*");
            //header("Access-Control-Allow-Headers:*");
            //header("Access-Control-Allow-Credentials:true");
            echo json_encode(['code'=>-1,'msg'=>'需要授权获取微信用户信息']);exit;
        }

        return $next($request);
    }
}
