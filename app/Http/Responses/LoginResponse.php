<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        $redirect = $request->input('redirect');

        if (is_string($redirect) && $this->isSafeInternalPath($redirect)) {
            return redirect($redirect);
        }

        if ($user->role === 'customer') {
            return to_route('cars.index');
        }

        return redirect()->intended('/dashboard');
    }

    private function isSafeInternalPath(string $path): bool
    {
        return str_starts_with($path, '/')
            && ! str_starts_with($path, '//')
            && ! str_contains($path, "\0");
    }
}
