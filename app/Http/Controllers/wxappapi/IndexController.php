<?php
namespace App\Http\Controllers\wxappapi;

use App\Events\PayOrderEvent;
use App\Http\Controllers\Controller;
use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\UploadService;

class IndexController extends Controller
{

    public function sysinfo()
    {
        
        $data = [];
        return ['code'=>0,'msg'=>'','data'=>$data];
    }

    public function getAbout()
    {
        $ss = new SetsService;
        return ['code'=>0,'msg'=>'','data'=>$ss->get('base.about_content')];
    }


    public function uploadImg()
    {
        //echo 123;exit;
        //return ['code'=>0,'data'=>request()->file('file')];
        $us = new UploadService;
        $ret = $us->front('file',['jpg','jpeg','png','gif'],10,true,true);
        if($ret['code'])
        {
            return ['code'=>$ret['code'],'msg'=>$ret['msg'],'data'=>''];
        }else
        {
            //return ['code'=>1,'msg'=>'图片上传后，后台会进行人工审核','data'=>''];
            return ['code'=>$ret['code'],'msg'=>$ret['code'],'data'=>[
                'value'=>$ret['data']['thumb_url'],'url'=>tomedia($ret['data']['thumb_url'])
            ]];
        }
    }

    public function devtest()
    {
        //some test things

        return 'success';
    }
}
