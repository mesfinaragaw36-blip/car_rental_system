<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Car::all();

        return Inertia::render('Vehicles', [
            'vehicles' => $vehicles,
        ]);
    }
}