<?php
namespace App\Http\Controllers\wxappapi;


use Echoyl\Sa\Models\wechat\pay\Log;
use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\WechatService;

class PayController extends BaseController
{

    var $orderModel;
    public function check()
    {
        $order_sn = webapi_request('id');

        $order = $this->orderModel->where(['sn'=>$order_sn])->with(['wechatPayLog'])->first();
        if(!$order)
        {
            return $this->fail([1,'订单信息错误']);
        }

        if($order['wechat_pay_log'])
        {
            return $this->success(0);
        }

        $log = (new Log())->where(['id'=>$order['wechat_pay_log_id']])->first();
        if(!$log)
        {
            //还未唤起微信支付
            return $this->success(1);
        }

        //查询微信支付状态
        $ss = new SetsService();
        $pay_id = $ss->get('base.pay');
        [$code,$app] = WechatService::getPayment($pay_id);
        if($code)
        {
            return $this->fail([$code,$app]);
        }

        //d($app->config->app_id);

        $message = $app->order->queryByOutTradeNumber($order['sn']);

        if ($message['return_code'] === 'SUCCESS') { // return_code 表示通信状态，不代表支付状态
            // 用户是否支付成功
            if (array_get($message, 'result_code') === 'SUCCESS' && $message['total_fee'] == $order['money'] && $message['trade_state'] == 'SUCCESS') {

                $this->service->payOrder($order['id'],$order['wechat_pay_log_id']);
                (new Log())->where(['id'=>$log['id']])->update(['state'=>1,'pay_at'=>now(),'out_sn'=>$message['transaction_id']]);
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

    public function init()
    {

        $order_sn = webapi_request('order_sn');

        $order = $this->orderModel->where(['sn'=>$order_sn])->with(['wechatPayLog'])->first();
        if(!$order)
        {
            return $this->fail([1,'订单信息错误']);
        }

        if($order['wechat_pay_log'])
        {
            return $this->fail([1,'订单已支付，请勿重复支付']);
        }

        $ss = new SetsService();
        $id = $ss->get('base.pay');
        $user = $this->service->user();

        $log = WechatService::createPayLog($order['money'],$order['sn'],$user['wechatMiniprogramUser']['openid']);

        $this->orderModel->where(['id'=>$order['id']])->update(['wechat_pay_log_id'=>$log['id']]);

        [$code,$js] = WechatService::wxJsapi($log,$id,'支付');

        if($code)
        {
            return $this->fail([$code,$js]);
        }

        $js['timeStamp'] = $js['timestamp'];
        unset($js['timestamp']);

        return $this->success(['order_sn'=>$order['sn'],'wx_jsapi'=>$js,'money'=>$order['money']/100]);

    }

}
