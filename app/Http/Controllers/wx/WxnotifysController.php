<?php
namespace App\Http\Controllers\wx;

use Illuminate\Http\Request;
use App\Http\Controllers\wxappapi\BaseController;
use Echoyl\Sa\Models\wechat\pay\Log as PayLog;
use Illuminate\Support\Facades\Log;

class WxnotifysController extends BaseController
{

    public function index(Request $request)
    {
        
        $content = $request->getContent();

        Log::channel('wechatOffiaccount')->info('微信支付回调：'."\n\r".$content,);

        [$code,$app] = $this->service->getPayApp();

        if($code)
        {
            return 'SUCCESS';
        }

        $response = $app->handlePaidNotify(function ($message, $fail) {
            //$type = $message['attach'];
            $order = $this->service->getUnpaidOrder($message['out_trade_no']);
            

            if (!$order) { // 如果订单不存在 或者 订单已经支付过了
                return true; // 告诉微信，我已经处理完了，订单没找到，别再通知我了
            }
            
            ///////////// <- 建议在这里调用微信的【订单查询】接口查一下该笔订单的情况，确认是已经支付 /////////////

            if ($message['return_code'] === 'SUCCESS') { // return_code 表示通信状态，不代表支付状态
                // 用户是否支付成功
                if (array_get($message, 'result_code') === 'SUCCESS' && $message['total_fee'] == $order['money'] && $message['trade_state'] == 'SUCCESS')
                {
                    $this->service->payOrder($order['id'],$order['wechat_pay_log_id']);
                    (new PayLog())->where(['id'=>$order['wechat_pay_log_id']])->update(['state'=>1,'pay_at'=>now(),'out_sn'=>$message['transaction_id']]);
                // 用户支付失败
                } elseif (array_get($message, 'result_code') === 'FAIL') {
                    return $fail('通信失败，请稍后再通知我');
                }
            } else {
                return $fail('通信失败，请稍后再通知我');
            }


            return true; // 返回处理完成

        });
        
        return $response;
    }


    public function queryOrder()
    {
        [$code,$app] = $this->service->getPayApp();

        if($code)
        {
            return 'SUCCESS';
        }

        $sn = request('sn');

        $order = $this->service->getUnpaidOrder($sn);

        if (!$order) { // 如果订单不存在 或者 订单已经支付过了
            return $this->success(0);
        }

        $message = $app->order->queryByOutTradeNumber($sn);

        if ($message['return_code'] === 'SUCCESS') { // return_code 表示通信状态，不代表支付状态
            // 用户是否支付成功
            if (array_get($message, 'result_code') === 'SUCCESS' && $message['total_fee'] == $order['money'] && $message['trade_state'] == 'SUCCESS') {

                $this->service->payOrder($order['id'],$order['wechat_pay_log_id']);
                (new PayLog())->where(['id'=>$order['wechat_pay_log_id']])->update(['state'=>1,'pay_at'=>now(),'out_sn'=>$message['transaction_id']]);
                return $this->success(0);
            // 用户支付失败
            } elseif (array_get($message, 'result_code') === 'FAIL') {
                //return $this->success(1);
            }
        } else {
           // return ['code'=>1,'msg'=>'支付失败'];
        }

        return $this->success(1);
    }

}
