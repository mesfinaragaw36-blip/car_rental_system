<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OwnerVehicleController extends Controller
{
    public function index()
    {
        $vehicles = Car::where('owner_id', auth()->id())->get();

        return Inertia::render('OwnerVehicles', [
            'vehicles' => $vehicles,
        ]);
    }

    public function create()
    {
        return Inertia::render('CreateVehicle');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer',
            'plate_number' => 'required|string|unique:cars',
            'category' => 'required|string',
            'color' => 'required|string',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'daily_price' => 'required|numeric',
        ]);

        Car::create([
            ...$validated,
            'owner_id' => auth()->id(),
            'approval_status' => 'pending',
            'availability_status' => 'available',
        ]);

        return redirect()->route('owner.vehicles');
    }
}