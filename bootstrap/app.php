<?php

use App\Http\Middleware\WebFirst;
use App\Http\Middleware\Wx;
use App\Http\Middleware\WxApi;
use App\Http\Middleware\WxappApi;
use App\Http\Middleware\WxappApiUser;
use Echoyl\Sa\Exceptions\AException;
use Echoyl\Sa\Helpers\ResponseEnum;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectTo(fn () => null);
        $middleware->alias([
            'webFirst' => WebFirst::class,
            'wx' => Wx::class,
            'wxApi' => WxApi::class,
            'wxappApi' => WxappApi::class,
            'wxappApiUser' => WxappApiUser::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->reportable(function (AException $e) {
            //
        });
        $exceptions->render(function (Throwable $e) {
            [$code] = ResponseEnum::CLIENT_HTTP_UNAUTHORIZED_EXPIRED;
            if (request()->ajax() || request()->wantsJson() || request()->isJson()) {
                return response()->json([
                    'msg' => implode("\r", [$e->getMessage(), $e->getFile().$e->getLine()]),
                    'code' => match (true) {
                        $e instanceof AException => $e->getCode(),
                        $e instanceof AuthenticationException => $code,
                        default => 1,
                    },
                    'data' => [],
                ], 200);
            }
        });
    })->create();
