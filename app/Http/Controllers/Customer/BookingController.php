<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $query = Booking::with(['car', 'payment', 'driverAssignment.driver']);

        if (auth()->user()->role !== 'admin') {
            $query->where('customer_id', auth()->id());
        }

        $bookings = $query->latest()
            ->paginate(10)
            ->through(fn (Booking $booking) => [
                'id' => $booking->id,
                'status' => $booking->status,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'total_price' => $booking->total_price,
                'need_driver' => $booking->need_driver,
                'notes' => $booking->notes,
                'car' => [
                    'id' => $booking->car->id,
                    'brand' => $booking->car->brand,
                    'model' => $booking->car->model,
                    'year' => $booking->car->year,
                    'plate_number' => $booking->car->plate_number,
                ],
                'payment' => $booking->payment
                    ? [
                        'payment_method' => $booking->payment->payment_method,
                        'payment_status' => $booking->payment->payment_status,
                        'paid_at' => $booking->payment->paid_at?->toDateTimeString(),
                    ]
                    : null,
                'driver_assignment' => $booking->driverAssignment
                    ? [
                        'driver' => $booking->driverAssignment->driver
                            ? [
                                'id' => $booking->driverAssignment->driver->id,
                                'name' => $booking->driverAssignment->driver->name,
                            ]
                            : null,
                    ]
                    : null,
            ]);

        return Inertia::render('customer/bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function store(Request $request, Car $car): RedirectResponse
    {
        if ($car->approval_status !== 'approved' || $car->availability_status !== 'available') {
            abort(404);
        }

        if ($car->owner_id === auth()->id()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'You cannot book your own vehicle.',
            ]);
        }

        $validated = $request->validate([
            'pickup_date' => ['required', 'date', 'after_or_equal:today'],
            'return_date' => ['required', 'date', 'after:pickup_date'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'return_location' => ['required', 'string', 'max:255'],
            'need_driver' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $pickupDate = Carbon::parse($validated['pickup_date']);
        $returnDate = Carbon::parse($validated['return_date']);

        $hasOverlap = Booking::where('car_id', $car->id)
            ->whereNotIn('status', ['rejected', 'cancelled'])
            ->where(function ($query) use ($pickupDate, $returnDate) {
                $query->whereBetween('pickup_date', [$pickupDate, $returnDate])
                    ->orWhereBetween('return_date', [$pickupDate, $returnDate])
                    ->orWhere(function ($q) use ($pickupDate, $returnDate) {
                        $q->where('pickup_date', '<=', $pickupDate)
                            ->where('return_date', '>=', $returnDate);
                    });
            })
            ->exists();

        if ($hasOverlap) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'The selected dates overlap with an existing booking.',
            ]);
        }

        $days = $pickupDate->diffInDays($returnDate);
        $totalPrice = $days * $car->daily_price;

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
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('customer.bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Booking request submitted! The owner will review it shortly.',
        ]);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        if ($booking->customer_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if (! in_array($booking->status, ['pending', 'approved'])) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only pending or approved bookings can be cancelled.',
            ]);
        }

        $booking->update(['status' => 'cancelled']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking cancelled successfully.',
        ]);
    }
}
