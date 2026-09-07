<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        // Pastikan SystemRoot terdaftar di $_SERVER agar Symfony Process pada Windows (mysqldump) tidak memicu error TCP/IP 10106
        if (PHP_OS_FAMILY === 'Windows') {
            $systemRoot = getenv('SystemRoot') ?: getenv('windir') ?: 'C:\Windows';
            $systemDrive = getenv('SystemDrive') ?: substr($systemRoot, 0, 2);

            putenv("SystemRoot={$systemRoot}");
            putenv("windir={$systemRoot}");
            putenv("SystemDrive={$systemDrive}");

            $_ENV['SystemRoot'] = $systemRoot;
            $_ENV['windir'] = $systemRoot;
            $_ENV['SystemDrive'] = $systemDrive;

            $_SERVER['SystemRoot'] = $systemRoot;
            $_SERVER['windir'] = $systemRoot;
            $_SERVER['SystemDrive'] = $systemDrive;
        }

        Paginator::useBootstrapFive();
        Carbon::setLocale('id');

        Gate::define('viewLogViewer', function ($user) {
            return $user && (int) $user->role_id === 1;
        });

        View::composer('layouts.navbar', function ($view) {

            if (Auth::check()) {

                $view->with(
                    'unreadCount',
                    Auth::user()->unreadNotifications()->count()
                );

                $view->with(
                    'notifications',
                    Auth::user()
                        ->notifications()
                        ->latest()
                        ->take(5)
                        ->get()
                );
            }
        });
    }
}

