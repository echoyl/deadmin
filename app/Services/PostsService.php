<?php
namespace App\Services;
use Echoyl\Sa\Services\WebMenuService;
use Echoyl\Sa\Services\HelperService;

class PostsService
{
    var $model;
    var $category_model;
    public function __construct($model = false,$category_model = false)
    {
        $this->model = $model;
        $this->category_model = $category_model;
    }

    public function hits($num = 0)
    {
        if ($num < 1000) {
            return $num;
        }

        return number_format($num / 1000, '1', '.', '') . 'k';

    }

    public function shortDesc($desc = '', $length = 70)
    {
        $desc = strip_tags($desc);
        return strlen($desc) > 70 ? mb_substr($desc, 0, $length) . '...' : $desc;
    }

    public function silbings($data, $category_id = 0,$where = [])
    {
        //前一个
        if(!$this->model || !$this->category_model)
        {
            return ['prev'=>false,'next'=>false];
        }

        $ms = new WebMenuService();

        $menu = $ms->getMenu();
        //d($menu);
        $id = $category_id ?: $menu['category_id'];

        if ($id) {
            $m = $this->category_model;
            $cids = is_numeric($id) ? $m->childrenIds($id, true) : explode(',', $id);
        } else {
            $cids = [];
        }

        //d($cids);
        $m1 = clone $this->model;
        $m2 = clone $this->model;
        if (!empty($cids)) {
            $m1 = $m1->where(function ($q) use ($cids) {
                foreach ($cids as $cid) {
                    $q->orWhereRaw("FIND_IN_SET(?,category_id)", [$cid]);
                }
            });
            $m2 = $m2->where(function ($q) use ($cids) {
                foreach ($cids as $cid) {
                    $q->orWhereRaw("FIND_IN_SET(?,category_id)", [$cid]);
                }
            });
        }

        $prev = $m1->where(function ($q) use ($data) {
            $q->where([
                'state' => 'enable', ['id', '>', $data['id']], ['displayorder', '=', $data['displayorder']],
            ])->orWhere([
                ['displayorder', '>', $data['displayorder']], ['id', '!=', $data['id']],
            ]);
        })->orderBy('displayorder', 'asc')->orderBy('id', 'asc')->first();

        //后一个
        $next = $m2->where(function ($q) use ($data) {
            $q->where([
                'state' => 'enable', ['id', '<', $data['id']], ['displayorder', '=', $data['displayorder']],
            ])->orWhere([
                ['displayorder', '<', $data['displayorder']], ['id', '!=', $data['id']],
            ]);
        })->orderBy('displayorder', 'desc')->orderBy('id', 'desc')->first();

        if ($prev) {
            $prev['href'] = WeburlService::create($menu, $prev['id']);
        }
        if ($next) {
            $next['href'] = WeburlService::create($menu, $next['id']);
        }

        return ['prev' => $prev, 'next' => $next];

    }

    public function silbingsList($data, $category_id = 0,$limit = 10)
    {
        //前一个

        $ms = new WebMenuService();

        $menu = $ms->getMenu();
        //d($menu);
        $id = $category_id ?: $menu['category_id'];

        if ($id) {
            $m = $this->category_model;
            $cids = is_numeric($id) ? $m->childrenIds($id, true) : explode(',', $id);
        } else {
            $cids = [];
        }

        //d($cids);
        $m1 = $this->model;
        if (!empty($cids)) {
            $m1 = $m1->where(function ($q) use ($cids) {
                foreach ($cids as $cid) {
                    $q->orWhereRaw("FIND_IN_SET(?,category_id)", [$cid]);
                }
            });
        }

        $prev = $m1->where([
            ['id', '!=', $data['id']],['state','=','enable'],
        ])->orderBy('displayorder', 'desc')->orderBy('id', 'desc')->limit($limit)->get()->toArray();
        if (!empty($prev)) {
            foreach($prev as $key=>$val)
            {
                $prev[$key] = HelperService::deImagesOne($val, ['titlepic']);
                $prev[$key]['href'] = WeburlService::create($menu, $val['id']);
            }
        }
        //d($prev);
        return $prev;

    }

}
