<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(): Response
    {
        $staff = User::where('role', 'admin')
            ->whereNotNull('staff_role_id')
            ->with(['staffRole', 'branch'])
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/staff/index', [
            'staff' => $staff,
            'roles' => Role::all(),
            'locations' => Location::orderBy('name')->get(['id', 'name', 'city']),
        ]);
    }

    public function create(): Response
    {
        $roles = Role::all();

        return Inertia::render('admin/staff/create', [
            'roles' => $roles,
            'locations' => Location::orderBy('name')->get(['id', 'name', 'city']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $role = Role::find($request->input('staff_role_id'));
        $isDriverRole = $role && in_array('driver.access', $role->permissions ?? [], true);

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'staff_role_id' => ['required', 'exists:roles,id'],
            'branch_id' => ['required', 'exists:locations,id'],
        ];

        if ($isDriverRole) {
            $rules = array_merge($rules, [
                'license_number' => ['required', 'string', 'max:100'],
                'license_type' => ['required', 'string', 'max:50'],
                'experience_years' => ['required', 'integer', 'min:0', 'max:50'],
            ]);
        }

        $validated = $request->validate($rules);

        $staff = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => '12345678',
            'role' => 'admin',
            'staff_role_id' => $validated['staff_role_id'],
            'branch_id' => $validated['branch_id'],
            'status' => 'active',
        ]);

        // Staff roles that grant driver access get a driver profile provisioned
        // with the license details captured at creation time. Drivers are
        // registered by admins, so profiles are considered verified.
        if ($isDriverRole) {
            DriverProfile::create([
                'user_id' => $staff->id,
                'license_number' => $validated['license_number'],
                'license_type' => $validated['license_type'],
                'experience_years' => $validated['experience_years'],
                'availability' => 'available',
                'verification_status' => 'approved',
            ]);
        }

        return redirect()->route('admin.staff.index')->with('toast', [
            'type' => 'success',
            'message' => 'Staff member created successfully.',
        ]);
    }

    public function show(User $staff): Response
    {
        abort_unless($staff->role === 'admin' && $staff->staff_role_id !== null, 404);

        $staff->load(['staffRole', 'branch']);

        return Inertia::render('admin/staff/show', [
            'staff' => $staff->only(['id', 'name', 'email', 'phone', 'status', 'created_at', 'staff_role', 'branch']),
        ]);
    }

    public function destroy(User $staff): RedirectResponse
    {
        abort_unless($staff->role === 'admin' && $staff->staff_role_id !== null, 404);

        $staff->delete();

        return redirect()->route('admin.staff.index')->with('toast', [
            'type' => 'success',
            'message' => 'Staff member deleted.',
        ]);
    }

    public function suspend(User $staff): RedirectResponse
    {
        abort_unless($staff->role === 'admin' && $staff->staff_role_id !== null, 404);

        $staff->update(['status' => 'suspended']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Staff member suspended.',
        ]);
    }

    public function activate(User $staff): RedirectResponse
    {
        abort_unless($staff->role === 'admin' && $staff->staff_role_id !== null, 404);

        $staff->update(['status' => 'active']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Staff member activated.',
        ]);
    }
}
