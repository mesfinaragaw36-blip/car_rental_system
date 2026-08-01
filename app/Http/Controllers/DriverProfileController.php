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

        return Inertia::render('driver/profile', [
            'profile' => $profile ? array_merge($profile->toArray(), [
                'average_rating' => round($driver->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $driver->reviews()->count(),
            ]) : null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'license_number' => 'required|string|max:100',
            'license_type' => 'required|string|max:50',
            'experience_years' => 'required|integer|min:0|max:50',
            'location' => 'required|string|max:255',
            'availability' => 'sometimes|in:available,unavailable',
        ]);

        DriverProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated,
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
