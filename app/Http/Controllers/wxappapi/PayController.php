<?php
namespace App\Http\Controllers\wxappapi;

use Echoyl\Sa\Models\wechat\pay\Log;
use Echoyl\Sa\Models\wechat\pay\Refund;
use Echoyl\Sa\Services\SetsService;
use Echoyl\Sa\Services\WechatService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log as FacadesLog;

class PayController extends BaseController
{

    var $orderModel;
    var $paylog_id_name = 'paylog_id';
    public function __construct()
    {
        parent::__construct();
        //$this->orderModel = new Order();
    }
    public function check()
    {
        $order_sn = webapi_request('id');

        $order = $this->getOrder($order_sn);

        if(!$order || !$order['wechatPayLog'])
        {
            return $this->fail([1,'订单信息错误']);
        }
        
        return $this->doCheck($order['wechatPayLog']['sn']);
    }

    public function getOrder($order_sn)
    {
        $order = $this->orderModel->where(['sn'=>$order_sn])->with(['wechatPayLog'])->first();
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
     * @return \Illuminate\Http\JsonResponse
     */
    public function doCheck($order_sn,$attach = ''):JsonResponse
    {
        if(!$order_sn)
        {
            return $this->fail([1,'支付订单信息错误']);
        }

        [$code,$msg,$order] = $this->orderCheck($order_sn);

        if($code)
        {
            return $this->fail([$code,$msg]);
        }

        if(!$order)
        {
            return $this->success(0);
        }
    
        $log = $order['log'];

        //查询微信支付状态
        [$code,$app] = $this->service->wxPayApp();

        if($code)
        {
            return $this->fail([$code,$app]);
        }

        //d($app->config->app_id);
        try{
            //$result = $app->getClient()->get("v3/pay/transactions/id/".$log['out_sn'],['mchid'=>$app->getConfig()->get('mch_id')])->toArray();
            $result = $app->getClient()->get("v3/pay/transactions/out-trade-no/".$log['sn'],['mchid'=>$app->getConfig()->get('mch_id')])->toArray();
            
        }catch(Exception $e)
        {
            return $this->fail([1, '请求失败:' . $e->getMessage()]);
        }
        
        FacadesLog::channel('daily')->info('order detail:', ['result'=>$result]);

        if($result['trade_state'] == 'SUCCESS' && $result['amount']['total'] == $order['price'])
        {
            FacadesLog::channel('daily')->info('order pay success:', ['result'=>$result]);
            (new Log())->where(['id'=>$log['id']])->update(['state'=>1,'pay_at'=>now(),'out_sn'=>$result['transaction_id']]);
            $this->orderSuccess($order['id']);
        }

        return $this->success(1);
    }

    public function orderSuccess($order_id,$wechat_pay_log_id = 0)
    {
        $model = $this->orderModel;
        $order = $model->where(['id'=>$order_id])->first();
        if(!$order || $order['state_id'] != 'now allow state id')
        {
            return false;
        }

        $model->where(['id'=>$order['id']])->update([
            'state_id'=>'pay state id',
            'pay_at'=>now(),
        ]);
        //发送模板消息
        //event(new PayShopOrderEvent($order_id));
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

        $order = $this->orderModel->where(['paylog_id'=>$log['id']])->first();
        if(!$order)
        {
            return [1,'订单信息错误',false];
        }

        $order = $order->toArray();

        $order['log'] = $log;

        //如果金额是0元 直接支付完成
        // if($order['price'] == 0)
        // {
        //     $this->service->payShopOrder($order['id'],0);
        //     return [0,'支付成功',false];
        // }
        return [0,'未支付',$order];
    }

    public function init()
    {

        $id = webapi_request('id');
        $user = $this->service->user();

        $order = $this->orderModel->where(['id'=>$id,'user_id'=>$user['id']])->with(['wechatPayLog'])->first();
        if(!$order)
        {
            return $this->fail([1,'订单信息错误']);
        }

        $order = $order->toArray();

        if($order['state_id'] != 'allow pay state id')
        {
            return $this->fail([1,'订单状态错误']);
        }

        if($order['wechat_pay_log'] && $order['wechat_pay_log']['state'] == 1)
        {
            return $this->fail([1,'订单已支付，请勿重复支付']);
        }

        $ss = new SetsService();
        $pay = $ss->get('base.pay');
        $user = $this->service->user();

        $openuser = $user['apiUser'];

        $price = webapi_request('price');

        if(!$price || $price <= 0)
        {
            return $this->fail([1,'请输入支付金额']);
        }

        $sn = 'order sn';

        $log = WechatService::createPayLog($price * 100,$sn,$openuser['openid']);

        //如果需要手动输入金额 来更新订单金额支付
        $this->orderModel->where(['id'=>$order['id']])->update(['paylog_id'=>$log['id'],'price'=>$price * 100]);

        [$code,$js] = WechatService::wxJsapi($log,$pay['id'],'订单支付');

        if($code)
        {
            return $this->fail([$code,$js]);
        }

        // $js['timeStamp'] = $js['timestamp'];
        // unset($js['timestamp']);

        return $this->success(['id'=>$order['id'],'wx_jsapi'=>$js,'money'=>$order['price']/100]);

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
