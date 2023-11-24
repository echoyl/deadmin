<?php

namespace App\Http\Controllers\home;

use App\Services\HelperService;
use Echoyl\Sa\Services\WebMenuService;
use App\Services\PostsService;
use App\Services\WeburlService;

class PostsController extends BaseController
{
    public $category_model = false;
    public $model = false;
    public $menu;
    public $ms;
    public function __construct()
    {
        parent::__construct();
        $this->ms = new WebMenuService();
        $this->menu = $this->ms->getMenu();

        //通过当前菜单获取 当前模型
        if($this->menu['admin_model'])
        {
            $this->model = WebMenuService::getModel($this->menu['admin_model']);
            $this->category_model = WebMenuService::getModel($this->menu['admin_model'],'category');
        }
        

    }

    function list() {
        $data = [];

        $menu = $this->menu;
        
        $cid = intval(request('cid', 0));
        
        $data['cid'] = $cid;

        $data['bread'] = WebMenuService::bread();
        
        $data['category'] = array_pop($data['bread']);
        

        $id = $data['category']['cid']??0;

        $tpl = $menu['tpl'];

        //d($menu);
        $m = $this->model;

        //新增列表查询条件
        $m = $this->service->postListWhere($m,$menu);

        $cids = $this->category_model?$this->category_model->childrenIds($id, true):[];

        $keyword = request('keyword', '');
        if ($keyword) {
            $m = $m->where([['title', 'like', '%' . $keyword . '%']]);
            $cids = [];
        }

        //$m = $this->model->whereIn('category_id', $ids);
        
        if (!empty($cids)) {
            $m = $m->where(function ($q) use ($cids) {
                foreach ($cids as $cid) {
                    $q->orWhereRaw("FIND_IN_SET(?,category_id)", [$cid]);
                }
            });
        }

        $psize = $menu['pagesize'] ? $menu['pagesize'] : 10;
        $page = request('page', 1);

        
        $search_category_id = request('category_id', '');
        if ($search_category_id) {
            $m = $m->whereRaw("FIND_IN_SET(?,category_id)", [$search_category_id]);
        }
        $data['keyword'] = strip_tags($keyword);
        $data['search_category_id'] = intval($search_category_id);

        $list = $m->where(['state' => 1])->orderBy('displayorder', 'desc')->orderBy('created_at', 'desc')->offset(($page - 1) * $psize)->limit($psize)->get()->toArray();

        $data['pages'] = $m->paginate($psize);
        $ps = new PostsService;
        foreach ($list as $k => $val) {
            $val = $this->service->postParse($val,$menu);
            HelperService::deImagesOne($val, ['titlepic']);
            HelperService::deImages($val, ['attachment','pics'], true);
            //$val['titlepic'] =
            $val['time_str'] = date("Y-m-d", strtotime($val['created_at']));
            $category = $this->category_model->parentInfo($val['category_id']);
            
            //分类是单选多级的
            $val['category_single_cascader'] = collect(array_reverse($category))->pluck('title')->toArray();

            $val['href'] = WeburlService::create($menu, $val['id'],$id,$val['link']??'');
            $val['desc_short'] = $ps->shortDesc($val['content']);
            //d($val['files']);
            $val['hits'] = $ps->hits($val['hits']??0);
            $list[$k] = $val;
        }
        //d($list);

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
        $data['menu'] = $menu;
        if ($menu['parent_id'] != 0) {
            $top_menu = collect($this->ms->getAll())->first(function ($item) use ($menu) {
                return $item['id'] == $menu['parent_id'];
            });
            $data['top_menu'] = $top_menu;
        }else
        {
            $data['top_menu'] = $menu;
        }
        //d($menu);
        return $this->tpl($tpl,$menu,$data,'list');
    }

    public function detail()
    {
        $menu = $this->menu;

        $data = [];
        $id = request('id', 0);

        $ps = new PostsService($this->model,$this->category_model);
        $detail = $this->model->where(['id' => $id, 'state' => 1])->first();
        $data['category'] = ['href' => 'javascript:;', 'title' => '', 'cid' => 0];
        $data['bread'] = WebMenuService::bread();
        $data['category'] = array_pop($data['bread']);

        if ($detail) {
            $detail = $this->service->postParse($detail,$menu);
            HelperService::deImagesOne($detail, ['titlepic']);
            HelperService::deImages($detail, ['attachment','pics']);
            //d($detail['pics']);
            $this->model->where(['id' => $id])->increment('hits');
            $detail['hits'] = $ps->hits($detail['hits']??0);
            $detail['time_str'] = date("Y.m.d", strtotime($detail['created_at']));
            $detail['silbings'] = $ps->silbings($detail, $data['category']['cid']??0);
            $category = $this->category_model->parentInfo($detail['category_id']);
            
            //分类是单选多级的
            $detail['category_single_cascader'] = collect(array_reverse($category))->pluck('title')->toArray();
            //more
            $detail['silbingsList'] = $ps->silbingsList($detail, $data['category']['cid']??0,5);
            //d($detail['silbingsList']);
            $detail['specs_json'] = $detail['specs'];
            $detail['specs'] = $detail['specs'] ? json_decode($detail['specs'], true) : [];
            $data['detail'] = $detail;

        }

        $tpl = $menu['tpl'] ?? '';
        $data['menu'] = $menu;
        //$data['top_menu'] = $menu;
        if ($menu['parent_id'] != 0) {
            $top_menu = collect($this->ms->getAll())->first(function ($item) use ($menu) {
                return $item['id'] == $menu['parent_id'];
            });
            $data['top_menu'] = $top_menu;
        }else
        {
            $data['top_menu'] = $menu;
        }
        //$data['siblings'] = $m->silbings($detail);
        return $this->tpl($tpl,$menu,$data,'detail');
    }

    

}
