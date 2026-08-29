<?php

namespace App\Http\Controllers\admin;

use App\Services\deadmin\AdminAppService;
use Echoyl\Sa\Http\Controllers\admin\CrudController;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * @property AdminAppService $service
 */
class BaseController extends CrudController
{
    private array $queryCallers = [];

    public function __construct()
    {
        parent::__construct();

        DB::enableQueryLog();

        if (app()->isProduction()) {
            return;
        }

        DB::listen(function (QueryExecuted $query) {
            $this->queryCallers[] = $this->caller();
        });
    }

    protected function jsonResponse($status, $codeResponse, $data, $error): JsonResponse
    {
        $response = parent::jsonResponse($status, $codeResponse, $data, $error);

        return $response->setData(array_merge($response->getData(true), ['dev' => $this->performanceData()]));
    }

    public function list($data, $total, $search = [])
    {
        $response = parent::list($data, $total, $search);

        return $response->setData(array_merge($response->getData(true), ['dev' => $this->performanceData()]));
    }

    private function caller(): string
    {
        $norm = fn ($path) => str_replace('\\', '/', $path);

        $base = $norm(base_path());
        $app = $norm(base_path('app'));
        $framework = $norm(base_path('vendor/laravel/framework'));
        $file = $norm(__FILE__);

        $fallback = '';

        foreach (debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS) as $frame) {
            $path = isset($frame['file']) ? $norm($frame['file']) : '';
            $line = $frame['line'] ?? 0;

            if (! $path || $path === $file) {
                continue;
            }

            if (str_starts_with($path, $framework)) {
                continue;
            }

            $short = str_starts_with($path, $base) ? substr($path, strlen($base) + 1) : $path;

            if (str_starts_with($path, $app)) {
                return $short.':'.$line;
            }

            if (! $fallback) {
                $fallback = $short.':'.$line;
            }
        }

        return $fallback;
    }

    private function performanceData(): array
    {
        $start = defined('LARAVEL_START') ? LARAVEL_START : request()->server('REQUEST_TIME_FLOAT', microtime(true));

        $queries = [];
        $log = DB::getQueryLog();
        if (! app()->isProduction()) {

            $queries = collect($log)->values()->map(function ($item, $key) {
                $bindings = array_map(function ($binding) {
                    return is_numeric($binding) ? $binding : "'{$binding}'";
                }, $item['bindings']);

                return [
                    'sql' => Str::replaceArray('?', $bindings, $item['query']),
                    'time' => $item['time'],
                    'caller' => $this->queryCallers[$key] ?? '',
                ];
            })->values()->all();
        }

        return [
            'time' => round((microtime(true) - $start) * 1000, 2),
            'query_count' => count($log ?? []),
            'queries' => $queries,
        ];
    }
}
