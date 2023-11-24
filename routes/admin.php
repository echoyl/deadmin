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

use Echoyl\Sa\Services\dev\DevService;
use Illuminate\Support\Facades\Route;
Route::group(['namespace' => 'admin', 'prefix' => env('APP_PREFIX', '') . env('APP_ADMIN_PREFIX','')], function () {
    // 控制器在 "App\Http\Controllers\Admin" 命名空间下
    Route::get('test', 'IndexController@test');
    Route::middleware('webApi')->group(function () {
        Route::middleware(['echoyl.remember', 'auth:sanctum', 'echoyl.sa','echoyl.permcheck'])->group(function () {
            DevService::aliasRoute();
        });
    });
});
