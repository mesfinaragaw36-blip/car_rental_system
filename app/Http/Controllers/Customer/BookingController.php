<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function create(Car $car)
    {
        return Inertia::render('customer/book-vehicle', [
            'car' => $car,
        ]);
    }

    public function store(Request $request, Car $car)
    {
        $validated = $request->validate([
            'pickup_date' => 'required|date|after:today',
            'return_date' => 'required|date|after:pickup_date',
            'pickup_location' => 'required|string|max:255',
            'return_location' => 'required|string|max:255',
            'need_driver' => 'boolean',
        ]);

        // Check 1: customer is not the owner of the car
        if ($car->owner_id === auth()->id()) {
            return back()->withErrors([
                'car' => 'You cannot book your own vehicle.',
            ]);
        }

        // Check 2: no overlapping bookings for these dates
        $overlapping = Booking::where('car_id', $car->id)
            ->whereIn('status', ['pending', 'approved', 'paid', 'picked_up'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('pickup_date', [$validated['pickup_date'], $validated['return_date']])
                    ->orWhereBetween('return_date', [$validated['pickup_date'], $validated['return_date']])
                    ->orWhere(function ($q) use ($validated) {
                        $q->where('pickup_date', '<=', $validated['pickup_date'])
                            ->where('return_date', '>=', $validated['return_date']);
                    });
            })
            ->exists();

        if ($overlapping) {
            return back()->withErrors([
                'pickup_date' => 'This vehicle is already booked for the selected dates.',
            ]);
        }

        // Calculate total price
        $days = \Carbon\Carbon::parse($validated['pickup_date'])
            ->diffInDays(\Carbon\Carbon::parse($validated['return_date']));
        $days = max($days, 1);
        $totalPrice = $car->daily_price * $days;

        Booking::create([
            'customer_id' => auth()->id(),
            'owner_id' => $car->owner_id,
            'car_id' => $car->id,
            'pickup_date' => $validated['pickup_date'],
            'return_date' => $validated['return_date'],
            'pickup_location' => $validated['pickup_location'],
            'return_location' => $validated['return_location'],
            'need_driver' => $validated['need_driver'] ?? false,
            'total_price' => $totalPrice,
            'status' => 'pending',
        ]);

        return redirect()->route('customer.dashboard')->with('success', 'Booking request submitted successfully!');
    }
}