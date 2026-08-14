<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerIdentity;
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
        $baseQuery = function ($query) {
            $query->where(function ($q) {
                $q->where('role', '!=', 'admin')
                    ->orWhere(function ($q) {
                        $q->where('role', 'admin')
                            ->whereNull('staff_role_id');
                    });
            });
        };

        $query = User::query();

        $baseQuery($query);

        // Load verification profiles so the frontend can display
        // owner/driver verification status.
        $query->with([
            'ownerProfile:id,user_id,business_name,verification_status,verified_at',
            'driverProfile:id,user_id,license_number,verification_status',
        ]);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        // This is the ACCOUNT status, not verification status.
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query
            ->with('customerIdentity:id,user_id,verification_status')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $users->getCollection()->transform(function (User $user) {
            return array_merge($user->toArray(), [
                'customer_identity_status' => $user->customerIdentity?->verification_status,
                'has_customer_identity' => $user->customerIdentity !== null,
            ]);
        });

        /*
         * Dashboard statistics
         */
        $statsQuery = User::query();
        $baseQuery($statsQuery);

        $total = (clone $statsQuery)->count();

        $owners = (clone $statsQuery)
            ->where('role', 'owner')
            ->count();

        $pending = (clone $statsQuery)
            ->where(function ($q) {
                $q->whereHas('ownerProfile', function ($q) {
                    $q->where('verification_status', 'pending');
                })->orWhereHas('driverProfile', function ($q) {
                    $q->where('verification_status', 'pending');
                });
            })
            ->count();

        $approved = (clone $statsQuery)
            ->where(function ($q) {
                $q->whereHas('ownerProfile', function ($q) {
                    $q->where('verification_status', 'approved');
                })->orWhereHas('driverProfile', function ($q) {
                    $q->where('verification_status', 'approved');
                });
            })
            ->count();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only([
                'search',
                'role',
                'status',
            ]),
            'stats' => [
                'total' => $total,
                'owners' => $owners,
                'pending' => $pending,
                'approved' => $approved,
            ],
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
        $user->load(['ownerProfile', 'driverProfile', 'customerIdentity.verifiedBy:id,name']);

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

        $userArray = $user->toArray();

        if ($user->customerIdentity) {
            $userArray['customer_identity'] = array_merge($user->customerIdentity->toArray(), [
                'verified_by_name' => $user->customerIdentity->verifiedBy?->name,
            ]);
        }

        return Inertia::render('admin/users/show', [
            'user' => array_merge($userArray, ['reviews' => $driverReviews]),
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

    public function verifyCustomerIdentity(User $user): RedirectResponse
    {
        $identity = $user->customerIdentity;

        if (! $identity) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No customer identity found for this user.',
            ]);
        }

        $identity->update([
            'verification_status' => CustomerIdentity::STATUS_APPROVED,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        $user->notifyNow(
            'Your account has been verified',
            'Your national ID verification was approved. You can now book vehicles.',
            'customer_verified',
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Customer identity verified.',
        ]);
    }

    public function rejectCustomerIdentity(User $user): RedirectResponse
    {
        $identity = $user->customerIdentity;

        if (! $identity) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No customer identity found for this user.',
            ]);
        }

        $identity->update([
            'verification_status' => CustomerIdentity::STATUS_REJECTED,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        $user->notifyNow(
            'Your verification was not approved',
            'Your national ID verification was rejected. Please review your profile and resubmit.',
            'customer_rejected',
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Customer identity rejected.',
        ]);
    }

    public function verifyCustomer(User $user): RedirectResponse
    {
        $identity = $user->customerIdentity;

        if (! $identity) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No customer verification submission found for this user.',
            ]);
        }

        $identity->update([
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        $user->notifyNow(
            'Your account has been verified',
            'Your national ID verification was approved. You can now book vehicles.',
            'customer_verified',
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Customer verified.',
        ]);
    }

    public function rejectCustomer(User $user): RedirectResponse
    {
        $identity = $user->customerIdentity;

        if (! $identity) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'No customer verification submission found for this user.',
            ]);
        }

        $identity->update([
            'verification_status' => 'rejected',
        ]);

        $user->notifyNow(
            'Your verification was not approved',
            'Your national ID verification was rejected. Please review your profile and resubmit.',
            'customer_rejected',
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Customer verification rejected.',
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
