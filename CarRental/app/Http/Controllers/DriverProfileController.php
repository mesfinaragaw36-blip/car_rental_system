<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DriverProfileController extends Controller
{
    public function show()
    {
        return Inertia::render('DriverProfile');
    }
}