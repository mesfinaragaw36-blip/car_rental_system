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
            ->get()
            ->reject(
                fn (User $driver) => in_array(
                    $driver->id,
                    $excludeDriverIds,
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

        /*
         * Drivers are company staff.
         *
         * Once a driver is assigned to a booking, the assignment
         * is immediately accepted. The driver does not need to
         * accept or reject the trip.
         */
        $assignment = BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => null,
            'assigned_at' => now(),
            'status' => BookingDriver::STATUS_ACCEPTED,
        ]);

        $driver->notifyNow(
            "New chauffeur trip - Booking #{$booking->id}",
            sprintf(
                'You have been assigned a chauffeur trip: %s %s, pickup %s at %s, return %s at %s. Please review the trip details in your assignments.',
                $booking->car->brand,
                $booking->car->model,
                $booking->pickup_date->format('M j, Y g:i A'),
                $booking->pickup_location,
                $booking->return_date->format('M j, Y g:i A'),
                $booking->return_location,
            ),
            'trip_assigned',
            Booking::class,
            $booking->id,
        );

        return $assignment;
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