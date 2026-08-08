<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\OwnerPayout;
use App\Models\Refund;
use Illuminate\Support\Facades\DB;

class BookingCompletionService
{
    public function complete(Booking $booking, ?float $repairCost = null): void
    {
        $repairCost = max(0.0, (float) $repairCost);
        $securityDeposit = $booking->securityDepositAmount();
        $deduction = min($repairCost, $securityDeposit);
        $refundAmount = round($securityDeposit - $deduction, 2);

        $driverAssignment = $booking->driverAssignment;
        $driverFee = $driverAssignment?->hasEarnings() ? (float) $driverAssignment->earnings : 0.0;

        $carGross = round((float) $booking->total_price - $driverFee, 2);
        $commission = round($carGross * (config('commission.rate', 10) / 100), 2);
        $net = round($carGross - $commission, 2);

        DB::transaction(function () use ($booking, $refundAmount, $deduction, $carGross, $commission, $net, $driverAssignment, $driverFee) {
            $booking->update(['status' => Booking::STATUS_COMPLETED]);

            if ($refundAmount > 0) {
                Refund::create([
                    'booking_id' => $booking->id,
                    'amount' => $refundAmount,
                    'reason' => $deduction > 0
                        ? sprintf('Security deposit refund after deducting ETB %s for repair costs.', number_format($deduction, 2))
                        : 'Full security deposit refund after a successful return.',
                ]);
            }

            OwnerPayout::create([
                'booking_id' => $booking->id,
                'owner_id' => $booking->owner_id,
                'gross_amount' => $carGross,
                'commission_amount' => $commission,
                'net_amount' => $net,
                'status' => OwnerPayout::STATUS_PENDING,
            ]);

            if ($driverFee > 0 && $driverAssignment !== null) {
                $driverAssignment->update([
                    'payout_status' => BookingDriver::STATUS_PENDING,
                ]);
            }
        });

        $booking->customer?->notifyNow(
            "Booking #{$booking->id} completed",
            $this->customerMessage($booking, $refundAmount, $deduction),
            'booking_completed',
            Booking::class,
            $booking->id,
        );

        $booking->owner?->notifyNow(
            "Payout pending - Booking #{$booking->id}",
            sprintf(
                'Your rental for %s %s is complete. Gross ETB %s, commission ETB %s, your net payout is ETB %s and is pending transfer.',
                $booking->car->brand,
                $booking->car->model,
                number_format($carGross, 2),
                number_format($commission, 2),
                number_format($net, 2),
            ),
            'payout_pending',
            Booking::class,
            $booking->id,
        );

        if ($driverFee > 0 && $driverAssignment?->driver !== null) {
            $driverAssignment->driver->notifyNow(
                "Payout pending - Booking #{$booking->id}",
                sprintf(
                    'Your driver earnings of ETB %s for booking #%s are pending transfer.',
                    number_format($driverFee, 2),
                    $booking->id,
                ),
                'payout_pending',
                Booking::class,
                $booking->id,
            );
        }
    }

    private function customerMessage(Booking $booking, float $refundAmount, float $deduction): string
    {
        $base = sprintf(
            'Your rental of the %s %s is complete. ',
            $booking->car->brand,
            $booking->car->model
        );

        if ($deduction > 0) {
            return $base.sprintf(
                'Repair costs of ETB %s were deducted from your ETB %s security deposit. A refund of ETB %s has been issued to your original payment method.',
                number_format($deduction, 2),
                number_format($booking->securityDepositAmount(), 2),
                number_format($refundAmount, 2),
            );
        }

        return $base.sprintf(
            'Your security deposit of ETB %s has been refunded in full to your original payment method.',
            number_format($refundAmount, 2),
        );
    }
}
