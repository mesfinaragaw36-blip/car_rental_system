<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\OwnerPayout;
use App\Models\Refund;
use Carbon\Carbon;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class BookingCompletionService
{
    public function complete(Booking $booking, ?float $repairCost = null): void
{
    $repairCost = max(0.0, (float) $repairCost);
    $securityDeposit = $booking->securityDepositAmount();

    $lateDays = 0;
    $lateFee = 0;

    if ($booking->return_date && Carbon::parse($booking->return_date)->isPast()) {
        $lateDays = Carbon::parse($booking->return_date)
            ->startOfDay()
            ->diffInDays(now()->startOfDay());

        $lateFee = $lateDays * config('booking.late_fee_per_day');
    }

    $totalOwed = round($repairCost + $lateFee, 2);

    // Settlement order: deduct from deposit first, refund the remainder,
    // and bill anything that exceeds the deposit as an extra charge.
    $deduction = min($totalOwed, $securityDeposit);
    $refundAmount = round($securityDeposit - $deduction, 2);
    $extraCharge = round($totalOwed - $deduction, 2);

    $gross = round((float) $booking->total_price, 2);
    $commission = round($gross * (config('commission.rate', 10) / 100), 2);
    $net = round($gross - $commission, 2);

    DB::transaction(function () use ($booking, $refundAmount, $deduction, $extraCharge, $gross, $commission, $net, $lateDays, $lateFee, $repairCost) {
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
                    $reasons[] = sprintf('ETB %s for late fees', number_format($lateFee, 2));
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
                'payment_method' => '',
                'payment_status' => 'pending',
                'paid_at' => null,
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
        $this->customerMessage($booking, $refundAmount, $deduction, $extraCharge, $repairCost, $lateFee),
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

private function customerMessage(
    Booking $booking,
    float $refundAmount,
    float $deduction,
    float $extraCharge,
    float $repairCost,
    float $lateFee
): string {
    $base = sprintf(
        'Your rental of the %s %s is complete. ',
        $booking->car->brand,
        $booking->car->model
    );

    if ($extraCharge > 0) {
        return $base.sprintf(
            'Repair costs and late fees of ETB %s exceeded your ETB %s security deposit. Your full deposit was applied, and an additional ETB %s is now due — please check your Payment History to settle this balance.',
            number_format($deduction + $extraCharge, 2),
            number_format($booking->securityDepositAmount(), 2),
            number_format($extraCharge, 2),
        );
    }

    if ($deduction > 0) {
        return $base.sprintf(
            'Repair costs and late fees of ETB %s were deducted from your ETB %s security deposit. A refund of ETB %s has been issued to your original payment method.',
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
