<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            abort(403, 'Unauthorized.');
        }

        $userRole = $request->user()->role;

        // The 'staff' alias matches admin users who have a staff_role_id set
        if (in_array('staff', $roles) && $userRole === 'admin' && $request->user()->staff_role_id !== null) {
            return $next($request);
        }

        if (! in_array($userRole, $roles)) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
