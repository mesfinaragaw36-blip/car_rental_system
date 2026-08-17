<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\CustomerIdentity;
use App\Models\DriverProfile;
use App\Models\OwnerProfile;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profile = null;

        if ($user->role === 'owner') {
            $profile = $user->ownerProfile?->toArray();
        } elseif ($user->hasDriverPermission()) {
            $profile = $user->driverProfile?->toArray();
        } elseif ($user->role === 'customer') {
            $profile = $user->customerIdentity?->toArray();
        }

        if ($profile !== null) {
            $profile['average_rating'] = round($user->reviews()->avg('rating') ?? 0, 1);
            $profile['review_count'] = $user->reviews()->count();
        }

        if ($request->query('booking_gate') === 'requires_approval') {
    $identity = $user->customerIdentity;

    $message = match ($identity?->verification_status) {
        CustomerIdentity::STATUS_PENDING =>
            'Your national ID is currently under review. You can book a car once your verification is approved.',

        CustomerIdentity::STATUS_REJECTED =>
            'Your national ID verification was rejected. Please review and resubmit your ID information.',

        default =>
            'Please submit your national ID to complete verification before booking a car.',
    };

    Inertia::flash('toast', [
        'type' => 'error',
        'message' => $message,
    ]);
}
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => $profile,
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill(Arr::only($validated, ['name', 'email', 'phone', 'address']));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($user->role === 'owner') {
            $ownerData = Arr::only($validated, ['national_id']);

            if ($request->hasFile('national_id_front_file')) {
                $ownerData['national_id_front_file_path'] = $request->file('national_id_front_file')->store('owner_documents', 'public');
            }

            if ($request->hasFile('national_id_back_file')) {
                $ownerData['national_id_back_file_path'] = $request->file('national_id_back_file')->store('owner_documents', 'public');
            }

            OwnerProfile::updateOrCreate(
                ['user_id' => $user->id],
                $ownerData
            );
        }

        if ($user->hasDriverPermission()) {
            $driverProfileData = Arr::only($validated, ['license_number', 'license_type', 'experience_years', 'location']);
            DriverProfile::updateOrCreate(['user_id' => $user->id], $driverProfileData);
        }

        if ($user->role === 'customer') {
            $identity = $user->customerIdentity;
            $isLocked = $identity?->verification_status === 'approved';

            if (! $isLocked) {
                $data = [
                    'national_id_number' => $validated['national_id_number'],
                    'verification_status' => 'pending',
                    'verified_at' => null,
                ];

                if ($request->hasFile('national_id_front')) {
                    $data['national_id_front_path'] = $request->file('national_id_front')->store('national-ids', 'public');
                }

                if ($request->hasFile('national_id_back')) {
                    $data['national_id_back_path'] = $request->file('national_id_back')->store('national-ids', 'public');
                }

                CustomerIdentity::updateOrCreate(['user_id' => $user->id], $data);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        if ($user->role === 'owner') {
            return to_route('vehicles.index');
        }

        return to_route('profile.edit');
    }

    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
