<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::where('role', '!=', 'admin')
            ->orWhere(function ($q) {
                $q->where('role', 'admin')->whereNull('staff_role_id');
            });

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['customer', 'owner'])],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => 'active',
        ]);

        return redirect()->route('admin.users.index')->with('toast', [
            'type' => 'success',
            'message' => 'User created successfully.',
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['ownerProfile', 'driverProfile']);

        $driverReviews = [];
        if ($user->hasDriverPermission()) {
            $driverReviews = $user->reviews()->with('reviewer')->latest()->take(10)->get()->map(function ($r) {
                return [
                    'id' => $r->id,
                    'reviewer' => ['id' => $r->reviewer->id, 'name' => $r->reviewer->name],
                    'rating' => $r->rating,
                    'review_text' => $r->review_text,
                    'created_at' => $r->created_at->toDateTimeString(),
                ];
            })->toArray();
        }

        return Inertia::render('admin/users/show', [
            'user' => array_merge($user->toArray(), ['reviews' => $driverReviews]),
        ]);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone,'.$user->id],
            'role' => ['required', Rule::in(['customer', 'owner'])],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.users.index')->with('toast', [
            'type' => 'success',
            'message' => 'User updated successfully.',
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->route('admin.users.index')->with('toast', [
            'type' => 'success',
            'message' => 'User deleted successfully.',
        ]);
    }

    public function trashed(): Response
    {
        $users = User::onlyTrashed()->latest('deleted_at')->paginate(15);

        return Inertia::render('admin/users/trashed', [
            'users' => $users,
        ]);
    }

    public function restore(int $id): RedirectResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'User restored successfully.',
        ]);
    }

    public function suspend(User $user): RedirectResponse
    {
        $user->update(['status' => 'suspended']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'User suspended.',
        ]);
    }

    public function activate(User $user): RedirectResponse
    {
        $user->update(['status' => 'active']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'User activated.',
        ]);
    }

    public function verifyOwner(User $user): RedirectResponse
    {
        $profile = $user->ownerProfile;

        if (! $profile) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No owner profile found for this user.',
            ]);
        }

        $profile->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Owner profile verified.',
        ]);
    }

    public function rejectOwner(User $user): RedirectResponse
    {
        $profile = $user->ownerProfile;

        if (! $profile) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No owner profile found for this user.',
            ]);
        }

        $profile->update([
            'verification_status' => 'rejected',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Owner profile rejected.',
        ]);
    }

    public function verifyDriver(User $user): RedirectResponse
    {
        $profile = $user->driverProfile;

        if (! $profile) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No driver profile found for this user.',
            ]);
        }

        $profile->update([
            'verification_status' => 'approved',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Driver profile verified.',
        ]);
    }

    public function rejectDriver(User $user): RedirectResponse
    {
        $profile = $user->driverProfile;

        if (! $profile) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No driver profile found for this user.',
            ]);
        }

        $profile->update([
            'verification_status' => 'rejected',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Driver profile rejected.',
        ]);
    }
}
