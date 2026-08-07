<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Booking;
use App\Models\BookingDispute;
use Illuminate\Http\Request;

class BookingDisputeController extends Controller
{
    public function store(Request $request, Booking $booking)
    {
        $exists = BookingDispute::where('booking_id', $booking->id)
            ->where('type', 'owner_no_show')
            ->exists();

        if ($exists) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This dispute was already reported.',
            ]);
        }

        BookingDispute::create([
            'booking_id' => $booking->id,
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


    public function index()
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


    public function approve(BookingDispute $dispute)
    {
        $dispute->update([
            'status' => 'approved',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Dispute approved.',
        ]);
    }


    public function reject(BookingDispute $dispute)
    {
        $dispute->update([
            'status' => 'rejected',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Dispute rejected.',
        ]);
    }
}