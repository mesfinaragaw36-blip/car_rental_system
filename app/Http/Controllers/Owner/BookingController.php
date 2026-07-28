<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $query = Booking::with(['customer', 'car', 'driverAssignment.driver', 'payment']);

        if (auth()->user()->role !== 'admin') {
            $query->where('owner_id', auth()->id());
        }

        $bookings = $query->latest()
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'status' => $booking->status,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'total_price' => $booking->total_price,
                'need_driver' => $booking->need_driver,
                'notes' => $booking->notes,
                'customer' => [
                    'id' => $booking->customer->id,
                    'name' => $booking->customer->name,
                    'email' => $booking->customer->email,
                    'phone' => $booking->customer->phone,
                ],
                'car' => [
                    'id' => $booking->car->id,
                    'brand' => $booking->car->brand,
                    'model' => $booking->car->model,
                    'year' => $booking->car->year,
                    'plate_number' => $booking->car->plate_number,
                ],
                'assigned_driver' => $booking->driverAssignment
                    ? [
                        'id' => $booking->driverAssignment->driver->id,
                        'name' => $booking->driverAssignment->driver->name,
                    ]
                    : null,
                'payment' => $booking->payment
                    ? [
                        'payment_method' => $booking->payment->payment_method,
                        'payment_status' => $booking->payment->payment_status,
                        'paid_at' => $booking->payment->paid_at?->toDateTimeString(),
                    ]
                    : null,
            ]);

        $availableDrivers = User::where('role', 'driver')
            ->whereHas('driverProfile', fn ($query) => $query
                ->where('availability', 'available')
            )
            ->get(['id', 'name', 'phone']);

        return Inertia::render('owner/bookings', [
            'bookings' => $bookings,
            'availableDrivers' => $availableDrivers,
        ]);
    }

    public function approve(Booking $booking): RedirectResponse
    {
        if ($booking->owner_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($booking->status !== 'pending') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only pending bookings can be approved.',
            ]);
        }

        $booking->update(['status' => 'approved']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking approved successfully.',
        ]);
    }

    public function reject(Booking $booking): RedirectResponse
    {
        if ($booking->owner_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($booking->status !== 'pending') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only pending bookings can be rejected.',
            ]);
        }

        $booking->update(['status' => 'rejected']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking rejected.',
        ]);
    }

    public function assignDriver(Request $request, Booking $booking): RedirectResponse
    {
        if ($booking->owner_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if (! $booking->need_driver) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking did not request a driver.',
            ]);
        }

        $validated = $request->validate([
            'driver_id' => ['required', 'exists:users,id'],
        ]);

        $driver = User::where('id', $validated['driver_id'])
            ->where('role', 'driver')
            ->whereHas('driverProfile', fn ($query) => $query
                ->where('availability', 'available')
            )
            ->firstOrFail();

        BookingDriver::updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'driver_id' => $driver->id,
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
                'status' => 'assigned',
            ]
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Driver assigned successfully.',
        ]);
    }

    public function markPickedUp(Booking $booking): RedirectResponse
    {
        if ($booking->owner_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($booking->status !== 'paid') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only paid bookings can be marked as picked up.',
            ]);
        }

        $booking->update(['status' => 'picked_up']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle marked as picked up.',
        ]);
    }

    public function markReturned(Booking $booking): RedirectResponse
    {
        if ($booking->owner_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($booking->status !== 'picked_up') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only picked up bookings can be marked as returned.',
            ]);
        }

        $booking->update(['status' => 'returned']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle marked as returned.',
        ]);
    }
}
