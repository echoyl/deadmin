<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
        //$this->app->bind(\App\Constracts\SaServiceInterface::class,config('sa.service'));
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        Blade::component('components.footer', 'footer');
        View::share("pstatic", URL::asset(env('APP_PREFIX', '') . 'webstatic/pc'));
        View::share("mstatic", URL::asset(env('APP_PREFIX', '') . 'webstatic/mobile'));
    }
}
