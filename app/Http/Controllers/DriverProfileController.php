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
        $profile = auth()->user()->driverProfile;

        return Inertia::render('driver/profile', [
            'profile' => $profile ? [
                'id' => $profile->id,
                'license_number' => $profile->license_number,
                'license_type' => $profile->license_type,
                'experience_years' => $profile->experience_years,
                'location' => $profile->location,
                'availability' => $profile->availability,
                'verification_status' => $profile->verification_status,
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
