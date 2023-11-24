<?php
namespace App\Http\Controllers\home;

use Echoyl\Sa\Constracts\SaServiceInterface;
use Echoyl\Sa\Http\Controllers\Controller;

/**
 * @property \App\Services\huayuan\AppApiService               $service
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
        if($tpl)
        {
            $alias = explode('/',$menu['alias']);
            array_pop($alias);
            $alias[] = $tpl;
            $tpl = implode('/',$alias);
        }
        $type = $type?'/'.$type:'';

        if ($tpl && view()->exists('tpl/' . $tpl . $type)) {
            return view('tpl/' . $tpl . $type, $data);
        }elseif (view()->exists('tpl/' . $menu['alias'].$type)) {
            return view('tpl/' . $menu['alias'].$type, $data);
        } else {
            return view('tpl/'.($type?:'default'), $data);
        }
    }
}
