<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\BookingDriver;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $driverId = auth()->id();

        $pendingAssignments = BookingDriver::where('driver_id', $driverId)
            ->where('status', 'assigned')
            ->count();

        $activeTrips = BookingDriver::where('driver_id', $driverId)
            ->where('status', 'accepted')
            ->count();

        $completedTrips = BookingDriver::where('driver_id', $driverId)
            ->where('status', 'completed')
            ->count();

        $recentAssignments = BookingDriver::with(['booking.customer', 'booking.car'])
            ->where('driver_id', $driverId)
            ->whereIn('status', ['assigned', 'accepted'])
            ->latest('assigned_at')
            ->get()
            ->map(fn (BookingDriver $assignment) => [
                'id' => $assignment->id,
                'status' => $assignment->status,
                'assigned_at' => $assignment->assigned_at->toDateTimeString(),
                'booking' => [
                    'id' => $assignment->booking->id,
                    'pickup_date' => $assignment->booking->pickup_date->toDateString(),
                    'return_date' => $assignment->booking->return_date->toDateString(),
                    'pickup_location' => $assignment->booking->pickup_location,
                    'return_location' => $assignment->booking->return_location,
                ],
                'customer' => [
                    'name' => $assignment->booking->customer->name,
                    'phone' => $assignment->booking->customer->phone,
                ],
                'car' => [
                    'brand' => $assignment->booking->car->brand,
                    'model' => $assignment->booking->car->model,
                    'year' => $assignment->booking->car->year,
                    'plate_number' => $assignment->booking->car->plate_number,
                ],
            ]);

        return Inertia::render('driver/dashboard', [
            'stats' => [
                'pending_assignments' => $pendingAssignments,
                'active_trips' => $activeTrips,
                'completed_trips' => $completedTrips,
            ],
            'recentAssignments' => $recentAssignments,
        ]);
    }
}
