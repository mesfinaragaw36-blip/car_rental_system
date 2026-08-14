<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\Inspection;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->input('from');
        $to = $request->input('to');

        $bookingQuery = Booking::query();
        $paymentQuery = Payment::query();
        $refundQuery = Refund::query();
        $inspectionQuery = Inspection::query();
        $ownerPayoutQuery = OwnerPayout::query();
        $driverPayoutQuery = BookingDriver::query();

        /*
         * Apply date filters to all report-related data.
         */
        if ($from) {
            $bookingQuery->whereDate('created_at', '>=', $from);
            $paymentQuery->whereDate('created_at', '>=', $from);
            $refundQuery->whereDate('created_at', '>=', $from);
            $inspectionQuery->whereDate('created_at', '>=', $from);
            $ownerPayoutQuery->whereDate('created_at', '>=', $from);
            $driverPayoutQuery->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $bookingQuery->whereDate('created_at', '<=', $to);
            $paymentQuery->whereDate('created_at', '<=', $to);
            $refundQuery->whereDate('created_at', '<=', $to);
            $inspectionQuery->whereDate('created_at', '<=', $to);
            $ownerPayoutQuery->whereDate('created_at', '<=', $to);
            $driverPayoutQuery->whereDate('created_at', '<=', $to);
        }

        $bookings = (clone $bookingQuery)->get();
        $payments = (clone $paymentQuery)->get();
        $refunds = (clone $refundQuery)->get();
        $inspections = (clone $inspectionQuery)->get();

        $ownerPayouts = (clone $ownerPayoutQuery)
            ->whereNotNull('net_amount')
            ->get();

        $driverPayouts = (clone $driverPayoutQuery)
            ->whereNotNull('earnings')
            ->get();

        /*
         * Paid payments only.
         */
        $paidPayments = $payments->where('payment_status', 'paid');

        /*
         * Rental revenue excludes security deposits.
         */
        $rentalPayments = $paidPayments->whereIn('type', [
            Payment::TYPE_DEPOSIT,
            Payment::TYPE_BALANCE,
        ]);

        $rentalRevenue = $rentalPayments->sum(
            fn (Payment $payment) => (float) $payment->amount
        );

        /*
         * Extra charges are also company revenue.
         */
        $extraCharges = $paidPayments
            ->where('type', Payment::TYPE_EXTRA_CHARGE)
            ->sum(
                fn (Payment $payment) => (float) $payment->amount
            );

        /*
         * Security deposits are tracked separately because
         * they are not normal company revenue.
         */
        $securityDeposits = $paidPayments
            ->where('type', Payment::TYPE_SECURITY_DEPOSIT)
            ->sum(
                fn (Payment $payment) => (float) $payment->amount
            );

        /*
         * Total money received.
         */
        $totalPayments = $paidPayments->sum(
            fn (Payment $payment) => (float) $payment->amount
        );

        /*
         * Company commission.
         *
         * Security deposits are excluded.
         */
        $commissionRate = (float) config('commission.rate', 10);

        $commissionablePayments = $paidPayments->whereIn('type', [
            Payment::TYPE_DEPOSIT,
            Payment::TYPE_BALANCE,
            Payment::TYPE_EXTRA_CHARGE,
        ]);

        $companyCommission = $commissionablePayments->sum(
            fn (Payment $payment) => (float) $payment->amount * ($commissionRate / 100)
        );

        /*
         * Refunds.
         */
        $totalRefunds = $refunds->sum(
            fn (Refund $refund) => (float) $refund->amount
        );

        $processedRefunds = $refunds
            ->where('status', 'processed')
            ->sum(
                fn (Refund $refund) => (float) $refund->amount
            );

        $pendingRefunds = $refunds
            ->where('status', 'pending')
            ->sum(
                fn (Refund $refund) => (float) $refund->amount
            );

        /*
         * Owner payouts.
         */
        $totalOwnerPayouts = $ownerPayouts->sum(
            fn (OwnerPayout $payout) => (float) $payout->net_amount
        );

        $paidOwnerPayouts = $ownerPayouts
            ->where('status', OwnerPayout::STATUS_PAID)
            ->sum(
                fn (OwnerPayout $payout) => (float) $payout->net_amount
            );

        $pendingOwnerPayouts = $ownerPayouts
            ->where('status', OwnerPayout::STATUS_PENDING)
            ->sum(
                fn (OwnerPayout $payout) => (float) $payout->net_amount
            );

        /*
         * Driver payouts.
         */
        $totalDriverPayouts = $driverPayouts->sum(
            fn (BookingDriver $assignment) => (float) $assignment->earnings
        );

        $paidDriverPayouts = $driverPayouts
            ->where('payout_status', BookingDriver::STATUS_PAID)
            ->sum(
                fn (BookingDriver $assignment) => (float) $assignment->earnings
            );

        $pendingDriverPayouts = $driverPayouts
            ->where('payout_status', BookingDriver::STATUS_PENDING)
            ->sum(
                fn (BookingDriver $assignment) => (float) $assignment->earnings
            );

        /*
         * Summary.
         */
        $summary = [
            'total_bookings' => $bookings->count(),

            'confirmed_bookings' => $bookings
                ->where('status', Booking::STATUS_CONFIRMED)
                ->count(),

            'completed_bookings' => $bookings
                ->where('status', Booking::STATUS_COMPLETED)
                ->count(),

            'cancelled_bookings' => $bookings
                ->where('status', Booking::STATUS_CANCELLED)
                ->count(),

            'total_payments' => round($totalPayments, 2),

            'rental_revenue' => round($rentalRevenue, 2),

            'extra_charges' => round($extraCharges, 2),

            'total_revenue' => round(
                $rentalRevenue + $extraCharges,
                2
            ),

            'security_deposits' => round($securityDeposits, 2),

            'total_refunds' => round($totalRefunds, 2),

            'processed_refunds' => round($processedRefunds, 2),

            'pending_refunds' => round($pendingRefunds, 2),

            'company_commission' => round($companyCommission, 2),

            'owner_payouts' => round($totalOwnerPayouts, 2),

            'paid_owner_payouts' => round($paidOwnerPayouts, 2),

            'pending_owner_payouts' => round($pendingOwnerPayouts, 2),

            'driver_payouts' => round($totalDriverPayouts, 2),

            'paid_driver_payouts' => round($paidDriverPayouts, 2),

            'pending_driver_payouts' => round($pendingDriverPayouts, 2),

            'total_cars' => Car::count(),

            'available_cars' => Car::where(
                'availability_status',
                'available'
            )
                ->where('approval_status', 'approved')
                ->count(),

            'booked_cars' => Car::where(
                'availability_status',
                'booked'
            )->count(),

            'total_inspections' => $inspections->count(),

            'approved_inspections' => $inspections
                ->where('status', Inspection::STATUS_APPROVED)
                ->count(),

            'issues_found' => $inspections
                ->where('status', Inspection::STATUS_ISSUES_FOUND)
                ->count(),
        ];

        /*
         * Booking status breakdown.
         */
        $bookingStatuses = $bookings
            ->groupBy('status')
            ->map(fn ($items) => $items->count())
            ->toArray();

        /*
         * Payment type breakdown.
         */
        $paymentTypes = $paidPayments
            ->groupBy('type')
            ->map(fn ($items) => round(
                $items->sum(
                    fn (Payment $payment) => (float) $payment->amount
                ),
                2
            ))
            ->toArray();

        /*
         * Payment method breakdown.
         */
        $paymentMethods = $paidPayments
            ->groupBy('payment_method')
            ->map(fn ($items) => round(
                $items->sum(
                    fn (Payment $payment) => (float) $payment->amount
                ),
                2
            ))
            ->toArray();

        /*
         * Top cars.
         *
         * Important: use the filtered booking query so the
         * selected date range is respected.
         */
        $topCars = (clone $bookingQuery)
            ->selectRaw('car_id, COUNT(*) as bookings_count')
            ->with('car:id,brand,model,plate_number')
            ->groupBy('car_id')
            ->orderByDesc('bookings_count')
            ->limit(5)
            ->get()
            ->map(fn (Booking $booking) => [
                'car' => $booking->car
                    ? "{$booking->car->brand} {$booking->car->model}"
                    : 'Unknown',

                'plate_number' => $booking->car?->plate_number,

                'bookings_count' => (int) $booking->bookings_count,
            ])
            ->values();

        /*
         * Refund status breakdown.
         */
        $refundStatuses = $refunds
            ->groupBy('status')
            ->map(fn ($items) => [
                'count' => $items->count(),

                'amount' => round(
                    $items->sum(
                        fn (Refund $refund) => (float) $refund->amount
                    ),
                    2
                ),
            ])
            ->toArray();

        /*
         * Revenue by date.
         *
         * This is useful for the revenue chart on the frontend.
         */
        $revenueByDate = $paidPayments
            ->whereIn('type', [
                Payment::TYPE_DEPOSIT,
                Payment::TYPE_BALANCE,
                Payment::TYPE_EXTRA_CHARGE,
            ])
            ->groupBy(
                fn (Payment $payment) => $payment->created_at?->toDateString()
            )
            ->map(fn ($items, $date) => [
                'date' => $date,

                'total' => round(
                    $items->sum(
                        fn (Payment $payment) => (float) $payment->amount
                    ),
                    2
                ),
            ])
            ->values();

        return Inertia::render('admin/reports', [
            'summary' => $summary,

            'bookingStatuses' => $bookingStatuses,

            'paymentTypes' => $paymentTypes,

            'paymentMethods' => $paymentMethods,

            'topCars' => $topCars,

            'refundStatuses' => $refundStatuses,

            'revenueByDate' => $revenueByDate,

            'filters' => [
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }
}
