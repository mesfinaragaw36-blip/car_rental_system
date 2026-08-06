<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OwnerPayout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function index(Request $request): Response
    {
        $query = OwnerPayout::with('booking.car', 'owner');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $payouts = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/payouts', [
            'payouts' => $payouts,
            'filters' => $request->only(['status']),
        ]);
    }

    public function markPaid(OwnerPayout $payout): RedirectResponse
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
}
