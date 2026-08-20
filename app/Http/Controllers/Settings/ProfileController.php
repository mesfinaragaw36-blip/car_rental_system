<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\BookingDriver;
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
            $ownerProfile = $user->ownerProfile;
            $profile = $ownerProfile?->toArray();

            // Include owner type and organization fields
            if ($profile && $ownerProfile) {
                $profile['owner_type'] = $ownerProfile->owner_type;
                $profile['business_name'] = $ownerProfile->business_name;
                $profile['organization_type'] = $ownerProfile->organization_type;
                $profile['organization_type_other'] = $ownerProfile->organization_type_other;
                $profile['tin_number'] = $ownerProfile->tin_number;
                $profile['trade_license_number'] = $ownerProfile->trade_license_number;
                $profile['is_organization'] = $ownerProfile->owner_type === 'organization';
            }
        } elseif ($user->hasDriverPermission()) {
            $profile = $user->driverProfile?->toArray();
        } elseif ($user->role === 'customer') {
            $profile = $user->customerIdentity?->toArray();
        }

        if ($profile !== null) {
            $profile['refund_method'] = $user->refund_method;
            $profile['cbe_account_number'] = $user->cbe_account_number;
            $profile['cbe_account_holder_name'] = $user->cbe_account_holder_name;
            $profile['telebirr_number'] = $user->telebirr_number;
            $profile['telebirr_account_holder_name'] = $user->telebirr_account_holder_name;

            $profile['average_rating'] = round($user->reviews()->avg('rating') ?? 0, 1);
            $profile['review_count'] = $user->reviews()->count();
        }

        if ($request->query('booking_gate') === 'requires_approval') {
            $identity = $user->customerIdentity;

            $message = match ($identity?->verification_status) {
                CustomerIdentity::STATUS_PENDING => 'Your national ID is currently under review. You can book a car once your verification is approved.',

                CustomerIdentity::STATUS_REJECTED => 'Your national ID verification was rejected. Please review and resubmit your ID information.',

                default => 'Please submit your national ID to complete verification before booking a car.',
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

        $user->fill(Arr::only($validated, [
            'name',
            'email',
            'phone',
            'address',
            'refund_method',
            'cbe_account_number',
            'cbe_account_holder_name',
            'telebirr_number',
            'telebirr_account_holder_name',
        ]));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($user->role === 'owner') {
            $ownerData = Arr::only($validated, ['national_id', 'business_name', 'organization_type', 'organization_type_other', 'tin_number', 'trade_license_number', 'address']);

            if ($request->hasFile('national_id_front_file')) {
                $ownerData['national_id_front_file_path'] = $request->file('national_id_front_file')->store('owner_documents', 'public');
            }

            if ($request->hasFile('national_id_back_file')) {
                $ownerData['national_id_back_file_path'] = $request->file('national_id_back_file')->store('owner_documents', 'public');
            }

            $existingProfile = $user->ownerProfile;
            $isOrgOwner = $existingProfile && $existingProfile->owner_type === 'organization';

            if ($isOrgOwner) {
                // Mark profile completed if all required org fields are filled
                if (
                    ! empty($ownerData['organization_type']) &&
                    ! empty($ownerData['tin_number'])
                ) {
                    $ownerData['profile_completed'] = true;

                    if ($existingProfile && $existingProfile->verification_status === 'incomplete') {
                        $ownerData['verification_status'] = 'pending';
                    }
                }

                // Check if critical org fields changed for re-approval
                if ($existingProfile) {
                    $criticalOwnerFieldsChanged =
                        (isset($ownerData['organization_type']) && $existingProfile->organization_type !== $ownerData['organization_type']) ||
                        (isset($ownerData['tin_number']) && $existingProfile->tin_number !== $ownerData['tin_number']) ||
                        (isset($ownerData['business_name']) && $existingProfile->business_name !== $ownerData['business_name']) ||
                        $request->hasFile('national_id_front_file') ||
                        $request->hasFile('national_id_back_file');

                    if ($criticalOwnerFieldsChanged && $existingProfile->verification_status === 'approved') {
                        $ownerData['verification_status'] = 'pending';
                        $ownerData['verified_at'] = null;
                    }
                }
            } else {
                // Individual owner: mark profile completed and move from incomplete to pending
                if ($existingProfile && ! $existingProfile->profile_completed) {
                    $ownerData['profile_completed'] = true;

                    if ($existingProfile->verification_status === 'incomplete') {
                        $ownerData['verification_status'] = 'pending';
                    }
                }

                // If profile was already approved and owner makes changes, re-approve
                if ($existingProfile && $existingProfile->verification_status === 'approved') {
                    $criticalOwnerFieldsChanged =
                        $request->hasFile('national_id_front_file') ||
                        $request->hasFile('national_id_back_file');

                    if ($criticalOwnerFieldsChanged) {
                        $ownerData['verification_status'] = 'pending';
                        $ownerData['verified_at'] = null;
                    }
                }
            }

            OwnerProfile::updateOrCreate(
                ['user_id' => $user->id],
                $ownerData
            );
        }

        if ($user->hasDriverPermission()) {
            $profile = $user->driverProfile;
            $isNewProfile = ! $profile;

            // Check if driver has active assignments
            $hasActiveAssignments = BookingDriver::where('driver_id', $user->id)
                ->whereIn('status', ['assigned', 'accepted'])
                ->exists();

            $driverProfileData = Arr::only($validated, [
                'license_number',
                'license_type',
                'experience_years',
                'location',
                'gender',
                'daily_rate',
                'telebirr_phone',
                'cbe_account',
            ]);

            // Decode proficient_language JSON array
            if (isset($validated['proficient_language']) && $validated['proficient_language'] !== null) {
                $decoded = json_decode($validated['proficient_language'], true);
                $driverProfileData['proficient_language'] = is_array($decoded) ? $decoded : null;
            } else {
                $driverProfileData['proficient_language'] = null;
            }

            // Check if license fields are being changed
            $licenseFieldChanged = false;
            if (! $isNewProfile && $hasActiveAssignments) {
                $licenseFieldChanged =
                    ($request->filled('license_number') && $profile->license_number !== $request->input('license_number')) ||
                    ($request->filled('license_type') && $profile->license_type !== $request->input('license_type')) ||
                    $request->hasFile('license_file');

                if ($licenseFieldChanged) {
                    Inertia::flash('toast', [
                        'type' => 'error',
                        'message' => 'You cannot update license information while you have active assignments. Please complete or reject your current assignments first.',
                    ]);

                    return to_route('profile.edit');
                }
            }

            // Handle license file upload
            if ($request->hasFile('license_file')) {
                $path = $request->file('license_file')->store('driver-licenses', 'public');
                $driverProfileData['license_file_path'] = '/storage/'.$path;
            }

            // Check if critical fields (license info) have changed
            $criticalFieldsChanged = false;
            if (! $isNewProfile) {
                $criticalFieldsChanged =
                    (isset($driverProfileData['license_number']) && $profile->license_number !== $driverProfileData['license_number']) ||
                    (isset($driverProfileData['license_type']) && $profile->license_type !== $driverProfileData['license_type']) ||
                    $request->hasFile('license_file');
            }

            // If critical fields changed OR new profile, set to pending status
            if ($criticalFieldsChanged || $isNewProfile) {
                $driverProfileData['verification_status'] = 'pending';
            }

            DriverProfile::updateOrCreate(['user_id' => $user->id], $driverProfileData);

            // Update flash message if license info was updated
            if ($criticalFieldsChanged) {
                Inertia::flash('toast', [
                    'type' => 'success',
                    'message' => 'Profile updated. Since you changed critical license information, your profile needs admin re-approval before you can accept new assignments.',
                ]);

                return to_route('profile.edit');
            }
        }

        if ($user->role === 'customer') {
            $identity = $user->customerIdentity;
            $isLocked = $identity?->verification_status === 'approved';

            if (! $isLocked) {
                $isResubmission = $identity && in_array($identity->verification_status, ['pending', 'rejected']);

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

                if ($isResubmission) {
                    Inertia::flash('toast', [
                        'type' => 'success',
                        'message' => 'Identity updated. Your profile needs admin re-approval before you can book vehicles.',
                    ]);

                    return to_route('profile.edit');
                }
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
