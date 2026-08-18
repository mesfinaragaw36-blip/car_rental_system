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
                'verification_status' => $profile->verification_status,
                'average_rating' => round($driver->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $driver->reviews()->count(),
                'recent_reviews' => $recent,
            ] : null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $profile = $user->driverProfile;
        $isNewProfile = ! $profile;

        $validated = $request->validate([
            'license_number' => 'required|string|max:100',
            'license_type' => 'required|string|max:50',
            'experience_years' => 'required|integer|min:0|max:50',
            'location' => 'required|string|max:255',
            'gender' => 'required|string|in:Male,Female',
            'daily_rate' => 'required|numeric|min:0',
            'license_file' => $isNewProfile ? 'required|file|mimes:jpeg,png,jpg,pdf|max:5120' : 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $profileData = [
            'license_number' => $validated['license_number'],
            'license_type' => $validated['license_type'],
            'experience_years' => $validated['experience_years'],
            'location' => $validated['location'],
            'gender' => $validated['gender'],
            'daily_rate' => $validated['daily_rate'],
        ];

        // Handle license file upload
        if ($request->hasFile('license_file')) {
            $path = $request->file('license_file')->store('driver-licenses', 'public');
            $profileData['license_file_path'] = '/storage/'.$path;
        }

        DriverProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData,
        );

        return redirect()->route('driver.profile')->with('toast', [
            'type' => 'success',
            'message' => 'Profile updated. Your details are now under review — an admin will approve them shortly.',
        ]);
    }
}
