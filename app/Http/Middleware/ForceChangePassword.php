<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ForceChangePassword
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */

    public function handle(Request $request, Closure $next): Response
    {
        if (
            Auth::check() &&
            Auth::user()->must_change_password
        ) {

            // route yang boleh diakses
            $allowedRoutes = [
                'password.change',
                'password.update',
                'logout',
            ];

            if (!in_array($request->route()->getName(), $allowedRoutes)) {
                return redirect()->route('password.change');
            }
        }

        return $next($request);
    }

}
