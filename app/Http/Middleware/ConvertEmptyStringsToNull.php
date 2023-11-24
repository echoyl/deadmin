<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull as MiddlewareConvertEmptyStringsToNull;

class ConvertEmptyStringsToNull extends MiddlewareConvertEmptyStringsToNull
{
    protected function transform($key, $value)
    {
        //return is_string($value) && $value === '' ? null : $value;
        return $value;
    }
}
