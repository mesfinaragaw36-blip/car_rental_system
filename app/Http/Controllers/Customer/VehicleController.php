<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $cars = Car::with('images')
            ->where('approval_status', 'approved')
            ->where('availability_status', 'available')
            ->when($request->search, function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('brand', 'like', '%'.$request->search.'%')
                        ->orWhere('model', 'like', '%'.$request->search.'%');
                });
            })
            ->when($request->category, function ($query) use ($request) {
                $query->where('category', $request->category);
            })
            ->when($request->fuel_type, function ($query) use ($request) {
                $query->where('fuel_type', $request->fuel_type);
            })
            ->when($request->transmission, function ($query) use ($request) {
                $query->where('transmission', $request->transmission);
            })
            ->when($request->min_price, function ($query) use ($request) {
                $query->where('daily_price', '>=', $request->min_price);
            })
            ->when($request->max_price, function ($query) use ($request) {
                $query->where('daily_price', '<=', $request->max_price);
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('customer/browse-cars', [
            'vehicles' => $cars,
            'filters' => $request->only([
                'search',
                'category',
                'fuel_type',
                'transmission',
                'min_price',
                'max_price',
            ]),
        ]);
    }

    public function show(Car $car)
    {
        if ($car->approval_status !== 'approved' || $car->availability_status !== 'available') {
            abort(404);
        }

        $car->load('images');

        return Inertia::render('customer/car-details', [
            'car' => $car,
        ]);
    }
}
