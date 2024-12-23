<?php
namespace App\Http\Controllers\wxappapi\deadmin;

use App\Http\Controllers\wxappapi\BaseController;
use Echoyl\Sa\Models\wechat\pay\Log;
use Echoyl\Sa\Models\wechat\pay\Refund;
use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\shop\OrderService;
use Echoyl\Sa\Services\WechatService;
use Exception;
use Illuminate\Support\Facades\Log as FacadesLog;

/**
 * 支付控制器
 */
class PayController extends BaseController
{
    var $orderModel;
    var $paylog_id_name = 'paylog_id';
    var $orderService;
    var $order_state_unpay = 1;
    var $order_state_paid = 2;
    var $type;

    public function setProps()
    {
        $type = $this->type;
        if($type == 'order')
        {
            // $this->orderModel = new Order();
            // $this->orderService = new OrderService;
        }
    }

    public function check()
    {
        $order_sn = webapi_request('id');
        $this->type = webapi_request('type','order');
        
        $this->setProps();

        $order = $this->getOrder($order_sn);

        if(!$order)
        {
            return $this->fail([1,'订单信息错误 - null']);
        }
        if($order['paylog'])
        {
            $flag = $this->doCheck($order['paylog']['sn'],$this->type);
            if($flag === true)
            {
                return $this->successMsg('支付成功');
            }elseif($flag !== false)
            {
                return $this->failMsg($flag);
            }
        }
        return $this->init($order);
    }

    public function getOrder($order_sn)
    {
        $order = $this->orderModel->where(['id'=>$order_sn])->with(['paylog'])->first();
        return $order;
    }

    public function checkRefund()
    {
        $order_sn = webapi_request('id');
        
        return $this->refund($order_sn);
    }

    /**
     * 检测订单
     *
     * @param string $order_sn 微信支付订单商户订单号
     * @param string $attach attach回传
     * @return boolean | string true:支付成功 false:未支付 string:错误信息
     */
    public function doCheck($order_sn,$attach = '')
    {
        if(!$order_sn)
        {
            return '支付订单信息错误';
        }

        $this->type = $attach ? :'order';
        $this->setProps();

        [$code,$msg,$order] = $this->orderCheck($order_sn);

        if($code)
        {
            return $msg;
        }

        if(!$order)
        {
            return true;
        }

        $paylog = $order['paylog'];

        if($this->testPay($order,$paylog))
        {
            return true;
        }

        //查询微信支付状态
        [$code,$app] = $this->service->wxPayApp();

        if($code)
        {
            return $app;
        }

        //d($app->config->app_id);
        try{
            //$result = $app->getClient()->get("v3/pay/transactions/id/".$log['out_sn'],['mchid'=>$app->getConfig()->get('mch_id')])->toArray();
            $result = $app->getClient()->get("v3/pay/transactions/out-trade-no/".$paylog['sn'],['mchid'=>$app->getConfig()->get('mch_id')])->toArray();
            
        }catch(Exception $e)
        {
            return '请求失败:' . $e->getMessage();
        }
        
        FacadesLog::channel('daily')->info('order detail:', ['result'=>$result]);

        if($result['trade_state'] == 'SUCCESS' && $result['amount']['total'] == $order['price'])
        {
            FacadesLog::channel('daily')->info('order pay success:', ['result'=>$result]);
            (new Log())->where(['id'=>$paylog['id']])->update(['state'=>1,'pay_at'=>now(),'out_sn'=>$result['transaction_id']]);
            $this->orderSuccess($order['id']);
            return true;
        }else
        {
            return false;
        }
    }

    public function orderSuccess($order_id,$wechat_pay_log_id = 0)
    {
        $model = $this->orderModel;
        $order = $model->where(['id'=>$order_id])->first();
        if(!$order || $order['state_id'] != $this->order_state_unpay)
        {
            return false;
        }
        

        $model->where(['id'=>$order['id']])->update([
            'state_id'=>$this->order_state_paid,
            'pay_at'=>now(),
        ]);
        $this->orderService && $this->orderService->orderSuccess($order_id);
        //发送模板消息
        //event(new PayEvent($order_id));
        return true;
    }

    /**
     * 检测微信支付记录状态
     *
     * @param string $order_sn 微信支付商户订单号
     * @return void
     */
    public function orderCheck($order_sn)
    {
        $log = Log::where(['sn'=>$order_sn])->first();
        
        if(!$log)
        {
            return [1,'支付信息错误',false];
        }

        if($log['state'] == 1)
        {
            return [0,'订单已支付',false];
        }

        $order = $this->orderModel->where([$this->paylog_id_name=>$log['id']])->first();
        if(!$order)
        {
            return [1,'订单信息错误 - '.$log['id'],false];
        }

        $order = $order->toArray();

        $order['paylog'] = $log;

        //如果金额是0元 直接支付完成
        // if($order['price'] == 0)
        // {
        //     $this->service->payShopOrder($order['id'],0);
        //     return [0,'支付成功',false];
        // }
        return [0,'未支付',$order];
    }

    public function testPay($order,$paylog)
    {
        if(env('APP_ENV') == 'local')
        {
            (new Log())->where(['id'=>$paylog['id']])->update(['state'=>1,'pay_at'=>now(),'out_sn'=>'local test']);
            $this->orderSuccess($order['id']);
            return true;
        }

        return false;
    }

    public function init($order)
    {
        $user = $this->service->user();

        $order = $order->toArray();

        if($order['state_id'] != $this->order_state_unpay)
        {
            return $this->fail([1,'订单状态错误']);
        }
        $paylog = $order['paylog'];
        if($paylog && $paylog['state'] == 1)
        {
            return $this->fail([1,'订单已支付，请勿重复支付']);
        }

        $ss = new SetsService();
        $pay = $ss->get('base.pay');
        $user = $this->service->user();

        $openuser = $user['apiUser'];

        $price = $order['price'];

        $sn = OrderService::createSn();

        if(!$paylog || ($paylog && $paylog['money'] != $price))
        {
            //价格变动后重新生成，否则还是支付之前的订单
            $paylog = WechatService::createPayLog($price,$sn,$openuser['openid']);
            //如果需要手动输入金额 来更新订单金额支付
            $this->orderModel->where(['id'=>$order['id']])->update([$this->paylog_id_name=>$paylog['id'],'price'=>$price]);
        }

        if($this->testPay($order,$paylog))
        {
            return $this->success(0);
        }

        [$code,$js] = WechatService::wxJsapi($paylog,$pay['id'],'订单支付'.$order['id'],'',$this->type);

        if($code)
        {
            return $this->fail([$code,$js]);
        }

        // $js['timeStamp'] = $js['timestamp'];
        // unset($js['timestamp']);

        return $this->success(['id'=>$order['id'],'wx_jsapi'=>$js,'money'=>$price/100]);

    }

    /**
     * 退款回调
     *
     * @param stirng $sn 退款订单商户订单号
     * @return \Illuminate\Http\JsonResponse
     */
    public function refund($sn)
    {
        $model = new Refund();
        $log = $model->where(['sn'=>$sn])->first();
        if(!$log)
        {
            return $this->fail([1,'fail']);
        }

        //查询微信支付状态
        [$code,$app] = $this->service->wxPayApp();

        if($code)
        {
            return $this->fail([$code,$app]);
        }

        //d($app->config->app_id);
        try{
            $result = $app->getClient()->get("v3/refund/domestic/refunds/".$log['sn'])->toArray();
            
        }catch(Exception $e)
        {
            return $this->fail([1, '请求失败:' . $e->getMessage()]);
        }
        
        FacadesLog::channel('daily')->info('refund result:', ['result'=>$result]);

        if($result['status'] == 'SUCCESS')
        {
            //修改为处理中，回调中再修改为已退款
            $update = [
                'state'=>1,'refund_at'=>now()
            ];

            $model->where(['id'=>$log['id']])->update($update);

        }
        return $this->success();
    }

}
