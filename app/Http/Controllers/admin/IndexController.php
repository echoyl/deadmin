<?php

namespace App\Http\Controllers\admin;


use Echoyl\Sa\Http\Controllers\admin\IndexController as AdminIndexController;


/**
 * @property \App\Services\deadmin\AdminAppService                $service
 */
class IndexController extends AdminIndexController
{
    var $service;
    public function test()
    {
        return;
    }

    public function simplePanel()
    {
        return $this->success($this->service->simplePanel());
    }
}
