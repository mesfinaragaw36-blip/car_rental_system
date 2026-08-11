<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffPermissionMiddleware
{
    /**
     * Map permission names to allowed route name prefixes.
     */
    private const PERMISSION_ROUTE_MAP = [
        'users' => ['admin.users'],
        'vehicles' => [
            'admin.vehicles',
            'admin.vehicle-images',
            'admin.vehicle-documents',
        ],
        'staff' => ['admin.staff'],
        'payments' => ['admin.payments'],
        'bookings.inspect' => ['inspections'],
        'driver.access' => ['driver'],
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized.');
        }

        // Full admin has unrestricted access.
        if ($user->isFullAdmin()) {
            return $next($request);
        }

        $staffRole = $user->staffRole;

        if (! $staffRole) {
            abort(403, 'Unauthorized.');
        }

        $permissions = $staffRole->permissions ?? [];
        $routeName = $request->route()?->getName() ?? '';

        /*
         * A staff account with driver.access is treated as a driver
         * for driver routes, not as ordinary staff.
         */
        if (
            in_array('driver.access', $permissions, true)
            && str_starts_with($routeName, 'driver.')
        ) {
            return $next($request);
        }

        // Check the remaining staff permissions.
        foreach ($permissions as $permission) {
            if ($permission === 'driver.access') {
                continue;
            }

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