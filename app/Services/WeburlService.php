<?php
namespace App\Services;

use Echoyl\Sa\Services\WebMenuService;

class WeburlService
{
    /**
     * Undocumented function
     * 网页前端的url生成器 主要是 生成 固定模块的链接生成
     * @param [array] $menu 菜单
     * @param [int] $id 内容id
     * @return void
     */
    public static function create($menu, $id = 0, $cid = 0)
    {
        if ($id) {
            //如果有id的话那么就是详情
            $ms = new WebMenuService;
            $selected_cids = $ms->getSelectedCid($menu);
            $mid = $cid ? '/' . $cid : '';
            if (!empty($selected_cids)) {
                //$mid = '/' . implode('_', $selected_cids);
            }
            return url('/' . env('APP_PREFIX', '') . $menu['alias'] . $mid . '/' . $id . '.html');
        } else {
            //没有的话 那么就是列表了
            return url('/' . env('APP_PREFIX', '') . $menu['alias']);
        }
    }

    public function url($url)
    {
        return url('/' . env('APP_PREFIX', '') . $url);
    }

}
