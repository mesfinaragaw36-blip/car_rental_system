<?php

namespace App\Http\Controllers;

use App\Models\BookingDriver;
use App\Services\DriverMatchingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverBookingController extends Controller
{
    /**
     * Show assignments for the currently logged-in driver.
     */
    public function index(): Response
    {
        $assignments = BookingDriver::with([
            'booking.car',
            'booking.customer',
            'booking.owner',
        ])
            ->where('driver_id', auth()->id())
            ->latest('assigned_at')
            ->get()
            ->map(function (BookingDriver $assignment) {
                return [
                    'id' => $assignment->id,
                    'status' => $assignment->status,

                    'assigned_at' => $assignment->assigned_at?->toDateTimeString(),

                    'response_deadline' => $assignment->response_deadline?->toDateTimeString(),

                    'responded_at' => $assignment->responded_at?->toDateTimeString(),

                    'rejection_reason' => $assignment->rejection_reason,

                    'booking' => [
                        'id' => $assignment->booking?->id,

                        'pickup_date' => $assignment->booking?->pickup_date?->toDateString(),

                        'return_date' => $assignment->booking?->return_date?->toDateString(),

                        'pickup_location' => $assignment->booking?->pickup_location,

                        'return_location' => $assignment->booking?->return_location,
                    ],

                    'car' => [
                        'brand' => $assignment->booking?->car?->brand,
                        'model' => $assignment->booking?->car?->model,
                        'year' => $assignment->booking?->car?->year,
                        'plate_number' => $assignment->booking?->car?->plate_number,
                    ],

                    'customer' => [
                        'name' => $assignment->booking?->customer?->name,
                    ],
                ];
            });

        return Inertia::render('driver/assignments', [
            'assignments' => $assignments,
        ]);
    }

    /**
     * Accept a driver assignment.
     */
    public function accept(BookingDriver $assignment): RedirectResponse
    {
        abort_unless(
            $assignment->driver_id === auth()->id(),
            403
        );

        if (
            $assignment->status !== BookingDriver::STATUS_ASSIGNED
        ) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This assignment is no longer available.',
            ]);
        }

        if (
            $assignment->response_deadline
            && now()->greaterThan($assignment->response_deadline)
        ) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'The response deadline for this assignment has passed.',
            ]);
        }

        $assignment->update([
            'status' => BookingDriver::STATUS_ACCEPTED,
            'responded_at' => now(),
            'rejection_reason' => null,
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Driver assignment accepted successfully.',
        ]);
    }

    /**
     * Reject a driver assignment.
     */
    public function reject(
        Request $request,
        BookingDriver $assignment,
        DriverMatchingService $matchingService
    ): RedirectResponse {
        abort_unless(
            $assignment->driver_id === auth()->id(),
            403
        );

        if (
            $assignment->status !== BookingDriver::STATUS_ASSIGNED
        ) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This assignment is no longer available.',
            ]);
        }

        if (
            $assignment->response_deadline
            && now()->greaterThan($assignment->response_deadline)
        ) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'The response deadline for this assignment has passed.',
            ]);
        }

        $validated = $request->validate([
            'rejection_reason' => [
                'required',
                'string',
                'max:1000',
            ],
        ]);

        $assignment->update([
            'status' => BookingDriver::STATUS_REJECTED,
            'responded_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        $matchingService->reassign($assignment->booking);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Assignment rejected. The admin will be notified.',
        ]);
    }

    /**
     * Show completed and rejected assignment history
     * for the currently logged-in driver.
     */
    public function history(): Response
    {
        $assignments = BookingDriver::with([
            'booking.car',
            'booking.customer',
            'booking.owner',
        ])
            ->where('driver_id', auth()->id())
            ->whereIn('status', [
                BookingDriver::STATUS_COMPLETED,
                BookingDriver::STATUS_REJECTED,
            ])
            ->latest('assigned_at')
            ->get()
            ->map(function (BookingDriver $assignment) {
                return [
                    'id' => $assignment->id,
                    'status' => $assignment->status,

                    'assigned_at' => $assignment->assigned_at?->toDateTimeString(),

                    'responded_at' => $assignment->responded_at?->toDateTimeString(),

                    'rejection_reason' => $assignment->rejection_reason,

                    'booking' => [
                        'id' => $assignment->booking?->id,

                        'pickup_date' => $assignment->booking?->pickup_date?->toDateString(),

                        'return_date' => $assignment->booking?->return_date?->toDateString(),

                        'pickup_location' => $assignment->booking?->pickup_location,

                        'return_location' => $assignment->booking?->return_location,
                    ],

                    'car' => [
                        'brand' => $assignment->booking?->car?->brand,

                        'model' => $assignment->booking?->car?->model,

                        'year' => $assignment->booking?->car?->year,

                        'plate_number' => $assignment->booking?->car?->plate_number,
                    ],

                    'customer' => [
                        'name' => $assignment->booking?->customer?->name,
                    ],
                ];
            });

        return Inertia::render('driver/trip-history', [
            'assignments' => $assignments,
        ]);
    }

    /**
     * Show completed trips with earnings and payout status
     * for the currently logged-in driver.
     */
    public function payments(): Response
    {
        $assignments = BookingDriver::with([
            'booking.car',
            'booking.customer',
        ])
            ->where('driver_id', auth()->id())
            ->whereIn('status', [
                BookingDriver::STATUS_COMPLETED,
                BookingDriver::STATUS_PAID,
            ])
            ->latest('assigned_at')
            ->get()
            ->map(function (BookingDriver $assignment) {
                return [
                    'id' => $assignment->id,
                    'status' => $assignment->status,
                    'earnings' => $assignment->earnings,
                    'payout_status' => $assignment->payout_status,
                    'paid_at' => $assignment->paid_at?->toDateTimeString(),

                    'assigned_at' => $assignment->assigned_at?->toDateTimeString(),

                    'booking' => [
                        'id' => $assignment->booking?->id,

                        'pickup_date' => $assignment->booking?->pickup_date?->toDateString(),

                        'return_date' => $assignment->booking?->return_date?->toDateString(),
                    ],

                    'car' => [
                        'brand' => $assignment->booking?->car?->brand,
                        'model' => $assignment->booking?->car?->model,
                        'plate_number' => $assignment->booking?->car?->plate_number,
                    ],
                ];
            });

        return Inertia::render('driver/payments', [
            'assignments' => $assignments,
        ]);
    }

    /**
     * Admin view of all driver assignments.
     */
    public function adminIndex(): Response
    {
        $assignments = BookingDriver::with([
            'booking.car',
            'booking.customer',
            'booking.owner',
            'driver',
            'assignedBy',
        ])
            ->latest('assigned_at')
            ->get()
            ->map(function (BookingDriver $assignment) {
                return [
                    'id' => $assignment->id,
                    'status' => $assignment->status,

                    'assigned_at' => $assignment->assigned_at?->toDateTimeString(),

                    'response_deadline' => $assignment->response_deadline?->toDateTimeString(),

                    'responded_at' => $assignment->responded_at?->toDateTimeString(),

                    'rejection_reason' => $assignment->rejection_reason,

                    'driver' => $assignment->driver
                        ? [
                            'id' => $assignment->driver->id,
                            'name' => $assignment->driver->name,
                            'phone' => $assignment->driver->phone,
                        ]
                        : null,

                    'assigned_by' => $assignment->assignedBy
                        ? [
                            'id' => $assignment->assignedBy->id,
                            'name' => $assignment->assignedBy->name,
                        ]
                        : null,

                    'booking' => [
                        'id' => $assignment->booking?->id,

                        'pickup_date' => $assignment->booking?->pickup_date?->toDateString(),

                        'return_date' => $assignment->booking?->return_date?->toDateString(),

                        'pickup_location' => $assignment->booking?->pickup_location,

                        'return_location' => $assignment->booking?->return_location,
                    ],

                    'car' => [
                        'brand' => $assignment->booking?->car?->brand,

                        'model' => $assignment->booking?->car?->model,

                        'plate_number' => $assignment->booking?->car?->plate_number,
                    ],

                    'customer' => [
                        'name' => $assignment->booking?->customer?->name,
                    ],
                ];
            });

        return Inertia::render('admin/driver-assignments', [
            'assignments' => $assignments,
        ]);
    }
}
