<?php

namespace App\Http\Controllers\wxappapi;

use App\Services\HelperService;
use Echoyl\Sa\Http\Controllers\ApiBaseController;

/**
 * @property \Echoyl\Sa\Services\AppApiService               $service
 * @property \App\Services\HelperService               $hs
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
    var $hs;
    var $d2a;
    var $is_admin = false;
    public function __construct()
    {
        parent::__construct();
        $this->hs = new HelperService;
    }
}
