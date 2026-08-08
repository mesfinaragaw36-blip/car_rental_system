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
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'all');

        $transactions = collect();

        if ($type === 'all' || $type === 'payment') {
            $transactions = $transactions->merge(
                Payment::with(['booking.customer:id,name', 'booking.owner:id,name', 'booking.car:id,brand,model,plate_number'])
                    ->latest()
                    ->get()
                    ->map(fn (Payment $payment) => $this->paymentPayload($payment))
            );
        }

        if ($type === 'all' || $type === 'refund') {
            $transactions = $transactions->merge(
                Refund::with(['booking.customer:id,name', 'booking.car:id,brand,model,plate_number'])
                    ->latest()
                    ->get()
                    ->map(fn (Refund $refund) => $this->refundPayload($refund))
            );
        }

        if ($type === 'all' || $type === 'owner_payout') {
            $transactions = $transactions->merge(
                OwnerPayout::with(['booking.customer:id,name', 'booking.car:id,brand,model,plate_number', 'owner:id,name'])
                    ->latest()
                    ->get()
                    ->map(fn (OwnerPayout $payout) => $this->ownerPayoutPayload($payout))
            );
        }

        if ($type === 'all' || $type === 'driver_payout') {
            $transactions = $transactions->merge(
                BookingDriver::with(['booking.customer:id,name', 'booking.car:id,brand,model,plate_number', 'driver:id,name'])
                    ->whereHas('booking')
                    ->get()
                    ->filter(fn (BookingDriver $assignment) => $assignment->hasEarnings())
                    ->map(fn (BookingDriver $assignment) => $this->driverPayoutPayload($assignment))
            );
        }

        $transactions = $transactions->sortByDesc('created_at')->values();

        $summary = [
            'total_transactions' => $transactions->count(),
            'total_company_earnings' => (string) round($transactions->sum(fn (array $transaction) => (float) ($transaction['commission_amount'] ?? 0)), 2),
            'total_amount' => (string) round($transactions->sum(fn (array $transaction) => (float) $transaction['amount']), 2),
        ];

        $perPage = 15;
        $page = max(1, (int) $request->integer('page', 1));

        $paginator = new LengthAwarePaginator(
            $transactions->forPage($page, $perPage)->values(),
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
            'filters' => ['type' => $type],
            'summary' => $summary,
        ]);
    }

    public function processRefund(Refund $refund): RedirectResponse
    {
        if ($refund->status === 'processed') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This refund has already been processed.',
            ]);
        }

        $refund->update([
            'status' => 'processed',
            'processed_at' => now(),
            'processed_by' => auth()->id(),
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Refund marked as processed.',
        ]);
    }

    public function markOwnerPaid(OwnerPayout $payout): RedirectResponse
    {
        if ($payout->status !== OwnerPayout::STATUS_PENDING) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This payout has already been paid.']);
        }

        $payout->update([
            'status' => OwnerPayout::STATUS_PAID,
            'paid_at' => now(),
        ]);

        $payout->owner?->notifyNow(
            "Payout transferred - Booking #{$payout->booking_id}",
            sprintf(
                'Your net payout of ETB %s for booking #%s has been transferred to your account.',
                number_format((float) $payout->net_amount, 2),
                $payout->booking_id,
            ),
            'payout_paid',
            OwnerPayout::class,
            $payout->id,
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Payout marked as paid.']);
    }

    public function markDriverPaid(BookingDriver $assignment): RedirectResponse
    {
        if ($assignment->payout_status !== BookingDriver::STATUS_PENDING) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This payout has already been paid.']);
        }

        $assignment->update([
            'payout_status' => BookingDriver::STATUS_PAID,
            'paid_at' => now(),
        ]);

        $assignment->driver?->notifyNow(
            "Payout transferred - Booking #{$assignment->booking_id}",
            sprintf(
                'Your driver earnings of ETB %s for booking #%s have been transferred to your account.',
                number_format((float) $assignment->earnings, 2),
                $assignment->booking_id,
            ),
            'payout_paid',
            BookingDriver::class,
            $assignment->id,
        );

        return back()->with('toast', ['type' => 'success', 'message' => 'Driver payout marked as paid.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function paymentPayload(Payment $payment): array
    {
        return [
            'type' => 'payment',
            'id' => $payment->id,
            'booking_id' => $payment->booking_id,
            'amount' => (string) $payment->amount,
            'status' => $payment->payment_status,
            'status_at' => $payment->paid_at?->toDateTimeString(),
            'created_at' => $payment->created_at->toDateTimeString(),
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

    private function paymentCommission(Payment $payment): ?string
    {
        if ($payment->payment_status !== 'paid' || $payment->type === Payment::TYPE_SECURITY_DEPOSIT) {
            return null;
        }

        $rate = (float) config('commission.rate', 10);

        return (string) round((float) $payment->amount * ($rate / 100), 2);
    }

    /**
     * @return array<string, mixed>
     */
    private function refundPayload(Refund $refund): array
    {
        return [
            'type' => 'refund',
            'id' => $refund->id,
            'booking_id' => $refund->booking_id,
            'amount' => (string) $refund->amount,
            'status' => $refund->status,
            'status_at' => $refund->processed_at?->toDateTimeString(),
            'created_at' => $refund->created_at->toDateTimeString(),
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
            'booking' => $this->bookingPayload($refund->booking),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function ownerPayoutPayload(OwnerPayout $payout): array
    {
        return [
            'type' => 'owner_payout',
            'id' => $payout->id,
            'booking_id' => $payout->booking_id,
            'amount' => (string) $payout->net_amount,
            'status' => $payout->status,
            'status_at' => $payout->paid_at?->toDateTimeString(),
            'created_at' => $payout->created_at->toDateTimeString(),
            'customer' => $payout->booking?->customer?->name,
            'owner' => $payout->owner?->name,
            'driver' => null,
            'car' => $this->carLabel($payout->booking),
            'plate_number' => $payout->booking?->car?->plate_number,
            'reason' => null,
            'gross_amount' => (string) $payout->gross_amount,
            'commission_amount' => (string) $payout->commission_amount,
            'net_amount' => (string) $payout->net_amount,
            'earnings' => null,
            'booking' => $this->bookingPayload($payout->booking),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function driverPayoutPayload(BookingDriver $assignment): array
    {
        return [
            'type' => 'driver_payout',
            'id' => $assignment->id,
            'booking_id' => $assignment->booking_id,
            'amount' => (string) $assignment->earnings,
            'status' => $assignment->payout_status,
            'status_at' => $assignment->paid_at?->toDateTimeString(),
            'created_at' => $assignment->created_at->toDateTimeString(),
            'customer' => $assignment->booking?->customer?->name,
            'owner' => null,
            'driver' => $assignment->driver?->name,
            'car' => $this->carLabel($assignment->booking),
            'plate_number' => $assignment->booking?->car?->plate_number,
            'reason' => null,
            'gross_amount' => null,
            'commission_amount' => null,
            'net_amount' => null,
            'earnings' => (string) $assignment->earnings,
            'booking' => $this->bookingPayload($assignment->booking),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function bookingPayload(?Booking $booking): ?array
    {
        return $booking ? [
            'pickup_date' => $booking->pickup_date?->toDateString(),
            'return_date' => $booking->return_date?->toDateString(),
            'pickup_location' => $booking->pickup_location,
            'return_location' => $booking->return_location,
            'need_driver' => (bool) $booking->need_driver,
            'total_price' => (string) $booking->total_price,
            'status' => $booking->status,
        ] : null;
    }

    private function carLabel(?Booking $booking): ?string
    {
        return $booking?->car
            ? $booking->car->brand.' '.$booking->car->model
            : null;
    }
}
