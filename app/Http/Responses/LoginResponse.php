<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $role = $request->user()->role;

        $route = match ($role) {
            'admin'    => '/admin/dashboard',
            'owner'    => '/owner/dashboard',
            'driver'   => '/driver/dashboard',
            default    => '/customer/dashboard',
        };

        return redirect()->intended($route);
    }
}
