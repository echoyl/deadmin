<?php

namespace App\Http\Middleware;
use App\Services\deadmin\AppApiService;
use Closure;
class WxappApiUser
{
    public function handle($request,Closure $next)
    {
        $as = new AppApiService();
        if(!$as->user())
        {
            return response()->json(['code'=>-1,'msg'=>'请先登录']);
        }
        return $next($request);
    }
}
