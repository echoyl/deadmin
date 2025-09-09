<?php

namespace App\Services\deadmin;

/**
 * 面板数据写在这个service中
 */
class PanelService extends AdminAppService
{

    /**
     * 简洁面板示例，大部分项目使用此模板
     *
     * @return void
     */
    public function simplePanel()
    {
        $datalabel1 = [
            'label' => '数据指标1',
            'value' => 'datalabel1',
            'data' => [
                'value' => rand(10, 100),
                'footer'=>'底部显示内容'
            ],
        ];
        $datalabel2 = [
            'label' => '数据指标2',
            'value' => 'datalabel2',
            'data' => [
                'value' => rand(10, 100),
                'footer'=>'底部显示内容 '
            ],
        ];
        $datalabel3 = [
            'label' => '数据指标3',
            'value' => 'datalabel3',
            'data' => [
                'value' => rand(10, 100),
                'footer'=>'底部显示内容'
            ]
        ];

        $datalabel4 = [
            'label' => '数据指标4',
            'value' => 'datalabel4',
            'data' => [
                'value' => rand(10, 100),
                'footer'=> '底部显示内容'
            ],
            
        ];
        

        $carr = function ($length) {
            $r = [];
            for ($i = 0; $i < $length; $i++) {
                $r[] = 1;
            }
            return $r;
        };

        $sourceMonth = [
            'label' => '当月数据',
            'value' => 'sourcemonth',
            'data' => [
                'chart' => [
                    'fields' => ['x', 'y'],
                    'data' => collect($carr(30))->map(function ($v, $k){
                        $day = 30 - $k - 1;
                        $stamp = strtotime("-{$day} days");
                        $y = rand(10, 100);
                        return ['x' => date("m-d", strtotime("-{$day} days")), 'y' => $y];
                    })
                ]
            ]
        ];
        $sourceYear = [
            'label' => '全年数据',
            'value' => 'sourceyear',
            'data' => [
                'chart' => [
                    'fields' => ['x', 'y'],
                    'data' => collect($carr(12))->map(function ($v, $k){
                        $day = 12 - $k - 1;
                        $stamp = strtotime("-{$day} months");
                        $y = rand(10, 100);
                        return ['x' => date("Ym", strtotime("-{$day} months")), 'y' => $y];
                    })
                ]
            ]

        ];

        $sourceForm = [
            'label' => '表单字段',
            'value' => 'sourceForm',
            'fields' => [
                ['value'=>'date[]','label'=>'查询的日期']
            ],
            'initialValues'=>[
                'date[]'=>[date("Y-m-d", strtotime("-7 days")), date("Y-m-d")]
            ],
            'data' => [
                ['name' => 'date[]', 'props' => [
                    'fieldProps' => [
                        'presets' => [
                            ['label' => '近7日', 'value' => [date("Y-m-d", strtotime("-7 days")), date("Y-m-d")]],
                            ['label' => '近30日', 'value' => [date("Y-m-d", strtotime("-30 days")), date("Y-m-d")]],
                            ['label' => '近1年', 'value' => [date("Y-m-d", strtotime("-1 year")), date("Y-m-d")]]
                        ]
                    ]
                ]]
            ]
        ];


        $data = [$datalabel1,$datalabel2,$datalabel3,$datalabel4,$sourceMonth,$sourceYear,$sourceForm];
        return $data;
    }
}
