<?php
namespace App\Http\Controllers\home;

use Echoyl\Sa\Models\web\Menu;
use Echoyl\Sa\Services\WebMenuService;

class MenuController extends BaseController
{
    public function index()
    {
        $ms = new WebMenuService();
        $menu = $ms->getMenu();
        //d($menu['children']);
        $tpl = $menu['tpl'] ?? '';

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
        $data['relate_menus'] = [];
        //获取相关联 菜单信息
        if($menu['relate_menu_id'])
        {
            $relate_menu_ids = explode(',',$menu['relate_menu_id']);
            $r_menus = (new Menu())->whereIn('id',$relate_menu_ids)->get();
            foreach($r_menus as $r_menu)
            {
                $data['relate_menus'][] = $ms->getMenuFromAllMenus($r_menu);
            }
        }
        //d($data['relate_menus']);

        Menu::where(['id' => $menu['id']])->increment('hits');

        //如果没设置tpl 再检测是alias 路径
        return $this->tpl($tpl,$menu,$data);
    }

    

}
