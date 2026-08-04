<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffPermissionMiddleware
{
    /**
     * Map permission prefixes to allowed route name prefixes.
     */
    private const PERMISSION_ROUTE_MAP = [
        'users' => ['admin.users'],
        'vehicles' => ['admin.vehicles', 'admin.vehicle-images', 'admin.vehicle-documents'],
        'staff' => ['admin.staff'],
        'payments' => ['admin.payments'],
        'bookings.inspect' => ['inspections'],
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized.');
        }

        // Full admin (no staff_role_id) has unrestricted access.
        if ($user->role === 'admin' && $user->staff_role_id === null) {
            return $next($request);
        }

        $staffRole = $user->staffRole;

        if (! $staffRole) {
            abort(403, 'Unauthorized.');
        }

        $permissions = $staffRole->permissions ?? [];
        $routeName = $request->route()?->getName() ?? '';

        // Check if any of the user's permissions grant access to this route
        foreach ($permissions as $permission) {
            $prefixGroup = self::PERMISSION_ROUTE_MAP[$permission] ?? [];

            foreach ($prefixGroup as $prefix) {
                if (str_starts_with($routeName, $prefix)) {
                    return $next($request);
                }
            }
        }

        abort(403, 'You do not have permission to access this page.');
    }
}
