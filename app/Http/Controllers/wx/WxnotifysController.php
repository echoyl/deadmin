<?php
namespace App\Http\Controllers\wx;

use Illuminate\Http\Request;
use App\Http\Controllers\wxappapi\BaseController;
use App\Http\Controllers\wxappapi\deadmin\PayController;
use Illuminate\Support\Facades\Log;

class WxnotifysController extends BaseController
{

    public function index(Request $request)
    {
        
        $content = $request->getContent();

        Log::channel('wechat')->info('微信支付回调：'."\n".$content,);

        [$code,$app] = $this->service->wxPayApp();

        if($code)
        {
            return 'SUCCESS';
        }

        $server = $app->getServer();

        $server->handlePaid(function ($message, $fail) {
            //$type = $message['attach'];
            $pc = new PayController;
            $ret = $pc->doCheck($message->out_trade_no,$message->attach);
            if(is_string($ret))
            {
                return $fail(['code' => 'fail', 'message' => 'fail']);
            }
            
        });
        
        return $server->serve();
    }

    public function refund(Request $request)
    {
        $content = $request->getContent();

        Log::channel('wechat')->info('微信退款回调：'."\n".$content,);

        [$code,$app] = $this->service->wxPayApp();

        if($code)
        {
            return 'SUCCESS';
        }

        $server = $app->getServer();

        $server->handleRefunded(function ($message, $fail) {
            //$type = $message['attach'];
            //Log::channel('wechat')->info('微信退款回调message：'."\n",['message'=>$message]);
            $pc = new PayController;
            $ret = $pc->refund($message->out_refund_no);
            $ret = $ret->getData(true);
            if($ret['code'])
            {
                return $fail(['code' => 'fail', 'message' => 'fail']);
            }
            
        });
        
        return $server->serve();
    }
}
