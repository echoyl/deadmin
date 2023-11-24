<?php
namespace App\Services;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cookie;

class LangService
{
    public static function item($item)
    {
        $lang = self::getLang();
        if($lang == 'en')
        {
            if(isset($item['title']) && isset($item['title_en']))
            {
                $item['title'] = $item['title_en']?:$item['title'];
            }
            if(isset($item['desc']) && isset($item['desc_en']))
            {
                $item['desc'] = $item['desc_en']?:$item['desc'];
            }
            if(isset($item['content']) && isset($item['content_en']))
            {
                $item['content'] = $item['content_en']?:$item['content'];
            }
            if(isset($item['content_detail']) && isset($item['content_detail_en']))
            {
                $item['content_detail'] = $item['content_detail_en']?:$item['content_detail'];
            }
            if(isset($item['titlepic']) && isset($item['titlepic_en']))
            {
                $item['titlepic'] = tomedia($item['titlepic_en']?:$item['titlepic']);
            }
            if(isset($item['pics']) && isset($item['pics_en']))
            {
                $item['pics'] = tomedia($item['pics_en']?:$item['pics']);
            }
            if(isset($item['banner']) && isset($item['banner_en']))
            {
                $item['banner'] = tomedia($item['banner_en']?:$item['banner']);
            }
        }
        return $item;
    }

    public static function list($list)
    {
        foreach($list as $key=>$item)
        {
            $list[$key] = self::item($item);
        }
        return $list;
    }


    public static function getLang()
    {
        static $lang = '';
        if(!$lang)
        {
            $lang = Cookie::get('language','zh');
            
        }
        App::setLocale($lang);
        return $lang;
    }
}
