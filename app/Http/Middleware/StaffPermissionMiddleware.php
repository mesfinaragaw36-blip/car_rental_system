<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffPermissionMiddleware
{
    /**
     * Map route names to the permission(s) required to access them.
     *
     * Staff users (admins with a staff_role_id) may only reach routes
     * listed here, and only if they hold one of the required permissions.
     */
    private const ROUTE_PERMISSIONS = [
        // Admin vehicles
        'admin.vehicles' => ['vehicles.view'],
        'admin.vehicles.show' => ['vehicles.view'],
        'admin.vehicles.approve' => ['vehicles.approve'],
        'admin.vehicles.reject' => ['vehicles.approve'],
        'admin.vehicles.documents.approve' => ['vehicles.documents'],
        'admin.vehicles.documents.reject' => ['vehicles.documents'],
        'admin.vehicles.create' => ['vehicles.approve'],
        'admin.vehicles.store' => ['vehicles.approve'],
        'admin.vehicles.destroy' => ['vehicles.manage'],
        'admin.vehicle-images' => ['vehicles.view', 'vehicles.approve'],
        'admin.vehicle-documents' => ['vehicles.view', 'vehicles.documents'],
        'admin.vehicle-documents.store' => ['vehicles.documents'],

        // Admin drivers
        'admin.drivers.index' => ['drivers.view'],
        'admin.drivers.suspend' => ['drivers.manage'],
        'admin.drivers.activate' => ['drivers.manage'],

        // Admin transactions
        'admin.transactions.index' => ['payments.view'],
        'admin.transactions.refunds.process' => ['payments.view', 'payments.manage'],
        'admin.transactions.owner-payouts.mark-paid' => ['payments.view', 'payments.manage'],
        'admin.transactions.driver-payouts.mark-paid' => ['payments.view', 'payments.manage'],

        // Admin users
        'admin.users.index' => ['users.view'],
        'admin.users.create' => ['users.create'],
        'admin.users.store' => ['users.create'],
        'admin.users.show' => ['users.view'],
        'admin.users.edit' => ['users.edit'],
        'admin.users.update' => ['users.edit'],
        'admin.users.destroy' => ['users.delete'],
        'admin.users.trashed' => ['users.view', 'users.delete'],
        'admin.users.restore' => ['users.delete'],
        'admin.users.suspend' => ['users.edit', 'users.manage'],
        'admin.users.activate' => ['users.edit', 'users.manage'],
        'admin.users.verify-owner' => ['owner_profiles.verify'],
        'admin.users.reject-owner' => ['owner_profiles.verify'],
        'admin.users.verify-driver' => ['driver_profiles.verify'],
        'admin.users.reject-driver' => ['driver_profiles.verify'],

        // Admin staff
        'admin.staff.index' => ['staff.view'],
        'admin.staff.create' => ['staff.create'],
        'admin.staff.store' => ['staff.create'],
        'admin.staff.show' => ['staff.view'],
        'admin.staff.destroy' => ['staff.manage'],
        'admin.staff.suspend' => ['staff.manage'],
        'admin.staff.activate' => ['staff.manage'],

        // Admin roles
        'admin.roles.index' => ['roles.view'],
        'admin.roles.create' => ['roles.manage'],
        'admin.roles.store' => ['roles.manage'],
        'admin.roles.show' => ['roles.view'],
        'admin.roles.edit' => ['roles.manage'],
        'admin.roles.update' => ['roles.manage'],
        'admin.roles.destroy' => ['roles.manage'],

        // Admin car types
        'admin.car-types.type-names' => ['car-types.view', 'car-types.manage'],
        'admin.car-types.type-names.store' => ['car-types.manage'],
        'admin.car-types.type-names.update' => ['car-types.manage'],
        'admin.car-types.type-names.destroy' => ['car-types.manage'],

        // Admin locations
        'admin.locations.index' => ['locations.view', 'locations.manage'],
        'admin.locations.create' => ['locations.manage'],
        'admin.locations.store' => ['locations.manage'],
        'admin.locations.edit' => ['locations.manage'],
        'admin.locations.update' => ['locations.manage'],
        'admin.locations.destroy' => ['locations.manage'],

        // Reviews
        'reviews.destroy' => ['reviews.manage'],

        // Bookings
        'bookings.index' => ['bookings.view'],
        'bookings.show' => ['bookings.view'],
        'bookings.approve' => ['bookings.manage'],
        'bookings.reject' => ['bookings.manage'],
        'bookings.complete' => ['bookings.manage'],

        // Payments
        'payments.index' => ['payments.view', 'bookings.view'],
        'payments.receipt' => ['payments.view', 'bookings.view'],

        // Inspections
        'inspections.index' => ['bookings.inspect'],
        'inspections.delivery' => ['bookings.inspect'],
        'inspections.conduct' => ['bookings.inspect'],
        'inspections.handover' => ['bookings.inspect'],
        'inspections.returned' => ['bookings.inspect'],
        'inspections.return-arrival' => ['bookings.inspect'],
        'inspections.return-not-arrived' => ['bookings.inspect'],
        'inspections.complete' => ['bookings.inspect'],

        // Disputes
        'disputes.index' => ['disputes.view'],
        'disputes.approve' => ['disputes.manage'],
        'disputes.reject' => ['disputes.manage'],

        // Driver portal (staff accounts granted the driver.access permission)
        'driver.profile' => ['driver.access'],
        'driver.profile.update' => ['driver.access'],
        'driver.toggle-availability' => ['driver.access'],
        'driver.trip-history' => ['driver.access'],
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized.');
        }

        // Full admins and non-staff roles are not restricted by permissions.
        if ($user->role !== 'admin' || $user->staff_role_id === null) {
            return $next($request);
        }

        $permissions = $user->staffRole?->permissions ?? [];
        $routeName = $request->route()?->getName() ?? '';
        $required = self::ROUTE_PERMISSIONS[$routeName] ?? [];

        if ($required === []) {
            abort(403, 'You do not have permission to access this page.');
        }

        foreach ($required as $permission) {
            if (in_array($permission, $permissions, true)) {
                return $next($request);
            }
        }

        abort(403, 'You do not have permission to access this page.');
    }
}
