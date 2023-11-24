<?php
/*
 * @Author: echoyl inandan@126.com
 */
namespace App\Services;
use Intervention\Image\Facades\Image;
class ImageService
{
    
    public function qrcode($user_id = 0,$qrcode = '',$bg = 'bg.jpg')
    {

        
        // $width = $img->getWidth()/15;
        // $x = 15;
        // $y = 15;
        //d($width);
		//$num = User::count();
		
		$filename = 'qrcode/user_'.$user_id.'.jpg';

		$newPath = storage_path('app/public/'.$filename);
		
		if(file_exists($newPath))
		{
			$filemtime = filemtime($newPath);
			if($filemtime + 3600 > time())
			{
				return $filename;
			}
		}
		//$url = url('qrcode',['fromid'=>$userid]);
        //$qrcode = storage_path('app/public/'.$qrcode);
        //QrCode::format('png')->size(280)->margin(0)->generate($url,$qrcode);

		$qrbg = storage_path('app/public/'.$bg);
		


        $img = Image::make($qrbg);


        // $img->insert(Image::make($qrcode),'top-left', 227, 367)->text('text',107,42,function($font){
        //     $font->file(public_path('font/msyhbd.ttc'));
        //     $font->color('#333333');
        //     $font->size(18);
        //     $font->align('left');
        // })->text('已有'.$num.'人加入',107,68,function($font){
        //     $font->file(public_path('font/msyhbd.ttc'));
        //     $font->color('#b2b2b2');
        //     $font->size(14);
        //     $font->align('left');
        // })->save($newPath);
        $img->insert(Image::make($qrcode)->resize(241,241),'top-left', 227, 367)->save($newPath);

        return $filename;
	}
    public static function font2($text = '')
    {
        //$img = Image::canvas(40, 40, '#fff');
        //$img = Image::make('foo.jpg')->resize(300, 200);
        

        if(!$text)return;
        $filename = $text.'.png';

		$newPath = storage_path('app/public/'.$filename);

		//$url = url('qrcode',['fromid'=>$userid]);
        //$qrcode = storage_path('app/public/'.$qrcode);
        //QrCode::format('png')->size(280)->margin(0)->generate($url,$qrcode);

		// $qrbg = storage_path('app/public/'.$bg);
		$bg = storage_path('app/public/font/bg.png');


        $img = Image::make($bg);
        $img->text($text,3,28,function($font){
            $font->file(storage_path('app/public/font/logirentdemo-ea5y8.ttf'));
            $font->color('#000');
            $font->size(24);
        })->encode('png',100)->save($newPath);

        // $img->insert(Image::make($qrcode),'top-left', 227, 367)->text('text',107,42,function($font){
        //     $font->file(public_path('font/msyhbd.ttc'));
        //     $font->color('#333333');
        //     $font->size(18);
        //     $font->align('left');
        // })->text('已有'.$num.'人加入',107,68,function($font){
        //     $font->file(public_path('font/msyhbd.ttc'));
        //     $font->color('#b2b2b2');
        //     $font->size(14);
        //     $font->align('left');
        // })->save($newPath);
        //$img->insert(Image::make($qrcode)->resize(241,241),'top-left', 227, 367)->save($newPath);
        return $img->response('png');
        return $filename;
    }
    public static function font($text = '')
    {
        $img = Image::canvas(131, 40, '#fff');
        //$img = Image::make('foo.jpg')->resize(300, 200);
        

        if(!$text)return;
        $filename = $text.'.png';

		$newPath = storage_path('app/public/'.$filename);

		//$url = url('qrcode',['fromid'=>$userid]);
        //$qrcode = storage_path('app/public/'.$qrcode);
        //QrCode::format('png')->size(280)->margin(0)->generate($url,$qrcode);

		// $qrbg = storage_path('app/public/'.$bg);
		//$bg = storage_path('app/public/font/bg.png');


        //$img = Image::make($bg)->resize(100,40);
        $img->text($text,9,28,function($font){
            $font->file(storage_path('app/public/font/logirentdemo-ea5y8.ttf'));
            $font->color('#000');
            $font->size(24);
        })->save($newPath);

        // $img->insert(Image::make($qrcode),'top-left', 227, 367)->text('text',107,42,function($font){
        //     $font->file(public_path('font/msyhbd.ttc'));
        //     $font->color('#333333');
        //     $font->size(18);
        //     $font->align('left');
        // })->text('已有'.$num.'人加入',107,68,function($font){
        //     $font->file(public_path('font/msyhbd.ttc'));
        //     $font->color('#b2b2b2');
        //     $font->size(14);
        //     $font->align('left');
        // })->save($newPath);
        //$img->insert(Image::make($qrcode)->resize(241,241),'top-left', 227, 367)->save($newPath);
        return $img->response('png');
        return $filename;
    }
}
