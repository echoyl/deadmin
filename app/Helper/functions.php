<?php


use Echoyl\Sa\Services\HelperService;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

function tomedia($url,$img = false)
{
    if(is_array($url))
    {
        $rt = [];
        foreach($url as $val)
        {
            if($val)
            {
                $rt[] = tomedia($val);
            }
            
        }
        return $rt;
    }else
    {
        if(strpos($url,'http') !== false || strpos($url,'https') !== false)
        {
            return $url;
        }else
        {
            if(env('ALIYUN_OSS'))
            {
                return implode('/',[env('ALIYUN_DOMAIN'),env('ALIYUN_OSS'),$url]);
            }else
            {
                if($img)
                {
                    return $url?rtrim(env('APP_URL'),'/').'/img/storage/'.$url:'';
                }else
                {
                    return $url?rtrim(env('APP_URL'),'/').'/storage/'.$url:'';
                }
                
            }
            
        }
        
    }
}



function formatSize($size) { 
    $sizes = array(" Bytes", " KB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB"); 
    if ($size == 0) 
    {  
        return 0;  
    } else 
    { 
      return (round($size/pow(1024, ($i = floor(log($size, 1024)))), 2) . $sizes[$i]);  
    } 
}
if(!function_exists('array_get'))
{
    function array_get($arr,$key)
    {
        if(isset($arr[$key]))
        {
            return $arr[$key];
        }else
        {
            return false;
        }
    }
}
function d()
{
    $args = func_get_args();
    echo '<pre>';
    var_dump($args);
    exit;
}


function unescape($str) {
	$ret = '';
	$len = strlen ( $str );
	for($i = 0; $i < $len; $i ++) {
		if ($str [$i] == '%' && $str [$i + 1] == 'u') {
			$val = hexdec ( substr ( $str, $i + 2, 4 ) );
			if ($val < 0x7f)
				$ret .= chr ( $val );
			else if ($val < 0x800)
				$ret .= chr ( 0xc0 | ($val >> 6) ) . chr ( 0x80 | ($val & 0x3f) );
			else
				$ret .= chr ( 0xe0 | ($val >> 12) ) . chr ( 0x80 | (($val >> 6) & 0x3f) ) . chr ( 0x80 | ($val & 0x3f) );
			$i += 5;
		} else if ($str [$i] == '%') {
			$ret .= urldecode ( substr ( $str, $i, 3 ) );
			$i += 2;
		} else
			$ret .= $str [$i];
	}
    return $ret;
}

function loadMore($_list,$tpl)
{
    $ajax_html = '';
            
    foreach($_list as $key=>$val)
    {
        if(request('page',1) == 1)
        {
            
            $ajax_html .= view(view()->exists($tpl)?$tpl:'item',['val'=>$val,'key'=>$key]);
        }else
        {
            $ajax_html .= view(view()->exists($tpl)?$tpl:'item',['val'=>$val,'key'=>1]);
        }
    }
    return ['code'=>0,'list'=>$ajax_html,'count'=>count($_list)];
}



function mkdirs($dir, $mode = 0777) {
    if (is_dir($dir) || @mkdir($dir, $mode)) return TRUE;
    if (!mkdirs(dirname($dir), $mode)) return FALSE;
    return @mkdir($dir, $mode);
}


if (! function_exists('str_random')) {
    /**
     * Generate a more truly "random" alpha-numeric string.
     *
     * @param  int  $length
     * @return string
     *
     * @throws \RuntimeException
     *
     * @deprecated Str::random() should be used directly instead. Will be removed in Laravel 6.0.
     */
    function str_random($length = 16)
    {
        return Str::random($length);
    }
}
function filterEmpty($arr,$null_arr = [])
{
    if(!$arr || !is_array($arr))
    {
        return [];
    }
    // $arr = array_filter($arr, function($v,$k) use($null_arr) {
    //     if(in_array($k,$null_arr) && ($v === '' ||  is_null($v)))
    //     {
    //         return true;
    //     }
    //     //return $v !== null;
    //     return $v !== '' && $v !== null;
    // },ARRAY_FILTER_USE_BOTH);
    return collect($arr)->filter(function($v,$k) use($null_arr){
        if(in_array($k,$null_arr) && ($v === '' ||  is_null($v)))
        {
            return true;
        }
        //return $v !== null;
        return $v !== '' && $v !== null;
    })->map(function($v){
        return is_null($v)?'':$v;
    })->toArray();
}
function webapi_request($name = '',$defautl = '')
{
    if($name)
    {
        $v = request('post.'.$name,$defautl);
    }else
    {
        $v = request('post',$defautl);
    }
    return HelperService::userContent($v);
}
function isMobile() { 
    // 如果有HTTP_X_WAP_PROFILE则一定是移动设备
    if (isset($_SERVER['HTTP_X_WAP_PROFILE'])) {
      return true;
    } 
    // 如果via信息含有wap则一定是移动设备,部分服务商会屏蔽该信息
    if (isset($_SERVER['HTTP_VIA'])) { 
      // 找不到为flase,否则为true
      return stristr($_SERVER['HTTP_VIA'], "wap") ? true : false;
    } 
    // 脑残法，判断手机发送的客户端标志,兼容性有待提高。其中'MicroMessenger'是电脑微信
    if (isset($_SERVER['HTTP_USER_AGENT'])) {
      $clientkeywords = array('nokia','sony','ericsson','mot','samsung','htc','sgh','lg','sharp','sie-','philips','panasonic','alcatel','lenovo','iphone','ipod','blackberry','meizu','android','netfront','symbian','ucweb','windowsce','palm','operamini','operamobi','openwave','nexusone','cldc','midp','wap','mobile','MicroMessenger'); 
      // 从HTTP_USER_AGENT中查找手机浏览器的关键字
      if (preg_match("/(" . implode('|', $clientkeywords) . ")/i", strtolower($_SERVER['HTTP_USER_AGENT']))) {
        return true;
      } 
    } 
    // 协议法，因为有可能不准确，放到最后判断
    if (isset ($_SERVER['HTTP_ACCEPT'])) { 
      // 如果只支持wml并且不支持html那一定是移动设备
      // 如果支持wml和html但是wml在html之前则是移动设备
      if ((strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') !== false) && (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') === false || (strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') < strpos($_SERVER['HTTP_ACCEPT'], 'text/html')))) {
        return true;
      } 
    } 
    return false;
}

function captcha_img_html($config = 'default',array $attrs = [])
{
    $attrs_str = '';
    foreach ($attrs as $attr => $value) {
        if ($attr == 'src') {
            //Neglect src attribute
            continue;
        }

        $attrs_str .= $attr . '="' . $value . '" ';
    }
    $str = new Str;
    $src = url(env('APP_PREFIX', '').'captcha/' . $config) . '?' . $str->random(8);
    return new HtmlString('<img onclick="javascript:resetVerifyCode(this);" src="' . $src . '" ' . trim($attrs_str) . '>');
}
function toImageUrl($data,$key,$more=true,$index = 0)
{
    $ret = '';
    if(isset($data[$key]))
    {
        if($more)
        {
            if(!empty($data[$key]) && isset($data[$key][$index]))
            {
                if(isset($data[$key][$index]['url']))
                {
                    $ret = $data[$key][$index]['url'];
                }else
                {
                    $ret = tomedia($data[$key][$index]['value']);
                }
                
            }
        }else
        {
            $ret = $data[$key]['url'];
        }
        
    }
    return $ret;
}