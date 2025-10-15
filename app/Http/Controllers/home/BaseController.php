<?php
namespace App\Http\Controllers\home;

use Echoyl\Sa\Constracts\SaServiceInterface;
use Echoyl\Sa\Http\Controllers\Controller;
use Echoyl\Sa\Services\WebMenuService;
use Illuminate\Support\Arr;

/**
 * @property \App\Services\deadmin\AppApiService               $service
 */
class BaseController extends Controller
{
    var $service;
    public function __construct()
    {
        $this->service = app()->make(SaServiceInterface::class);
    }

    protected function tpl($tpl,$menu,$data,$type = '')
    {
        $malias = Arr::get($menu,'alias','');
        if($tpl)
        {
            if(substr($tpl,0,1) != '/')
            {
                $alias = explode('/',$malias);
                array_pop($alias);
                $alias[] = $tpl;
                $tpl = implode('/',$alias);
            }else
            {
                $tpl = substr($tpl,1);
            }
            
        }
        $type = $type?'/'.$type:'';

        //d($menu['alias'],$tpl,'tpl/' . $menu['alias'].$type);
        //检测malias当前目录中的type是否存在
        $maliass = explode('/',$malias);
        array_pop($maliass);

        $tpls = [
            $malias.$type,
            $malias,
            $type?:'default',
        ];

        if(!empty($maliass))
        {
            array_unshift($tpls,implode('.',$maliass).$type);
        }

        if($tpl)
        {
            array_unshift($tpls,$tpl.$type);
            array_unshift($tpls,$tpl);//无类型的也添加至检测列表
        }
        //d($tpls);
        foreach($tpls as $tpl)
        {
            if(view()->exists('tpl/' . $tpl))
            {
                return view('tpl/' . $tpl, $data);
            }
        }
    }

    /**
     * 通过菜单id获取菜单，自定义页面可以调用该方法设定当前所属的菜单
     *
     * @param integer $menu_id
     * @return void
     */
    protected function getMenuById($menu_id = 0)
    {
        $ms = new WebMenuService();
        if($menu_id)
        {
            request()->offsetSet('mid',$menu_id);
        }
        $menu = $ms->getMenu();

        //$data['siblings'] = $m->silbings($detail);
        $data = ['menu' => $menu,'specs'=>$menu['specs']];
        //d($data['specs']);
        $data['bread'] = WebMenuService::bread();
        if ($menu['parent_id'] != 0) {
            $top_menu = collect($ms->getAll())->first(function ($item) use ($menu) {
                return $item['id'] == $menu['parent_id'];
            });
            $data['top_menu'] = $top_menu;
        }else
        {
            $data['top_menu'] = $menu;
        }
        $data['category'] = array_pop($data['bread']);

        return $data;
    }
}
