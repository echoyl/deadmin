<?php

namespace App\Http\Middleware;

use App\Services\ApiUserService;
use Closure;
class WxappApi
{
    public function handle($request,Closure $next)
    {
        if(!ApiUserService::user())
        {
            return response()->json(['code'=>-1,'msg'=>'请重新授权小程序']);
        }
        return $next($request);
    }
}
