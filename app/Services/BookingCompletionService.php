<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Support\Facades\DB;

class BookingCompletionService
{
    public function complete(Booking $booking, ?float $repairCost = null): void
    {
        $repairCost = max(0.0, (float) $repairCost);
        $lateDays = $booking->returnLateDays();
        $lateFeePerDay = (float) config('booking.late_fee_per_day', 500.0);
        $lateFee = round($lateDays * $lateFeePerDay, 2);

        $totalCharges = round($repairCost + $lateFee, 2);
        $securityDeposit = $booking->securityDepositAmount();
        $deduction = min($totalCharges, $securityDeposit);
        $refundAmount = round($securityDeposit - $deduction, 2);
        $extraCharge = round(max(0.0, $totalCharges - $securityDeposit), 2);

        $driverAssignment = $booking->driverAssignment;
        $driverFee = $driverAssignment?->hasEarnings() ? (float) $driverAssignment->earnings : 0.0;

        $carGross = round((float) $booking->total_price - $driverFee, 2);
        $commission = round($carGross * (config('commission.rate', 10) / 100), 2);
        $net = round($carGross - $commission, 2);

        DB::transaction(function () use ($booking, $refundAmount, $extraCharge, $carGross, $commission, $net, $driverAssignment, $driverFee, $lateDays, $lateFee, $repairCost) {
            $booking->update([
                'status' => Booking::STATUS_COMPLETED,
                'late_days' => $lateDays,
                'late_fee' => $lateFee,
            ]);

            if ($refundAmount > 0) {
                $reason = 'Full security deposit refund after a successful return.';

                if ($repairCost > 0 || $lateFee > 0) {
                    $reasons = [];

                    if ($repairCost > 0) {
                        $reasons[] = sprintf('ETB %s for repair costs', number_format($repairCost, 2));
                    }

                    if ($lateFee > 0) {
                        $reasons[] = sprintf('ETB %s for late fees (%d days)', number_format($lateFee, 2), $lateDays);
                    }

                    $reason = 'Security deposit refund after deducting '.implode(' and ', $reasons).'.';
                }

                Refund::create([
                    'booking_id' => $booking->id,
                    'amount' => $refundAmount,
                    'reason' => $reason,
                ]);
            }

            if ($extraCharge > 0) {
                Payment::create([
                    'booking_id' => $booking->id,
                    'type' => Payment::TYPE_EXTRA_CHARGE,
                    'amount' => $extraCharge,
                    'payment_method' => null,
                    'payment_status' => 'pending',
                    'paid_at' => null,
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
            $this->customerMessage($booking, $refundAmount, $deduction, $extraCharge, $totalCharges, $repairCost, $lateFee, $lateDays),
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

    private function customerMessage(
        Booking $booking,
        float $refundAmount,
        float $deduction,
        float $extraCharge,
        float $totalCharges,
        float $repairCost,
        float $lateFee,
        int $lateDays
    ): string {
        $base = sprintf(
            'Your rental of the %s %s is complete. ',
            $booking->car->brand,
            $booking->car->model
        );

        $securityDeposit = $booking->securityDepositAmount();

        if ($extraCharge > 0) {
            return $base.sprintf(
                'Repair costs and late fees (total ETB %s) exceeded your ETB %s security deposit. Your full deposit was applied, and an additional ETB %s is now due — please check your Payment History to settle this balance.',
                number_format($totalCharges, 2),
                number_format($securityDeposit, 2),
                number_format($extraCharge, 2),
            );
        }

        if ($deduction > 0) {
            return $base.sprintf(
                'Repair costs and late fees (total ETB %s) were deducted from your ETB %s security deposit. A refund of ETB %s has been issued to your original payment method.',
                number_format($totalCharges, 2),
                number_format($securityDeposit, 2),
                number_format($refundAmount, 2),
            );
        }

        return $base.sprintf(
            'Your security deposit of ETB %s has been refunded in full to your original payment method.',
            number_format($refundAmount, 2),
        );
    }
}
