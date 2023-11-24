<?php
namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    protected $namespace = 'App\Http\Controllers';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'));

            $this->mapAdminRoutes();
            $this->mapWxappRoutes();
            $this->mapWxRoutes();
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }

    public function mapAdminRoutes()
    {
        if(file_exists(base_path('routes/admin.php')))
        {
            Route::middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/admin.php'));
        }

        if(file_exists(base_path('routes/'.env('APP_NAME').'/admin.php')))
        {
            Route::middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/'.env('APP_NAME').'/admin.php'));
        }

    }

    protected function mapWxappRoutes()
    {
        if(file_exists(base_path('routes/wxapp.php')))
        {
            Route::middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/wxapp.php'));
        }

        if(file_exists(base_path('routes/'.env('APP_NAME').'/wxapp.php')))
        {
            Route::middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/'.env('APP_NAME').'/wxapp.php'));
        }

    }

    protected function mapWxRoutes()
    {
        if(file_exists(base_path('routes/wx.php')))
        {
            Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/wx.php'));
        }
    }
}
