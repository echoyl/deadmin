<?php
namespace App\Http\Middleware;

use Closure;


class WebApi
{

    public function handle($request,Closure $next)
    {

        // if(env('APP_ENV') == 'local')
        // {
        //     $request->headers->set('token', 'VjMKeHxXzAh4aUVI');
        // }
        //d(request()->ip());

        $token = request()->header('token');
        if($token)
        {
            $request->headers->set('Authorization', 'Bearer '.$token);
        }

        $body = request()->getContent();
        config(['sanctum.expiration' => 60*24*30]);
        if($body)
        {
            $body = json_decode($body,true);
            $request->offsetSet('post',$body);
        }

        return $next($request);
    }
}
