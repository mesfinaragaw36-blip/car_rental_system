<?php

namespace App\Services;

use App\Models\Booking;
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

        $gross = round((float) $booking->total_price, 2);
        $commission = round($gross * (config('commission.rate', 10) / 100), 2);
        $net = round($gross - $commission, 2);

        DB::transaction(function () use ($booking, $refundAmount, $deduction, $gross, $commission, $net) {
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
                'gross_amount' => $gross,
                'commission_amount' => $commission,
                'net_amount' => $net,
                'status' => OwnerPayout::STATUS_PENDING,
            ]);
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
                number_format($gross, 2),
                number_format($commission, 2),
                number_format($net, 2),
            ),
            'payout_pending',
            Booking::class,
            $booking->id,
        );
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
