<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDispute;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingDisputeController extends Controller
{
    public function store(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($booking->disputes()->where('type', 'owner_no_show')->exists()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This dispute was already reported.',
            ]);
        }

        $booking->disputes()->create([
            'customer_id' => $booking->customer_id,
            'owner_id' => $booking->owner_id,
            'type' => 'owner_no_show',
            'description' => 'Owner did not deliver the car.',
            'status' => 'pending',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Dispute reported successfully.',
        ]);
    }

    public function index(): Response
    {
        $disputes = BookingDispute::with([
            'booking.car',
            'customer',
            'owner',
        ])
            ->latest()
            ->paginate(15);

        return Inertia::render('disputes', [
            'disputes' => $disputes,
        ]);
    }

    public function approve(BookingDispute $dispute): RedirectResponse
    {
        $dispute->update(['status' => 'approved']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Dispute approved.',
        ]);
    }

    public function reject(BookingDispute $dispute): RedirectResponse
    {
        $dispute->update(['status' => 'rejected']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Dispute rejected.',
        ]);
    }
}
