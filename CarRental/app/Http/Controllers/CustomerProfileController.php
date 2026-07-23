<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerProfileController extends Controller
{
    public function show()
    {
        return Inertia::render('CustomerProfile', [
            'user' => Auth::user(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        Auth::user()->update($validated);

        return redirect()->route('customer.profile');
    }
}