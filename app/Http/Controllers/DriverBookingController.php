<?php

namespace App\Http\Controllers;

use App\Models\BookingDriver;
use Inertia\Inertia;
use Inertia\Response;

class DriverBookingController extends Controller
{
    public function history(): Response
    {
        $assignments = BookingDriver::with(['booking.car', 'booking.customer', 'booking.owner'])
            ->where('driver_id', auth()->id())
            ->whereIn('status', ['completed', 'rejected'])
            ->latest('assigned_at')
            ->get()
            ->map(fn (BookingDriver $a) => [
                'id' => $a->id,
                'status' => $a->status,
                'assigned_at' => $a->assigned_at->toDateTimeString(),
                'booking' => [
                    'pickup_date' => $a->booking->pickup_date->toDateString(),
                    'return_date' => $a->booking->return_date->toDateString(),
                    'pickup_location' => $a->booking->pickup_location,
                    'return_location' => $a->booking->return_location,
                ],
                'car' => [
                    'brand' => $a->booking->car->brand,
                    'model' => $a->booking->car->model,
                    'year' => $a->booking->car->year,
                    'plate_number' => $a->booking->car->plate_number,
                ],
                'customer' => ['name' => $a->booking->customer?->name],
            ]);

        return Inertia::render('driver/trip-history', [
            'assignments' => $assignments,
        ]);
    }
}
