<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Car::with('owner')->latest()->get();

        return Inertia::render('admin/vehicles', [
            'vehicles' => $vehicles,
        ]);
    }

    public function approve(Car $car)
    {
        $car->update(['approval_status' => 'approved']);

        return redirect()->back();
    }

    public function reject(Car $car)
    {
        $car->update(['approval_status' => 'rejected']);

        return redirect()->back();
    }
}
