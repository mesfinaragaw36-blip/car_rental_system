<?php

namespace App\Http\Controllers;

use App\Models\DriverProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverProfileController extends Controller
{
    public function show(): Response
    {
        $driver = auth()->user();
        $profile = $driver->driverProfile;

        $recent = $driver->reviews()->with('reviewer')->latest()->take(5)->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'reviewer' => ['id' => $r->reviewer->id, 'name' => $r->reviewer->name],
                'rating' => $r->rating,
                'review_text' => $r->review_text,
                'created_at' => $r->created_at->toDateTimeString(),
            ];
        })->toArray();

        // Check for active assignments
        $hasActiveAssignments = \App\Models\BookingDriver::where('driver_id', $driver->id)
            ->whereIn('status', ['assigned', 'accepted'])
            ->exists();

        return Inertia::render('driver/profile', [
            'profile' => $profile ? [
                'id' => $profile->id,
                'license_number' => $profile->license_number,
                'license_type' => $profile->license_type,
                'experience_years' => $profile->experience_years,
                'location' => $profile->location,
                'gender' => $profile->gender,
                'daily_rate' => $profile->daily_rate,
                'license_file_path' => $profile->license_file_path,
                'telebirr_phone' => $profile->telebirr_phone,
                'cbe_account' => $profile->cbe_account,
                'verification_status' => $profile->verification_status,
                'average_rating' => round($driver->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $driver->reviews()->count(),
                'recent_reviews' => $recent,
            ] : null,
            'hasActiveAssignments' => $hasActiveAssignments,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();
        $profile = $user->driverProfile;
        $isNewProfile = ! $profile;

        // Check if driver has active assignments - Block ALL updates
        $hasActiveAssignments = \App\Models\BookingDriver::where('driver_id', $user->id)
            ->whereIn('status', ['assigned', 'accepted'])
            ->exists();

        if ($hasActiveAssignments && ! $isNewProfile) {
            return redirect()->route('driver.profile')->with('toast', [
                'type' => 'error',
                'message' => 'You cannot update any profile information while you have active assignments. Please complete or reject your current assignments first.',
            ]);
        }

        $validated = $request->validate([
            'license_number' => 'required|string|max:100',
            'license_type' => 'required|string|max:50',
            'experience_years' => 'required|integer|min:0|max:50',
            'location' => 'required|string|max:255',
            'gender' => 'required|string|in:Male,Female',
            'daily_rate' => 'required|numeric|min:0',
            'license_file' => $isNewProfile ? 'required|file|mimes:jpeg,png,jpg,pdf|max:5120' : 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'telebirr_phone' => 'nullable|string|max:20',
            'cbe_account' => 'nullable|string|max:50',
        ]);

        $profileData = [
            'license_number' => $validated['license_number'],
            'license_type' => $validated['license_type'],
            'experience_years' => $validated['experience_years'],
            'location' => $validated['location'],
            'gender' => $validated['gender'],
            'daily_rate' => $validated['daily_rate'],
            'telebirr_phone' => $validated['telebirr_phone'] ?? null,
            'cbe_account' => $validated['cbe_account'] ?? null,
        ];

        // Check if critical fields (license info) have changed
        $criticalFieldsChanged = false;
        if (! $isNewProfile) {
            $criticalFieldsChanged = 
                $profile->license_number !== $validated['license_number'] ||
                $profile->license_type !== $validated['license_type'] ||
                $request->hasFile('license_file');
        }

        // If critical fields changed OR new profile, set to pending status
        if ($criticalFieldsChanged || $isNewProfile) {
            $profileData['verification_status'] = 'pending';
        }

        // Handle license file upload
        if ($request->hasFile('license_file')) {
            $path = $request->file('license_file')->store('driver-licenses', 'public');
            $profileData['license_file_path'] = '/storage/'.$path;
        }

        \App\Models\DriverProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData,
        );

        $message = $isNewProfile 
            ? 'Profile created. Your details are now under review — an admin will approve them shortly.'
            : ($criticalFieldsChanged 
                ? 'Profile updated. Since you changed critical license information, your profile needs admin re-approval before you can accept new assignments.'
                : 'Profile updated successfully.');

        return redirect()->route('driver.profile')->with('toast', [
            'type' => 'success',
            'message' => $message,
        ]);
    }
}
