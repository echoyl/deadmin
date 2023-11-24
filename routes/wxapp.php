<?php

/*
|--------------------------------------------------------------------------
| wxappapi Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use Illuminate\Support\Facades\Route;

Route::group(['namespace' => 'wxappapi','prefix'=>env('APP_PREFIX','').'wxappapi'], function(){
    

    Route::middleware(['webApi','auth:sanctum'])->group(function(){
        //不需要授权登录的

        Route::any('wxapp/loginGetToken', 'WxappController@loginGetToken');

        //需要登录授权

        Route::middleware(['wxappApi'])->group(function(){
            //微信获取手机号码
            Route::any('sys/getWxPhone', 'WxappController@getWxPhone');
            //需要授权登录的
            Route::any('sys/uploadImg', 'IndexController@uploadImg');
            Route::any('public/uploadImg', 'IndexController@uploadImg');
        });
    });
    
});


