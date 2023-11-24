<?php
namespace App\Http\Middleware;

use Closure;

class WebFirst
{
    public function handle($request,Closure $next)
    {
        $finder = app('view')->getFinder();

        //设置默认的 网页模板地址
        if(isMobile())
        {
            $finder->prependLocation(resource_path('views/mobile'));//设定模板文件路径
        }else
        {
            $finder->prependLocation(resource_path('views/pc'));//设定模板文件路径
        }

        return $next($request);
    }
}
