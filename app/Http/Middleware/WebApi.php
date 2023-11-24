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

        $response = $next($request);
        $origin = $request->server('HTTP_ORIGIN') ? $request->server('HTTP_ORIGIN') : '';

        if (true) {
            // $response->withHeaders([
            //     'Access-Control-Allow-Origin'=>$origin
            // ]);
            $response->header('access-control-allow-origin', '*');
            $response->header('access-control-allow-headers', '*');
            // $response->header('Access-Control-Expose-Headers', 'Authorization, authenticated');
            $response->header('access-control-allow-methods', '*');
            $response->header('access-control-allow-credentials', 'true');
        }
        return $response;

        // return $next($request)->header('Access-Control-Allow-Origin', '*')
        // ->header('Access-Control-Allow-Methods', '*')
        // ->header('Access-Control-Allow-Headers', '*');
        //->header('Access-Control-Allow-Credentials', 'true');
    }
}
