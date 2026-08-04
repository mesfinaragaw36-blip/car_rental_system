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
                'daily_rate' => $profile->daily_rate,
                'location' => $profile->location,
                'availability' => $profile->availability,
                'verification_status' => $profile->verification_status,
                'license_file_path' => $profile->license_file_path,
                'average_rating' => round($driver->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $driver->reviews()->count(),
                'recent_reviews' => $recent,
            ] : null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'license_number' => 'required|string|max:100',
            'license_type' => 'required|string|max:50',
            'experience_years' => 'required|integer|min:0|max:50',
            'daily_rate' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'availability' => 'sometimes|in:available,unavailable',
            'license_file' => 'sometimes|file|mimes:pdf|max:10240',
        ]);

        $profileData = $validated;

        unset($profileData['license_file']);

        if ($request->hasFile('license_file')) {
            $profileData['license_file_path'] = $request->file('license_file')->store('driver_documents', 'public');
        }

        DriverProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData,
        );

        return redirect()->route('driver.profile')->with('toast', [
            'type' => 'success',
            'message' => 'Profile updated successfully.',
        ]);
    }

    public function toggleAvailability(): RedirectResponse
    {
        $profile = auth()->user()->driverProfile;

        if (! $profile) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Complete your profile first.']);
        }

        $profile->update([
            'availability' => $profile->availability === 'available' ? 'unavailable' : 'available',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'You are now '.($profile->fresh()->availability === 'available' ? 'available' : 'unavailable').' for trips.',
        ]);
    }
}
