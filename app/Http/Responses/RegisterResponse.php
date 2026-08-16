<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $redirect = $request->input('redirect');

        if (is_string($redirect) && $this->isSafeInternalPath($redirect)) {
            return redirect($redirect);
        }

        return redirect('/');
    }

    private function isSafeInternalPath(string $path): bool
    {
        return str_starts_with($path, '/')
            && ! str_starts_with($path, '//')
            && ! str_contains($path, "\0");
    }
}
