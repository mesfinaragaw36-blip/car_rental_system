<?php

namespace App\Http\Controllers;

use App\Models\BookingDriver;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $isDriver = $user->hasDriverPermission();
        $viewRole = $isDriver ? 'driver' : $user->role;

        if (($user->role === 'admin' && ! $isDriver) || $user->role === 'owner') {
            $query = BookingDriver::with([
                'booking.customer',
                'booking.car',
                'driver:id,name,phone',
            ])->whereIn('status', [
                BookingDriver::STATUS_ASSIGNED,
                BookingDriver::STATUS_ACCEPTED,
                BookingDriver::STATUS_COMPLETED,
            ]);

            if ($user->role === 'owner') {
                $query->whereHas(
                    'booking',
                    fn ($q) => $q->where('owner_id', $user->id)
                );
            }

            $assignments = $query
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
                        'status' => $assignment->booking->status,
                    ],

                    'customer' => [
                        'name' => $assignment->booking->customer?->name,
                        'phone' => $assignment->booking->customer?->phone,
                    ],

                    'car' => [
                        'brand' => $assignment->booking->car->brand,
                        'model' => $assignment->booking->car->model,
                        'year' => $assignment->booking->car->year,
                        'plate_number' => $assignment->booking->car->plate_number,
                    ],

                    'driver' => $assignment->driver
                        ? [
                            'id' => $assignment->driver->id,
                            'name' => $assignment->driver->name,
                            'phone' => $assignment->driver->phone,
                        ]
                        : null,
                ]);
        } else {
            $query = BookingDriver::with([
                'booking.customer',
                'booking.car',
            ])
                ->where('driver_id', $user->id)
                ->whereIn('status', [
                    BookingDriver::STATUS_ASSIGNED,
                    BookingDriver::STATUS_ACCEPTED,
                    BookingDriver::STATUS_COMPLETED,
                ]);

            $assignments = $query
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
                        'status' => $assignment->booking->status,
                    ],

                    'customer' => [
                        'name' => $assignment->booking->customer?->name,
                        'phone' => $assignment->booking->customer?->phone,
                    ],

                    'car' => [
                        'brand' => $assignment->booking->car->brand,
                        'model' => $assignment->booking->car->model,
                        'year' => $assignment->booking->car->year,
                        'plate_number' => $assignment->booking->car->plate_number,
                    ],
                ]);
        }

        return Inertia::render('assignments', [
            'role' => $viewRole,
            'assignments' => $assignments,
        ]);
    }
}