<?php

namespace App\Excel\Import;

use Maatwebsite\Excel\Concerns\ToArray;
class Import implements ToArray
{
    /**
     * @param array $row
     *
     * @return User|null
     */
    public function array(array $row)
    {
        return [];
    }

}