<?php

namespace App\Http\Controllers\home;

use App\Http\Controllers\Controller;
use Echoyl\Sa\Models\web\Menu;
use App\Services\ImageService;
use App\Services\WeburlService;
use Echoyl\Sa\Services\WebMenuService;
use Echoyl\Sa\Services\WebsiteService;

class IndexController extends Controller
{
    public function index()
    {
        return '欢迎访问!~';
        $data = [];

        $data['diancang'] = $this->getDataList(34, [2], 5);
        $topnews = $this->getDataList(29, [], 1,[['titlepic','!=','']]);
        $where = [];
        $data['topnews'] = [];
        if(!empty($topnews))
        {
            $where = [['id','!=',$topnews['id']]];
            $data['topnews'] = [$topnews];
        }
        
        $data['news'] = $this->getCategoryData(29, [], 5,false,$where);


        return view('index', $data);
    }

    public function getCategoryData($menu_id, $category_ids = [], $limit = 1,$withCategory = true,$where = [])
    {
        $ws = new WebsiteService;
        return $ws->getData($menu_id, $category_ids, $limit, $withCategory,$where);
    }

    public function getDataList($menu_id, $category_ids = [], $limit = 1,$where = [])
    {
        $ws = new WebsiteService;
        [$menu, $data] = $ws->getData($menu_id, $category_ids, $limit,false,$where);
        return $data;
    }

    public function search()
    {
        $data = [];
        $keyword = request('keyword');

        $menu_id = 6;
        $data = [];

        $menu = (new Menu())->where(['id' => $menu_id])->with(['adminModel'])->first();

        //
        //$menu['href'] = MenuService::parseHref($menu);

        $ms = new WebMenuService;
        $menu = $ms->getMenuFromAllMenus($menu);
        

        //d($menu);
        $m = WebMenuService::getModel($menu['admin_model']);
        $cids = [];

        $keyword = strip_tags(request('keyword', ''));
        $data['keyword'] = $keyword;
        if ($keyword) {
            $m = $m->where(function($q) use($keyword){
                $q->where([['title', 'like', '%' . $keyword . '%']])->orWhere([['desc', 'like', '%' . $keyword . '%']]);
            });
        }else
        {
            $m = $m->where([['id', '=', -1]]);
        }

        $psize = $menu['pagesize'] ? $menu['pagesize'] : 10;
        $page = request('page', 1);

        $list = $m->where(['state' => 1])->orderBy('displayorder', 'desc')->orderBy('id', 'desc')->offset(($page - 1) * $psize)->limit($psize)->get()->toArray();

        $data['pages'] = $m->paginate($psize);
        foreach ($list as $k => $val) {
            $val['title'] = str_replace($keyword,'<font color="red">'.$keyword.'</font>',$val['title']);
            $val['desc'] = str_replace($keyword,'<font color="red">'.$keyword.'</font>',$val['desc']);
            $val['href'] = WeburlService::create($menu, $val['id'],$val['category_id']);
            $list[$k] = $val;
        }
        //d($list);
        $tpl = 'search';
        if(request()->ajax())
        {
            $html = '';
            foreach($list as $key=>$val)
            {
                $html .= view(view()->exists('tpl/' . $tpl . '/item')?'tpl/' . $tpl . '/item':'tpl/item',['val'=>$val,'key'=>$key]);
            }
            return ['code'=>0,'list'=>$list,'html'=>$html];
        }

        $data['list'] = $list;

        return view('tpl/search', $data);
    }

    

    public function testdev()
    {
        //$this->project();
        //$this->pnews();
        $font = ImageService::font2('da');
        return $font;
    }


}
