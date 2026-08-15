<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\User;
use Carbon\CarbonInterface;

class DriverMatchingService
{
    private const ACTIVE_STATUSES = [
        BookingDriver::STATUS_ACCEPTED,
    ];

    private const CANCELLED_STATUSES = [
        'rejected',
        'cancelled',
    ];

    public function bestMatchFor(
        Booking $booking,
        array $excludeDriverIds = []
    ): ?User {
        return User::drivers()
            ->where('status', 'active')
            ->whereHas('driverProfile', function ($query) {
                $query->where('verification_status', 'approved');
            })
            ->with('driverProfile')
            ->get()
            ->reject(
                fn (User $driver) => in_array(
                    $driver->id,
                    array_map('intval', $excludeDriverIds),
                    true
                )
            )
            ->reject(
                fn (User $driver) => $this->hasOverlappingAssignment(
                    $driver,
                    $booking->pickup_date,
                    $booking->return_date
                )
            )
            ->sortBy(
                fn (User $driver) => [
                    $this->activeAssignmentCount($driver),
                    $driver->id,
                ]
            )
            ->values()
            ->first();
    }

    public function assignDriver(
        Booking $booking,
        ?User $driver
    ): ?BookingDriver {
        if ($driver === null) {
            $this->escalateToAdmin($booking);

            return null;
        }

        $assignment = BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => auth()->id(),
            'assigned_at' => now(),
            'response_deadline' => now()->addHours(2),
            'status' => BookingDriver::STATUS_ASSIGNED,
        ]);

        $driver->notifyNow(
            "New chauffeur trip - Booking #{$booking->id}",
            sprintf(
                'You have been assigned a chauffeur trip: %s %s, pickup %s at %s, return %s at %s. Please accept or reject within 2 hours.',
                $booking->car->brand,
                $booking->car->model,
                $booking->pickup_location,
                $booking->pickup_date->format('M j, Y g:i A'),
                $booking->return_location,
                $booking->return_date->format('M j, Y g:i A'),
            ),
            'trip_assigned',
            Booking::class,
            $booking->id,
        );

        return $assignment;
    }

    /**
     * Driver accepts a pending assignment.
     */
    public function acceptAssignment(BookingDriver $assignment): BookingDriver
    {
        $assignment->update([
            'status' => BookingDriver::STATUS_ACCEPTED,
            'responded_at' => now(),
        ]);

        return $assignment;
    }

    /**
     * Driver rejects a pending assignment. Automatically tries to
     * reassign the booking to the next best available driver.
     */
    public function rejectAssignment(BookingDriver $assignment, ?string $reason = null): void
    {
        $assignment->update([
            'status' => BookingDriver::STATUS_REJECTED,
            'responded_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $this->reassign($assignment->booking);
    }

    /**
     * Find the next best driver for a booking, excluding everyone
     * already tried (rejected/expired) for it, and assign them.
     */
    public function reassign(Booking $booking): ?BookingDriver
    {
        $excludeIds = $this->alreadyTriedDriverIds($booking);

        $next = $this->bestMatchFor($booking, $excludeIds);

        return $this->assignDriver($booking, $next);
    }

    /**
     * Sweep assignments past their response deadline, mark them
     * expired/rejected, and reassign to the next best driver.
     *
     * Intended to be run on a schedule (e.g. every few minutes).
     */
    public function processExpiredAssignments(): void
    {
        BookingDriver::query()
            ->where('status', BookingDriver::STATUS_ASSIGNED)
            ->where('response_deadline', '<', now())
            ->get()
            ->each(function (BookingDriver $assignment) {
                $assignment->update([
                    'status' => BookingDriver::STATUS_REJECTED,
                    'rejection_reason' => 'Response deadline expired.',
                    'responded_at' => now(),
                ]);

                $this->reassign($assignment->booking);
            });
    }

    public function escalateToAdmin(Booking $booking): void
    {
        $admins = User::query()
            ->where('role', 'admin')
            ->whereNull('staff_role_id')
            ->get();

        foreach ($admins as $admin) {
            $admin->notifyNow(
                "No chauffeur available - Booking #{$booking->id}",
                sprintf(
                    'No verified driver is available for %s %s (%s → %s). Manual override required.',
                    $booking->car->brand,
                    $booking->car->model,
                    $booking->pickup_date->format('M j, Y g:i A'),
                    $booking->return_date->format('M j, Y g:i A'),
                ),
                'driver_escalation',
                Booking::class,
                $booking->id,
            );
        }
    }

    public function alreadyTriedDriverIds(Booking $booking): array
    {
        return BookingDriver::query()
            ->where('booking_id', $booking->id)
            ->pluck('driver_id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    private function hasOverlappingAssignment(
        User $driver,
        CarbonInterface $pickupDate,
        CarbonInterface $returnDate
    ): bool {
        return BookingDriver::query()
            ->where('driver_id', $driver->id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->whereHas(
                'booking',
                fn ($query) => $query
                    ->whereNotIn('status', self::CANCELLED_STATUSES)
                    ->where(
                        fn ($overlap) => $overlap
                            ->whereBetween(
                                'pickup_date',
                                [$pickupDate, $returnDate]
                            )
                            ->orWhereBetween(
                                'return_date',
                                [$pickupDate, $returnDate]
                            )
                            ->orWhere(
                                fn ($contains) => $contains
                                    ->where(
                                        'pickup_date',
                                        '<=',
                                        $pickupDate
                                    )
                                    ->where(
                                        'return_date',
                                        '>=',
                                        $returnDate
                                    )
                            )
                    )
            )
            ->exists();
    }

    private function activeAssignmentCount(User $driver): int
    {
        return BookingDriver::query()
            ->where('driver_id', $driver->id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->count();
    }
}