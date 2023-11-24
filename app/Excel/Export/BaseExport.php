<?php

namespace App\Excel\Export;

use Echoyl\Sa\Services\HelperService;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Concerns\FromArray;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;

class BaseExport implements FromArray, WithStyles, WithColumnWidths
{

    public $data;
    /**
     * @var array 二位数组
     */
    var $more_data;
    var $end_data;

    //[
    //type : 'index' (序号) | date | int | price | enum  字段类型
    //key : array|string 字段index
    //title: string '表头'
    //default? : string 默认值
    //t?: boolean 是否加换行符
    //format?: type = date 是设置的日期格式
    //];

    public $indexMap = [
        ['key' => ['order','sn'], 'title' => '订单编号'],
        ['key' => ['order','wancheng_at'], 'type' => 'date', 'format' => "Y-m-d H:i:s", 'title' => '完成日期'],
    ];

    var $column_length = 0;
    var $ext_row_count = 0;
    var $columns = [];
    public function __construct($data, $more_data = [], $end_data = [])
    {
        $this->data = $data;
        $this->more_data = $more_data;
        $this->end_data = $end_data;


        $this->column_length = count($this->indexMap);
        if (!empty($more_data)) {
            $this->ext_row_count++;
        }
        if (!empty($end_data)) {
            $this->ext_row_count++;
        }
        $columns = [];

        for ($i = 0; $i < $this->column_length; $i++) {
            $word = '';
            if ($i < 26) {
                $word = chr(65 + $i);
            } else {
                //超过52列应该不会吧
                $word = 'A' . chr(65 + $i - 25);
            }
            $columns[] = $word;
        }
        $this->columns = $columns;
    }

    public function parseData()
    {
        $_data = [];
        foreach ($this->data as $datakey => $val) 
        {
            $data = [];
            foreach ($this->indexMap as $col) {
                $index = $col['key'];
                $type = $col['type'] ?? '';
                $add_t = $col['t'] ?? '';
                $default = $col['default'] ?? '';
                if (is_array($index)) {
                    //数组index
                    $_val = HelperService::getFromObject($val, $index);
                    $_val = $_val ?: $default;
                } else {
                    //字符串 直接读取
                    $_val = $val[$index] ?? $default;
                }
                if ($type) {
                    switch ($type) {
                        case 'date':
                            $_val = date($col['format'], strtotime($_val));
                            break;
                        case 'int':
                            break;
                        case 'price':
                            $_val = intval($_val) / 100;
                            if(!$_val)
                            {
                                $_val = '0';
                            }
                            break;
                        case 'enum':
                            $_val = $index['enum'][$_val] ?? $default;
                            break;
                        case 'index':
                            $_val = ++$datakey;
                            break;
                    }
                }
                if ($add_t) {
                    $_val .= "\t";
                }
                $data[] = $_val;
            }
            $_data[] = $data;
        }
        return $_data;
    }

    public function array(): array
    {
        $_data = $this->more_data;
        $_data[] = collect($this->indexMap)->map(function ($item) {
            return $item['title'];
        })->toArray();

        $this_data = $this->parseData();
        if(!empty($this_data))
        {
            $_data = array_merge($_data,$this_data);
        }
        
        if (!empty($this->end_data)) {
            $_data[] = $this->end_data;
        }
        //d($_data);
        return $_data;
    }

    public function columnWidths(): array
    {
        $columns = [];
        foreach ($this->columns as $word) {
            if ($word == 'B') {
                $columns[$word] = 30;
            } else {
                $columns[$word] = 20;
            }
        }
        return $columns;
    }

    public function styles(Worksheet $sheet)
    {
        $thin_border = [
            'borderStyle' => Border::BORDER_THIN,
            'color' => [
                'rgb' => '000000'
            ]
        ];
        $last_column = $this->columns[$this->column_length - 1];
        $blue = new Color('1677ff');
        $green = new Color('A9D08E');
        //第一行
        // $sheet->getRowDimension('1')->setRowHeight(33);
        // $sheet->mergeCells('A1:'.$last_column.'1');
        // $sheet->getStyle('A1')->getAlignment()->setVertical('center')->setHorizontal('center');
        // //$sheet->getStyle('A1:'.$last_column.'1')->getFill()->setFillType(Fill::FILL_SOLID);
        // $sheet->getStyle('A1:'.$last_column.'1')->getFont()->setSize(16)->setBold('bold');

        $sheet->getStyle('A1:' . $last_column . '1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FFFF00');
        $sheet->getStyle('A1')->applyFromArray([
            'borders' => [
                'right' => $thin_border,
                'bottom' => $thin_border,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(60);
        // $sheet->getStyle('A1:'.$last_column.'1')->applyFromArray([
        //     'borders' => [
        //         'bottom' => $thin_border,
        //         'right'=>$thin_border
        //     ],
        // ]);

        //$sheet->mergeCells('A2:'.$last_column.'2');
        //$sheet->getStyle('A2:'.$last_column.'2')->getFont()->setColor($blue);
        $sheet->getStyle('A1:' . $last_column . '1')->getFont()->setSize(11)->setBold('bold');
        // $sheet->getStyle('A2:'.$last_column.'2')->applyFromArray([
        //     'borders' => [
        //         'bottom' => $thin_border
        //     ],
        // ]);
        // $sheet->getStyle('A2:'.$last_column.'2')->getAlignment()->setVertical('left');

        // $sheet->getRowDimension(3)->setRowHeight(30);
        // $sheet->getStyle('A3:'.$last_column.'3')->getFont()->setSize(11)->setBold('bold');
        // $sheet->getStyle('A3:'.$last_column.'3')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('A9D08E');
        // $sheet->getStyle('A3:'.$last_column.'3')->getAlignment()->setVertical('center')->setHorizontal('center');
        foreach ($this->columns as $column) {
            $sheet->getStyle($column . '1')->applyFromArray([
                'borders' => [
                    'right' => $thin_border,
                    'bottom' => $thin_border,
                    'top' => $thin_border,
                ],
            ]);

            foreach ($this->data as $key => $val) {
                $row = $key + 2;
                $sheet->getRowDimension($row)->setRowHeight(30);
                $sheet->getStyle($column . $row)->applyFromArray([
                    'borders' => [
                        'right' => $thin_border,
                        'bottom' => $thin_border,
                    ],
                ]);
            }
            $row_count = $this->ext_row_count + count($this->data) + 1;
            $sheet->getStyle($column . '1' . ':' . $last_column . $row_count)->getAlignment()->setVertical('center')->setHorizontal('center');
        }

        $row_count = $this->ext_row_count + count($this->data);

        // if (!empty($this->end_data)) {
        //     $sheet->mergeCells('A' . $row_count . ':' . $last_column . ($row_count + 8));
        // }
    }
}
