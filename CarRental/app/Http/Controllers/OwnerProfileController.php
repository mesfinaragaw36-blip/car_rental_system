<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\OwnerProfile;

class OwnerProfileController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        $profile = $user->ownerProfile;

        return Inertia::render('OwnerProfile', [
            'profile' => $profile,
            'user' => $user,
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
            [
                'user_id' => Auth::id(),
            ],
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