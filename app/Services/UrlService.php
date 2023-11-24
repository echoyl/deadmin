<?php
namespace App\Services;

class UrlService
{
    
    public function url($name)
    {
        $url = '';
        switch($name)
        {
            case 'news':
            case 'product':
                $url = url($name);
            break;
            default:
                $url = url($name);
        }
        return $url;
    }

}
