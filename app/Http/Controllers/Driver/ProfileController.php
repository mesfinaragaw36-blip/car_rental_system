<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        $profile = auth()->user()->driverProfile;

        return Inertia::render('driver/profile', [
            'profile' => $profile,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'license_number' => 'required|string|max:100',
            'experience_years' => 'required|integer|min:0',
            'availability' => 'required|in:available,unavailable',
        ]);

        DriverProfile::updateOrCreate(
            ['user_id' => auth()->id()],
            [
                'license_number' => $validated['license_number'],
                'experience_years' => $validated['experience_years'],
                'availability' => $validated['availability'],
                'verification_status' => 'pending',
            ]
        );

        return redirect()->route('driver.profile');
    }
}
