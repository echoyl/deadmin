<?php

use Echoyl\Sa\Services\WebMenuService;
use Illuminate\Support\Facades\Route;

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


Route::group(['namespace' => 'home', 'prefix' => env('APP_PREFIX', '')], function () {

    Route::middleware(['webFirst','wx'])->group(function () {
        //Route::get('testdev', 'IndexController@testdev');
        Route::get('index', 'IndexController@index');
        Route::get('', 'IndexController@index');
        //Route::get('about', 'MenuController@index');
        WebMenuService::aliasRoute();
        // Route::get('{mid}.html', 'MenuController@index');

        // Route::post('advise', 'FormController@advise');
        // Route::post('jubao', 'FormController@jubao');
        Route::get('captcha/{config?}', '\Mews\Captcha\CaptchaController@getCaptcha');
    });
});
