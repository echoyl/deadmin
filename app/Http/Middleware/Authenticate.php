<?php
namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            return route('login');
        }
    }

    protected function unauthenticated($request, array $guards)
    {
        //将这个失败认证的跳转页面屏蔽，重新写过一个中间件判断是否有登录，来返回json或者跳转目录
        // if(in_array('sanctum',$guards))
        // {
        //     return response()->json(['code'=>100,'msg'=>'valid token']);
        // }else
        // {
        //     throw new AuthenticationException(
        //         'Unauthenticated.', $guards, $this->redirectTo($request)
        //     );
        // }
        
    }
}
