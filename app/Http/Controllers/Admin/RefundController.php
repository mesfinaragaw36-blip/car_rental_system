<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RefundController extends Controller
{
    public function index(): Response
    {
        $refunds = Refund::with([
                'booking.customer:id,name',
                'booking.car:id,brand,model,plate_number',
            ])
            ->latest()
            ->get()
            ->map(fn (Refund $refund) => [
                'id' => $refund->id,
                'amount' => $refund->amount,
                'reason' => $refund->reason,
                'status' => $refund->status,
                'processed_at' => $refund->processed_at?->toDateTimeString(),
                'customer' => $refund->booking?->customer?->name,
                'car' => $refund->booking?->car
                    ? $refund->booking->car->brand.' '.$refund->booking->car->model
                    : null,
                'plate_number' => $refund->booking?->car?->plate_number,
                'booking_id' => $refund->booking_id,
            ]);

        return Inertia::render('admin/refunds', [
            'refunds' => $refunds,
        ]);
    }


    public function process(Refund $refund): RedirectResponse
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
}
