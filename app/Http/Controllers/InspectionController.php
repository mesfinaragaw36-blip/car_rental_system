<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InspectionController extends Controller
{
    public function index(): Response
    {
        $bookings = Booking::with(['customer', 'owner', 'car'])
            ->where('status', 'returned')
            ->latest('return_date')
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'status' => $booking->status,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'total_price' => $booking->total_price,
                'car' => [
                    'brand' => $booking->car->brand,
                    'model' => $booking->car->model,
                    'year' => $booking->car->year,
                    'plate_number' => $booking->car->plate_number,
                ],
                'customer' => $booking->customer ? ['id' => $booking->customer->id, 'name' => $booking->customer->name, 'phone' => $booking->customer->phone] : null,
                'owner' => $booking->owner ? ['id' => $booking->owner->id, 'name' => $booking->owner->name, 'phone' => $booking->owner->phone] : null,
            ]);

        return Inertia::render('inspections', [
            'bookings' => $bookings,
        ]);
    }

    public function complete(Booking $booking): RedirectResponse
    {
        if ($booking->status !== 'returned') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only returned bookings can be marked as inspected.',
            ]);
        }

        $booking->update(['status' => 'completed']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking inspection completed and marked as finished.',
        ]);
    }
}
