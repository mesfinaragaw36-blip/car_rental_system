<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('bookings:release-expired-holds')]
#[Description('Cancel confirmed bookings whose 24-hour deposit hold has expired and release the car slot.')]
class ReleaseExpiredBookingHolds extends Command
{
    public function handle(): int
    {
        $count = Booking::where('status', Booking::STATUS_CONFIRMED)
            ->whereNotNull('deposit_hold_until')
            ->where('deposit_hold_until', '<', now())
            ->update(['status' => 'cancelled']);

        if ($count > 0) {
            $this->info("Released {$count} expired booking hold(s).");
        }

        return self::SUCCESS;
    }
}
