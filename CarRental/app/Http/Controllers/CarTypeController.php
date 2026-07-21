<?php

namespace App\Http\Controllers;

use App\Models\CarType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarTypeController extends Controller
{
    public function index()
    {
        $carTypes = CarType::all();

        return Inertia::render('CarTypes', [
            'carTypes' => $carTypes,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|boolean',
        ]);

        CarType::create($validated);

        return redirect()->back();
    }
    public function destroy(CarType $carType)
{
    $carType->delete();

    return redirect()->back();
}
public function update(Request $request, CarType $carType)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'status' => 'required|boolean',
    ]);

    $carType->update($validated);

    return redirect()->back();
}
}