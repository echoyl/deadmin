<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use Illuminate\Support\Facades\Route;

Route::group(['namespace' => 'wx','prefix'=>env('APP_PREFIX','').'wx'], function(){
    Route::any('auth', 'WeChatController@auth');
    Route::any('serve', 'WeChatController@serve');
    Route::any('wxnotifys', 'WxnotifysController@index');
    Route::any('wxrefundnotifys', 'WxnotifysController@refund');
    //不需要微信授权写在外面
    Route::middleware(['wx'])->group(function(){
        Route::any('adminLogin', 'WeChatController@adminLogin');
    });
});