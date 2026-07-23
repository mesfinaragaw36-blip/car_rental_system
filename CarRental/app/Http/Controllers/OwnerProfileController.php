<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OwnerProfileController extends Controller
{
    public function show()
    {
        $profile = Auth::user()->ownerProfile;

        return Inertia::render('OwnerProfile', [
            'profile' => $profile,
        ]);
    }
}