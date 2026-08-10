<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;

class EscalateLateReturns extends Command
{
    protected $signature = 'bookings:escalate-late-returns';

    protected $description = 'Notify staff and customers when a rental car is returned late';

    public function handle(): int
    {
        $bookings = Booking::with(['customer', 'owner', 'car'])
            ->where('status', Booking::STATUS_PICKED_UP)
            ->whereNull('returned_at')
            ->where('return_date', '<', now())
            ->get();

        foreach ($bookings as $booking) {
            $lateDays = $booking->returnLateDays();

            if ($lateDays <= 0) {
                continue;
            }

            // Avoid sending the same overdue notification repeatedly.
            $alreadyNotified = Notification::query()
                ->where('related_type', Booking::class)
                ->where('related_id', $booking->id)
                ->where('type', 'late_return')
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            $this->notifyCustomer($booking, $lateDays);
            $this->notifyOwner($booking, $lateDays);
            $this->notifyAdmins($booking, $lateDays);
        }

        return self::SUCCESS;
    }

    private function notifyCustomer(Booking $booking, int $lateDays): void
    {
        $booking->customer?->notifyNow(
            "Late return - Booking #{$booking->id}",
            sprintf(
                'Your %s %s is %d day%s overdue. Please return the vehicle to %s immediately.',
                $booking->car->brand,
                $booking->car->model,
                $lateDays,
                $lateDays === 1 ? '' : 's',
                $booking->return_location,
            ),
            'late_return',
            Booking::class,
            $booking->id,
        );
    }

    private function notifyOwner(Booking $booking, int $lateDays): void
    {
        $booking->owner?->notifyNow(
            "Late return - Booking #{$booking->id}",
            sprintf(
                'The customer has not returned your %s %s. The vehicle is %d day%s overdue and is still with the customer.',
                $booking->car->brand,
                $booking->car->model,
                $lateDays,
                $lateDays === 1 ? '' : 's',
            ),
            'late_return',
            Booking::class,
            $booking->id,
        );
    }

    private function notifyAdmins(Booking $booking, int $lateDays): void
    {
        User::query()
            ->where('role', 'admin')
            ->whereNull('staff_role_id')
            ->get()
            ->each->notifyNow(
                "Late return - Booking #{$booking->id}",
                sprintf(
                    'The %s %s for booking #%s is %d day%s overdue. The customer has not returned the vehicle.',
                    $booking->car->brand,
                    $booking->car->model,
                    $booking->id,
                    $lateDays,
                    $lateDays === 1 ? '' : 's',
                ),
                'late_return',
                Booking::class,
                $booking->id,
            );
    }
}
