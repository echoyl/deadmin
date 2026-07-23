<?php

namespace App\Providers;

use App\Extensions\MySqlGrammar;
use App\Extensions\MySqlProcessor;
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
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        $connection = $this->app->make('db')->connection();
        $connection->setSchemaGrammar(new MySqlGrammar($connection));
        $connection->setPostProcessor(new MySqlProcessor);

        Blade::component('components.footer', 'footer');
        View::share("pstatic", URL::asset(env('APP_PREFIX', '') . 'webstatic/pc'));
        View::share("mstatic", URL::asset(env('APP_PREFIX', '') . 'webstatic/mobile'));
    }
}
