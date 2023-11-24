<?php
namespace App\Models\swagger;
/**
 * @OA\Schema(@OA\Xml(name="返回结果"))
 */
class Result {

    /**
     * 状态码,
     * @var string
     * @OA\Property(example="200")
     */
    public $code;
    

    /**
     * 返回信息,
     * @var string
     * @OA\Property(example="操作成功")
     */
    public $msg;


    /**
     * 返回信息,
     * @var string
     * @OA\Property(example="返回string 数据信息")
     */
    public $data;
}

