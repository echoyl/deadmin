<?php
namespace App\Services;

use App\Excel\Import\Import;
use Maatwebsite\Excel\Facades\Excel;

class ExcelService
{
    public static function toArray($file)
    {
        $data = Excel::toArray(new Import,$file);
        return $data;
    }

    public static function store($obj,$file)
    {
        return Excel::store($obj,$file);
    }

}
