<?php

namespace App\Providers;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
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
        Carbon::setLocale('id');

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
