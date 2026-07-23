<?php

namespace App\Http\Controllers;

use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DriverProfileController extends Controller
{
    public function show()
    {
        $profile = Auth::user()->driverProfile;

        return Inertia::render('DriverProfile', [
            'profile' => $profile,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'license_number' => 'required|string|max:255',
            'experience_years' => 'required|integer|min:0',
            'availability' => 'required|string',
        ]);

        DriverProfile::updateOrCreate(
            [
                'user_id' => Auth::id(),
            ],
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