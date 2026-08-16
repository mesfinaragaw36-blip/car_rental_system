<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Display all financial transactions.
     */
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'all');

        $allowedTypes = [
            'all',
            'payment',
            'refund',
            'owner_payout',
            'driver_payout',
        ];

        if (! in_array($type, $allowedTypes, true)) {
            $type = 'all';
        }

        $transactions = collect();

        /*
        |--------------------------------------------------------------------------
        | Payments
        |--------------------------------------------------------------------------
        */
        if ($type === 'all' || $type === 'payment') {
            $payments = Payment::query()
                ->with([
                    'booking.customer:id,name',
                    'booking.owner:id,name',
                    'booking.car:id,brand,model,plate_number',
                ])
                ->latest()
                ->get()
                ->map(
                    fn (Payment $payment) => $this->paymentPayload($payment)
                );

            $transactions = $transactions->merge($payments);
        }

        /*
        |--------------------------------------------------------------------------
        | Refunds
        |--------------------------------------------------------------------------
        */
        if ($type === 'all' || $type === 'refund') {
            $refunds = Refund::query()
                ->with([
                    'booking.customer:id,name',
                    'booking.owner:id,name',
                    'booking.car:id,brand,model,plate_number',
                ])
                ->latest()
                ->get()
                ->map(
                    fn (Refund $refund) => $this->refundPayload($refund)
                );

            $transactions = $transactions->merge($refunds);
        }

        /*
        |--------------------------------------------------------------------------
        | Owner payouts
        |--------------------------------------------------------------------------
        */
        if ($type === 'all' || $type === 'owner_payout') {
            $ownerPayouts = OwnerPayout::query()
                ->with([
                    'booking.customer:id,name',
                    'booking.owner:id,name',
                    'booking.car:id,brand,model,plate_number',
                    'owner:id,name',
                ])
                ->latest()
                ->get()
                ->map(
                    fn (OwnerPayout $payout) => $this->ownerPayoutPayload($payout)
                );

            $transactions = $transactions->merge($ownerPayouts);
        }

        /*
        |--------------------------------------------------------------------------
        | Driver payouts
        |--------------------------------------------------------------------------
        */
        if ($type === 'all' || $type === 'driver_payout') {
            $driverPayouts = BookingDriver::query()
                ->with([
                    'booking.customer:id,name',
                    'booking.owner:id,name',
                    'booking.car:id,brand,model,plate_number',
                    'driver:id,name',
                ])
                ->whereHas('booking')
                ->get()
                ->filter(
                    fn (BookingDriver $assignment) => $assignment->hasEarnings()
                )
                ->map(
                    fn (BookingDriver $assignment) => $this->driverPayoutPayload(
                        $assignment
                    )
                );

            $transactions = $transactions->merge($driverPayouts);
        }

        /*
        |--------------------------------------------------------------------------
        | Sort combined transactions
        |--------------------------------------------------------------------------
        */
        $transactions = $transactions
            ->sortByDesc('created_at')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Summary
        |--------------------------------------------------------------------------
        */
        $summary = [
            'total_transactions' => $transactions->count(),

            'total_company_earnings' => number_format(
                $transactions->sum(
                    fn (array $transaction) => (float) (
                        $transaction['commission_amount'] ?? 0
                    )
                ),
                2,
                '.',
                ''
            ),

            'total_amount' => number_format(
                $transactions->sum(
                    fn (array $transaction) => (float) (
                        $transaction['amount'] ?? 0
                    )
                ),
                2,
                '.',
                ''
            ),
        ];

        /*
        |--------------------------------------------------------------------------
        | Manual pagination
        |--------------------------------------------------------------------------
        */
        $perPage = 15;

        $page = max(
            1,
            (int) $request->input(
                'page',
                LengthAwarePaginator::resolveCurrentPage()
            )
        );

        $paginator = new LengthAwarePaginator(
            $transactions
                ->forPage($page, $perPage)
                ->values(),
            $transactions->count(),
            $perPage,
            $page,
            [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('admin/transactions', [
            'transactions' => $paginator,
            'filters' => [
                'type' => $type,
            ],
            'summary' => $summary,
        ]);
    }

    /**
     * Mark a refund as processed.
     */
    public function processRefund(Refund $refund): RedirectResponse
    {
        try {
            DB::transaction(function () use ($refund) {
                $lockedRefund = Refund::query()
                    ->lockForUpdate()
                    ->findOrFail($refund->id);

                if ($lockedRefund->status === 'processed') {
                    throw new \RuntimeException('already-processed');
                }

                $lockedRefund->update([
                    'status' => 'processed',
                    'processed_at' => now(),
                    'processed_by' => auth()->id(),
                ]);
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'already-processed') {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'This refund has already been processed.',
                ]);
            }

            throw $e;
        }

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Refund marked as processed.',
        ]);
    }

    /**
     * Mark an owner payout as paid.
     */
    public function markOwnerPaid(OwnerPayout $payout): RedirectResponse
    {
        $lockedPayout = null;

        try {
            DB::transaction(function () use ($payout, &$lockedPayout) {
                $lockedPayout = OwnerPayout::query()
                    ->with([
                        'owner',
                        'booking',
                        'booking.car',
                    ])
                    ->lockForUpdate()
                    ->findOrFail($payout->id);

                if ($lockedPayout->status !== OwnerPayout::STATUS_PENDING) {
                    throw new \RuntimeException('already-paid');
                }

                $lockedPayout->update([
                    'status' => OwnerPayout::STATUS_PAID,
                    'paid_at' => now(),
                ]);
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'already-paid') {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'This payout has already been paid.',
                ]);
            }

            throw $e;
        }

        if ($lockedPayout?->owner) {
            $lockedPayout->owner->notifyNow(
                "Payout transferred - Booking #{$lockedPayout->booking_id}",
                sprintf(
                    'Your net payout of ETB %s for booking #%s has been transferred to your account.',
                    number_format(
                        (float) $lockedPayout->net_amount,
                        2
                    ),
                    $lockedPayout->booking_id,
                ),
                'payout_paid',
                OwnerPayout::class,
                $lockedPayout->id,
            );
        }

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Owner payout marked as paid.',
        ]);
    }

    /**
     * Mark a driver payout as paid.
     */
    public function markDriverPaid(
        BookingDriver $assignment
    ): RedirectResponse {
        $lockedAssignment = null;

        try {
            DB::transaction(function () use (
                $assignment,
                &$lockedAssignment
            ) {
                $lockedAssignment = BookingDriver::query()
                    ->with([
                        'driver',
                        'booking',
                        'booking.car',
                    ])
                    ->lockForUpdate()
                    ->findOrFail($assignment->id);

                if (
                    $lockedAssignment->payout_status !==
                    BookingDriver::STATUS_PENDING
                ) {
                    throw new \RuntimeException('already-paid');
                }

                if (! $lockedAssignment->hasEarnings()) {
                    throw new \RuntimeException('no-earnings');
                }

                $lockedAssignment->update([
                    'payout_status' => BookingDriver::STATUS_PAID,
                    'paid_at' => now(),
                ]);
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'already-paid') {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'This driver payout has already been paid.',
                ]);
            }

            if ($e->getMessage() === 'no-earnings') {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'This driver assignment has no payable earnings.',
                ]);
            }

            throw $e;
        }

        if ($lockedAssignment?->driver) {
            $lockedAssignment->driver->notifyNow(
                "Payout transferred - Booking #{$lockedAssignment->booking_id}",
                sprintf(
                    'Your driver earnings of ETB %s for booking #%s have been transferred to your account.',
                    number_format(
                        (float) $lockedAssignment->earnings,
                        2
                    ),
                    $lockedAssignment->booking_id,
                ),
                'payout_paid',
                BookingDriver::class,
                $lockedAssignment->id,
            );
        }

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Driver payout marked as paid.',
        ]);
    }

    /**
     * Mark a cash payment as paid after admin verification.
     */
    public function markCashPaid(Payment $payment): RedirectResponse
    {
        try {
            DB::transaction(function () use ($payment) {
                $lockedPayment = Payment::query()
                    ->lockForUpdate()
                    ->findOrFail($payment->id);

                /*
                 * Only cash payments can be manually verified.
                 */
                if (
                    strtolower((string) $lockedPayment->payment_method) !== 'cash'
                ) {
                    throw new \RuntimeException('not-cash');
                }

                /*
                 * Do not process a payment that is already paid.
                 */
                if ($lockedPayment->payment_status === 'paid') {
                    throw new \RuntimeException('already-paid');
                }

                $lockedPayment->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                ]);
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'not-cash') {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'Only cash payments can be manually verified.',
                ]);
            }

            if ($e->getMessage() === 'already-paid') {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'This payment has already been marked as paid.',
                ]);
            }

            throw $e;
        }

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Cash payment verified and marked as paid.',
        ]);
    }

    /**
     * Build payment transaction payload.
     *
     * @return array<string, mixed>
     */
    private function paymentPayload(Payment $payment): array
    {
        return [
            'type' => 'payment',
            'id' => $payment->id,
            'booking_id' => $payment->booking_id,

            'amount' => number_format(
                (float) $payment->amount,
                2,
                '.',
                ''
            ),

            'status' => $payment->payment_status,

            'status_at' => $payment->paid_at?->toDateTimeString(),

            'created_at' => $payment->created_at?->toDateTimeString(),

            'customer' => $payment->booking?->customer?->name,

            'owner' => $payment->booking?->owner?->name,

            'driver' => null,

            'car' => $this->carLabel($payment->booking),

            'plate_number' => $payment->booking?->car?->plate_number,

            'reason' => null,

            'gross_amount' => null,

            'commission_amount' => $this->paymentCommission($payment),

            'net_amount' => null,

            'earnings' => null,

            'payment_type' => $payment->type,

            'payment_method' => $payment->payment_method,

            'transaction_reference' => $payment->transaction_reference,

            'booking' => $this->bookingPayload($payment->booking),
        ];
    }

    /**
     * Calculate company commission for a payment.
     */
    private function paymentCommission(Payment $payment): ?string
    {
        if ($payment->payment_status !== 'paid') {
            return null;
        }

        /*
         * Security deposits are refundable and therefore are not
         * considered company revenue.
         */
        if ($payment->type === Payment::TYPE_SECURITY_DEPOSIT) {
            return null;
        }

        $rate = (float) config('commission.rate', 10);

        return number_format(
            (float) $payment->amount * ($rate / 100),
            2,
            '.',
            ''
        );
    }

    /**
     * Build refund transaction payload.
     *
     * @return array<string, mixed>
     */
    private function refundPayload(Refund $refund): array
    {
        return [
            'type' => 'refund',
            'id' => $refund->id,
            'booking_id' => $refund->booking_id,

            'amount' => number_format(
                (float) $refund->amount,
                2,
                '.',
                ''
            ),

            'status' => $refund->status,

            'status_at' => $refund->processed_at?->toDateTimeString(),

            'created_at' => $refund->created_at?->toDateTimeString(),

            'customer' => $refund->booking?->customer?->name,

            'owner' => null,

            'driver' => null,

            'car' => $this->carLabel($refund->booking),

            'plate_number' => $refund->booking?->car?->plate_number,

            'reason' => $refund->reason,

            'gross_amount' => null,

            'commission_amount' => null,

            'net_amount' => null,

            'earnings' => null,

            'payment_type' => null,

            'payment_method' => null,

            'transaction_reference' => null,

            'booking' => $this->bookingPayload($refund->booking),
        ];
    }

    /**
     * Build owner payout transaction payload.
     *
     * @return array<string, mixed>
     */
    private function ownerPayoutPayload(OwnerPayout $payout): array
    {
        return [
            'type' => 'owner_payout',
            'id' => $payout->id,
            'booking_id' => $payout->booking_id,

            'amount' => number_format(
                (float) $payout->net_amount,
                2,
                '.',
                ''
            ),

            'status' => $payout->status,

            'status_at' => $payout->paid_at?->toDateTimeString(),

            'created_at' => $payout->created_at?->toDateTimeString(),

            'customer' => $payout->booking?->customer?->name,

            'owner' => $payout->owner?->name,

            'driver' => null,

            'car' => $this->carLabel($payout->booking),

            'plate_number' => $payout->booking?->car?->plate_number,

            'reason' => null,

            'gross_amount' => number_format(
                (float) $payout->gross_amount,
                2,
                '.',
                ''
            ),

            'commission_amount' => number_format(
                (float) $payout->commission_amount,
                2,
                '.',
                ''
            ),

            'net_amount' => number_format(
                (float) $payout->net_amount,
                2,
                '.',
                ''
            ),

            'earnings' => null,

            'payment_type' => null,

            'payment_method' => null,

            'transaction_reference' => null,

            'booking' => $this->bookingPayload($payout->booking),
        ];
    }

    /**
     * Build driver payout transaction payload.
     *
     * @return array<string, mixed>
     */
    private function driverPayoutPayload(
        BookingDriver $assignment
    ): array {
        return [
            'type' => 'driver_payout',
            'id' => $assignment->id,
            'booking_id' => $assignment->booking_id,

            'amount' => number_format(
                (float) $assignment->earnings,
                2,
                '.',
                ''
            ),

            'status' => $assignment->payout_status,

            'status_at' => $assignment->paid_at?->toDateTimeString(),

            'created_at' => $assignment->created_at?->toDateTimeString(),

            'customer' => $assignment->booking?->customer?->name,

            'owner' => $assignment->booking?->owner?->name,

            'driver' => $assignment->driver?->name,

            'car' => $this->carLabel($assignment->booking),

            'plate_number' => $assignment->booking?->car?->plate_number,

            'reason' => null,

            'gross_amount' => null,

            'commission_amount' => null,

            'net_amount' => null,

            'earnings' => number_format(
                (float) $assignment->earnings,
                2,
                '.',
                ''
            ),

            'payment_type' => null,

            'payment_method' => null,

            'transaction_reference' => null,

            'booking' => $this->bookingPayload($assignment->booking),
        ];
    }

    /**
     * Build booking information for the transaction details modal.
     *
     * @return array<string, mixed>|null
     */
    private function bookingPayload(?Booking $booking): ?array
    {
        if (! $booking) {
            return null;
        }

        return [
            'pickup_date' => $booking->pickup_date?->toDateString(),

            'return_date' => $booking->return_date?->toDateString(),

            'pickup_location' => $booking->pickup_location,

            'return_location' => $booking->return_location,

            'need_driver' => (bool) $booking->need_driver,

            'total_price' => number_format(
                (float) $booking->total_price,
                2,
                '.',
                ''
            ),

            'status' => $booking->status,
        ];
    }

    /**
     * Return a readable vehicle name.
     */
    private function carLabel(?Booking $booking): ?string
    {
        if (! $booking?->car) {
            return null;
        }

        return trim(
            $booking->car->brand.' '.$booking->car->model
        );
    }
}
