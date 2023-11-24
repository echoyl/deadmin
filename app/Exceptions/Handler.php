<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
            
        });
        $this->renderable(function (NotFoundHttpException $e, Request $request) {
            //d(request()->ajax());
            //if()
            if(request()->ajax())
            {
                return response()->json([
                    'msg' => 'page is not found',
                    'code'=>1,
                    'data'=>[]
                ], 200);
            }
            
            // if ($request->is('*/sadmin/*')) {
            //     return response()->json([
            //         'message' => 'page is not found'
            //     ], 404);
            // }
        });
    }
}
