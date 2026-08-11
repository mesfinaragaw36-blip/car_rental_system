<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * All available permissions that can be assigned to roles.
     */
    public const AVAILABLE_PERMISSIONS = [
        'bookings' => [
            'label' => 'Bookings',
            'items' => [
                'bookings.view' => 'View Bookings',
                'bookings.manage' => 'Approve / Reject Bookings',
                'bookings.cancel' => 'Cancel Bookings',
                'bookings.inspect' => 'Inspect Bookings',
            ],
        ],
        'vehicles' => [
            'label' => 'Vehicles',
            'items' => [
                'vehicles.view' => 'View Vehicles',
                'vehicles.approve' => 'Approve / Reject Vehicles',
                'vehicles.documents' => 'Manage Vehicle Documents',
                'vehicles.manage' => 'Delete / Toggle Availability',
            ],
        ],
        'users' => [
            'label' => 'Users',
            'items' => [
                'users.view' => 'View Users',
                'users.create' => 'Create Users',
                'users.edit' => 'Edit Users',
                'users.delete' => 'Delete Users',
                'users.manage' => 'Suspend / Activate Users',
            ],
        ],
        'profiles' => [
            'label' => 'Profile Verification',
            'items' => [
                'owner_profiles.verify' => 'Verify Owner Profiles',
                'driver_profiles.verify' => 'Verify Driver Profiles',
            ],
        ],
        'staff' => [
            'label' => 'Staff',
            'items' => [
                'staff.view' => 'View Staff',
                'staff.create' => 'Create Staff',
                'staff.manage' => 'Suspend / Activate / Delete Staff',
            ],
        ],
        'drivers' => [
            'label' => 'Drivers',
            'items' => [
                'drivers.view' => 'View Drivers',
                'drivers.manage' => 'Suspend / Activate Drivers',
            ],
        ],
        'payments' => [
            'label' => 'Payments & Transactions',
            'items' => [
                'payments.view' => 'View Transactions',
                'payments.manage' => 'Process Refunds / Mark Payouts Paid',
            ],
        ],
        'disputes' => [
            'label' => 'Disputes',
            'items' => [
                'disputes.view' => 'View Disputes',
                'disputes.manage' => 'Resolve Disputes',
            ],
        ],
        'roles' => [
            'label' => 'Roles & Permissions',
            'items' => [
                'roles.view' => 'View Roles',
                'roles.manage' => 'Create / Edit / Delete Roles',
            ],
        ],
        'locations' => [
            'label' => 'Locations',
            'items' => [
                'locations.view' => 'View Locations',
                'locations.manage' => 'Manage Locations',
            ],
        ],
        'car-types' => [
            'label' => 'Car Types',
            'items' => [
                'car-types.view' => 'View Car Types',
                'car-types.manage' => 'Manage Car Types',
            ],
        ],
        'reviews' => [
            'label' => 'Reviews',
            'items' => [
                'reviews.manage' => 'Delete Reviews',
            ],
        ],
    ];

    public function index(): Response
    {
        $roles = Role::withCount('staff')->latest()->get();

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'availablePermissions' => self::AVAILABLE_PERMISSIONS,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/roles/create', [
            'availablePermissions' => self::AVAILABLE_PERMISSIONS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string'],
        ]);

        Role::create([
            'name' => $validated['name'],
            'permissions' => $validated['permissions'],
        ]);

        return redirect()->route('admin.roles.index')->with('toast', [
            'type' => 'success',
            'message' => 'Role created successfully.',
        ]);
    }

    public function show(Role $role): Response
    {
        $role->loadCount('staff');

        return Inertia::render('admin/roles/show', [
            'role' => $role,
            'availablePermissions' => self::AVAILABLE_PERMISSIONS,
        ]);
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('admin/roles/edit', [
            'role' => $role,
            'availablePermissions' => self::AVAILABLE_PERMISSIONS,
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,'.$role->id],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string'],
        ]);

        $role->update([
            'name' => $validated['name'],
            'permissions' => $validated['permissions'],
        ]);

        return redirect()->route('admin.roles.index')->with('toast', [
            'type' => 'success',
            'message' => 'Role updated successfully.',
        ]);
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->staff()->count() > 0) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete role that has staff members assigned. Reassign them first.',
            ]);
        }

        $role->delete();

        return redirect()->route('admin.roles.index')->with('toast', [
            'type' => 'success',
            'message' => 'Role deleted successfully.',
        ]);
    }
}
