<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\Inspection;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\Refund;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the reports page.
     */
    public function index(Request $request): Response
    {
        $reportData = $this->getReportData($request);

        return Inertia::render('admin/reports', $reportData);
    }

    /**
     * Generate and download the report as a PDF.
     */
    public function exportPdf(Request $request)
    {
        $reportData = $this->getReportData($request);

       $pdf = Pdf::loadView('reports.pdf', $reportData)
            ->setPaper('a4', 'portrait');

        $from = $request->input('from');
        $to = $request->input('to');

        $filename = 'ethio-car-rental-report';

        if ($from && $to) {
            $filename .= "-{$from}-to-{$to}";
        } elseif ($from) {
            $filename .= "-from-{$from}";
        } elseif ($to) {
            $filename .= "-until-{$to}";
        }

        $filename .= '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Generate and download the report as a CSV file.
     *
     * If a "section" query parameter is provided, only that
     * section's data is exported. Otherwise the full report
     * is exported across multiple tables in one file.
     */
    public function exportCsv(Request $request)
    {
        $reportData = $this->getReportData($request);
        $section = $request->input('section');

        $from = $request->input('from');
        $to = $request->input('to');

        $filename = 'ethio-car-rental-report';

        if ($section) {
            $filename .= "-{$section}";
        }

        if ($from && $to) {
            $filename .= "-{$from}-to-{$to}";
        } elseif ($from) {
            $filename .= "-from-{$from}";
        } elseif ($to) {
            $filename .= "-until-{$to}";
        }

        $filename .= '.csv';

        $callback = function () use ($reportData, $section) {
            $handle = fopen('php://output', 'w');

            if ($section) {
                $this->writeCsvSection($handle, $section, $reportData);
            } else {
                foreach ($this->csvSectionKeys() as $key) {
                    $this->writeCsvSection($handle, $key, $reportData);
                    fputcsv($handle, []);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * The ordered list of exportable section keys.
     */
    private function csvSectionKeys(): array
    {
        return [
            'summary',
            'bookingStatuses',
            'paymentTypes',
            'paymentMethods',
            'topCars',
            'topCustomers',
            'topOwners',
            'topDrivers',
            'refundStatuses',
            'revenueByDate',
        ];
    }

    /**
     * Write a single section's rows to the CSV output stream.
     */
    private function writeCsvSection($handle, string $section, array $reportData): void
    {
        $formatLabel = fn (string $value) => ucwords(str_replace('_', ' ', $value));

        switch ($section) {
            case 'summary':
                fputcsv($handle, ['Summary Item', 'Value']);
                foreach ($reportData['summary'] as $key => $value) {
                    fputcsv($handle, [$formatLabel($key), $value]);
                }
                break;

            case 'bookingStatuses':
                fputcsv($handle, ['Booking Status', 'Count']);
                foreach ($reportData['bookingStatuses'] as $status => $count) {
                    fputcsv($handle, [$formatLabel($status), $count]);
                }
                break;

            case 'paymentTypes':
                fputcsv($handle, ['Payment Type', 'Amount']);
                foreach ($reportData['paymentTypes'] as $type => $amount) {
                    fputcsv($handle, [$formatLabel($type), $amount]);
                }
                break;

            case 'paymentMethods':
                fputcsv($handle, ['Payment Method', 'Amount']);
                foreach ($reportData['paymentMethods'] as $method => $amount) {
                    fputcsv($handle, [$formatLabel($method), $amount]);
                }
                break;

            case 'topCars':
                fputcsv($handle, ['Rank', 'Vehicle', 'Plate Number', 'Bookings']);
                foreach ($reportData['topCars'] as $index => $car) {
                    fputcsv($handle, [
                        $index + 1,
                        $car['car'],
                        $car['plate_number'],
                        $car['bookings_count'],
                    ]);
                }
                break;

            case 'topCustomers':
                fputcsv($handle, ['Rank', 'Customer', 'Email', 'Bookings']);
                foreach ($reportData['topCustomers'] as $index => $customer) {
                    fputcsv($handle, [
                        $index + 1,
                        $customer['name'],
                        $customer['email'],
                        $customer['bookings_count'],
                    ]);
                }
                break;

            case 'topOwners':
                fputcsv($handle, ['Rank', 'Owner', 'Email', 'Cars Registered']);
                foreach ($reportData['topOwners'] as $index => $owner) {
                    fputcsv($handle, [
                        $index + 1,
                        $owner['name'],
                        $owner['email'],
                        $owner['cars_count'],
                    ]);
                }
                break;

            case 'topDrivers':
                fputcsv($handle, ['Rank', 'Driver', 'Email', 'Assignments Accepted']);
                foreach ($reportData['topDrivers'] as $index => $driver) {
                    fputcsv($handle, [
                        $index + 1,
                        $driver['name'],
                        $driver['email'],
                        $driver['assignments_count'],
                    ]);
                }
                break;

            case 'refundStatuses':
                fputcsv($handle, ['Refund Status', 'Count', 'Amount']);
                foreach ($reportData['refundStatuses'] as $status => $data) {
                    fputcsv($handle, [$formatLabel($status), $data['count'], $data['amount']]);
                }
                break;

            case 'revenueByDate':
                fputcsv($handle, ['Date', 'Revenue']);
                foreach ($reportData['revenueByDate'] as $item) {
                    fputcsv($handle, [$item['date'], $item['total']]);
                }
                break;
        }
    }


    /**
     * Build all report data.
     *
     * This method is shared by the web report and PDF report
     * so both outputs always contain the same information.
     */
    private function getReportData(Request $request): array
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

        /*
         * Retrieve filtered report records.
         */
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
        $paidPayments = $payments->where(
            'payment_status',
            'paid'
        );

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
            fn (Payment $payment) => (float) $payment->amount
                * ($commissionRate / 100)
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
            ->where(
                'payout_status',
                BookingDriver::STATUS_PENDING
            )
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

            'pending_owner_payouts' => round(
                $pendingOwnerPayouts,
                2
            ),

            'driver_payouts' => round($totalDriverPayouts, 2),

            'paid_driver_payouts' => round(
                $paidDriverPayouts,
                2
            ),

            'pending_driver_payouts' => round(
                $pendingDriverPayouts,
                2
            ),

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
                ->where(
                    'status',
                    Inspection::STATUS_ISSUES_FOUND
                )
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
         * The filtered booking query is cloned so the selected
         * date range is respected.
         */
        $topCars = (clone $bookingQuery)
            ->selectRaw('car_id, COUNT(*) as bookings_count')
            ->with('car:id,brand,model,plate_number')
            ->groupBy('car_id')
            ->orderByDesc('bookings_count')
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
         * Top customers by bookings made.
         */
        $topCustomers = (clone $bookingQuery)
            ->selectRaw('customer_id, COUNT(*) as bookings_count')
            ->with('customer:id,name,email')
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->orderByDesc('bookings_count')
            ->get()
            ->map(fn (Booking $booking) => [
                'name' => $booking->customer?->name ?? 'Unknown',
                'email' => $booking->customer?->email,
                'bookings_count' => (int) $booking->bookings_count,
            ])
            ->values();

        /*
         * Top owners by cars registered.
         *
         * Uses the car's own created_at, not the booking date range,
         * since registration is independent of bookings.
         */
        $carQuery = Car::query();

        if ($from) {
            $carQuery->whereDate('created_at', '>=', $from);
        }

        if ($to) {
            $carQuery->whereDate('created_at', '<=', $to);
        }

        $topOwners = $carQuery
            ->selectRaw('owner_id, COUNT(*) as cars_count')
            ->with('owner:id,name,email')
            ->whereNotNull('owner_id')
            ->groupBy('owner_id')
            ->orderByDesc('cars_count')
            ->get()
            ->map(fn (Car $car) => [
                'name' => $car->owner?->name ?? 'Unknown',
                'email' => $car->owner?->email,
                'cars_count' => (int) $car->cars_count,
            ])
            ->values();

        /*
         * Top drivers by accepted assignments.
         *
         * Counts assignments the driver actually took on
         * (accepted, completed, or paid) rather than pending/rejected.
         */
        $topDrivers = (clone $driverPayoutQuery)
            ->selectRaw('driver_id, COUNT(*) as assignments_count')
            ->with('driver:id,name,email')
            ->whereIn('status', [
                BookingDriver::STATUS_ACCEPTED,
                BookingDriver::STATUS_COMPLETED,
                BookingDriver::STATUS_PAID,
            ])
            ->whereNotNull('driver_id')
            ->groupBy('driver_id')
            ->orderByDesc('assignments_count')
            ->get()
            ->map(fn (BookingDriver $assignment) => [
                'name' => $assignment->driver?->name ?? 'Unknown',
                'email' => $assignment->driver?->email,
                'assignments_count' => (int) $assignment->assignments_count,
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
         */
        $revenueByDate = $paidPayments
            ->whereIn('type', [
                Payment::TYPE_DEPOSIT,
                Payment::TYPE_BALANCE,
                Payment::TYPE_EXTRA_CHARGE,
            ])
            ->groupBy(
                fn (Payment $payment) =>
                    $payment->created_at?->toDateString()
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
            ->sortBy('date')
            ->values();

        /*
         * Report metadata.
         */
        $report = [
            'company_name' => 'Ethio Car Rental',

            'subtitle' => 'Administrative Report',

            'title' => 'Rental Business Report',

            'generated_at' => now(),

            'from' => $from,

            'to' => $to,
        ];

        return [
            'report' => $report,

            'summary' => $summary,

            'bookingStatuses' => $bookingStatuses,

            'paymentTypes' => $paymentTypes,

            'paymentMethods' => $paymentMethods,

            'topCars' => $topCars,

            'topCustomers' => $topCustomers,

            'topOwners' => $topOwners,

            'topDrivers' => $topDrivers,

            'refundStatuses' => $refundStatuses,

            'revenueByDate' => $revenueByDate,

            'filters' => [
                'from' => $from,
                'to' => $to,
            ],
        ];
    }
}