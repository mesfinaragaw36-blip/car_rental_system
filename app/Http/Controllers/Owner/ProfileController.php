<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(): Response
    {
        $user = auth()->user();
        $ownerProfile = $user->ownerProfile;

        return Inertia::render('owner/profile', [
            'ownerProfile' => [
                'id' => $ownerProfile->id,
                'owner_type' => $ownerProfile->owner_type,
                'business_name' => $ownerProfile->business_name,
                'organization_type' => $ownerProfile->organization_type,
                'organization_type_other' => $ownerProfile->organization_type_other,
                'tin_number' => $ownerProfile->tin_number,
                'address' => $ownerProfile->address,
                'national_id' => $ownerProfile->national_id,
                'national_id_front_file_path' => $ownerProfile->national_id_front_file_path,
                'national_id_back_file_path' => $ownerProfile->national_id_back_file_path,
                'trade_license_number' => $ownerProfile->trade_license_number,
                'business_license_file_path' => $ownerProfile->business_license_file_path,
                'profile_completed' => $ownerProfile->profile_completed,
                'verification_status' => $ownerProfile->verification_status,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $ownerProfile = $user->ownerProfile;

        // Validate based on owner type
        $rules = [
            'address' => ['nullable', 'string', 'max:500'],
        ];

        if ($ownerProfile->owner_type === 'organization') {
            $rules = [
                ...$rules,
                'organization_type' => ['required', 'string', Rule::in([
                    'private_limited_company',
                    'share_company',
                    'sole_proprietorship',
                    'partnership',
                    'cooperative',
                    'government_organization',
                    'ngo_non_profit',
                    'other',
                ])],
                'organization_type_other' => ['nullable', 'string', 'max:255'],
                'tin_number' => ['required', 'string', 'max:255'],
                'business_license' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            ];
        }

        $validated = $request->validate($rules);

        $updateData = [
            'address' => $validated['address'],
        ];

        if ($ownerProfile->owner_type === 'organization') {
            $updateData['organization_type'] = $validated['organization_type'];
            $updateData['organization_type_other'] = $validated['organization_type_other'] ?? null;
            $updateData['tin_number'] = $validated['tin_number'];

            // Handle business license upload
            if ($request->hasFile('business_license')) {
                if ($ownerProfile->business_license_file_path) {
                    Storage::disk('public')->delete($ownerProfile->business_license_file_path);
                }
                $updateData['business_license_file_path'] = $request->file('business_license')
                    ->store('owner/business_licenses', 'public');
            }

            // Mark profile as completed if all required fields are filled
            if (
                ! empty($updateData['organization_type']) &&
                ! empty($updateData['tin_number']) &&
                ($ownerProfile->business_license_file_path || isset($updateData['business_license_file_path']))
            ) {
                $updateData['profile_completed'] = true;

                if ($ownerProfile->verification_status === 'incomplete') {
                    $updateData['verification_status'] = 'pending';
                }
            }

            // If profile was already approved and owner makes changes,
            // send it back to pending for re-review.
            if ($ownerProfile->verification_status === 'approved') {
                $updateData['verification_status'] = 'pending';
            }
        } else {
            // For individual owners, mark as completed on first save.
            if (! $ownerProfile->profile_completed) {
                $updateData['profile_completed'] = true;

                if ($ownerProfile->verification_status === 'incomplete') {
                    $updateData['verification_status'] = 'pending';
                }
            }

            // If profile was already approved and owner makes changes,
            // send it back to pending for re-review.
            if ($ownerProfile->verification_status === 'approved') {
                $updateData['verification_status'] = 'pending';
            }
        }

        $ownerProfile->update($updateData);

        $message = isset($updateData['verification_status'])
            ? 'Profile submitted successfully. Your profile is now under review.'
            : 'Profile updated successfully.';

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => $message,
        ]);
    }
}
