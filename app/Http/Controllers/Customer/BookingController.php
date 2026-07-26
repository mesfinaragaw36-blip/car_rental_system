<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Car;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $bookings = Booking::with(['car', 'driverAssignment.driver'])
            ->where('customer_id', auth()->id())
            ->latest()
            ->paginate(12);

        return Inertia::render('customer/bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function store(StoreBookingRequest $request, Car $car): RedirectResponse
    {
        if ($car->owner_id === auth()->id()) {
            return back()->withErrors([
                'car' => 'Owners cannot book their own vehicles.',
            ]);
        }

        $validated = $request->validated();
        $pickupDate = Carbon::parse($validated['pickup_date']);
        $returnDate = Carbon::parse($validated['return_date']);

        $overlapExists = Booking::where('car_id', $car->id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($pickupDate, $returnDate) {
                $query->whereBetween('pickup_date', [$pickupDate, $returnDate])
                    ->orWhereBetween('return_date', [$pickupDate, $returnDate])
                    ->orWhere(function ($query) use ($pickupDate, $returnDate) {
                        $query->where('pickup_date', '<=', $pickupDate)
                            ->where('return_date', '>=', $returnDate);
                    });
            })
            ->exists();

        if ($overlapExists) {
            return back()->withErrors([
                'pickup_date' => 'The car is already booked for the selected dates.',
            ]);
        }

        $days = $pickupDate->diffInDays($returnDate) + 1;
        $totalPrice = $car->daily_price * $days;

        Booking::create([
            'customer_id' => auth()->id(),
            'owner_id' => $car->owner_id,
            'car_id' => $car->id,
            'pickup_date' => $pickupDate,
            'return_date' => $returnDate,
            'pickup_location' => $validated['pickup_location'],
            'return_location' => $validated['return_location'],
            'need_driver' => $validated['need_driver'],
            'total_price' => $totalPrice,
            'status' => 'pending',
        ]);

        return redirect()->route('customer.cars.show', $car)
            ->with('success', 'Booking request submitted successfully.');
    }
}
