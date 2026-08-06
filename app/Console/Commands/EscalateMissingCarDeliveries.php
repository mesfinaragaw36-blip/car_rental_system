<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('bookings:escalate-missing-deliveries')]
#[Description('Escalate bookings whose car has not been delivered by the pickup date.')]
class EscalateMissingCarDeliveries extends Command
{
    public function handle(): int
    {
        $bookings = Booking::with(['owner', 'car'])
            ->where('status', Booking::STATUS_DEPOSIT_PAID)
            ->where('car_delivery_status', '!=', Booking::CAR_DELIVERY_ARRIVED)
            ->whereNull('car_delivery_escalated_at')
            ->whereDate('pickup_date', '<', now()->toDateString())
            ->get();

        $count = 0;

        foreach ($bookings as $booking) {
            $booking->update(['car_delivery_escalated_at' => now()]);

            $booking->owner?->notifyNow(
                "Your {$booking->car->brand} {$booking->car->model} must be delivered",
                sprintf(
                    'The car was due at %s by %s for booking #%s. Deliver it immediately or the rental may be cancelled.',
                    $booking->pickup_location,
                    $booking->carDeliveryDueDate()->format('M j, Y'),
                    $booking->id,
                ),
                'delivery_escalated',
                Booking::class,
                $booking->id,
            );

            User::query()->where('role', 'admin')->whereNull('staff_role_id')->get()
                ->each->notifyNow(
                    "Car not delivered - booking #{$booking->id}",
                    sprintf(
                        'The %s %s for booking #%s has not been delivered to %s though pickup was scheduled for %s. Please follow up with the owner.',
                        $booking->car->brand,
                        $booking->car->model,
                        $booking->id,
                        $booking->pickup_location,
                        $booking->pickup_date->format('M j, Y'),
                    ),
                    'delivery_escalated',
                    Booking::class,
                    $booking->id,
                );

            $count++;
        }

        if ($count > 0) {
            $this->info("Escalated {$count} booking(s) with missing car delivery.");
        }

        return self::SUCCESS;
    }
}
