<?php

namespace App\Http\Controllers\wxappapi;

use App\Services\HelperService;
use Echoyl\Sa\Http\Controllers\ApiBaseController;

/**
 * @property \App\Services\deadmin\AppApiService               $service
 */
class BaseController extends ApiBaseController
{

    /**
     * @OA\OpenApi(
     *      @OA\Server(url="/pro/public/wxappapi/"),
     *      @OA\Info(title="My First API", version="0.1")
     * )
     * 
     * @OA\Tag(
     *     name="wxapp",
     *     description="微信小程序相关",
     * )
     */

    var $service;
    var $model;
    var $d2a;
    var $is_admin = false;
}
