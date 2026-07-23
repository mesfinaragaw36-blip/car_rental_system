<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\OwnerProfile;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        $profile = auth()->user()->ownerProfile;

        return Inertia::render('owner/profile', [
            'profile' => $profile,
            'user' => auth()->user(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'national_id' => 'required|string|max:255',
            'trade_license_number' => 'required|string|max:255',
        ]);

        OwnerProfile::updateOrCreate(
            ['user_id' => auth()->id()],
            [
                'business_name' => $validated['business_name'],
                'national_id' => $validated['national_id'],
                'trade_license_number' => $validated['trade_license_number'],
                'verification_status' => 'pending',
            ]
        );

        return redirect()->route('owner.profile');
    }
}
