<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function create(Booking $booking)
    {
        if ($booking->customer_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($booking->status !== 'approved') {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Only approved bookings can be paid.',
            ]);
        }

        if ($booking->payment) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking has already been paid.',
            ]);
        }

        return Inertia::render('customer/payment', [
            'booking' => $booking->load('car'),
        ]);
    }

    public function store(Request $request, Booking $booking)
    {
        if ($booking->customer_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        if ($booking->status !== 'approved') {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking cannot be paid.',
            ]);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:Telebirr,CBE Birr',
            'transaction_reference' => 'required|string|max:255',
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $validated['transaction_reference'],
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->update([
            'status' => 'paid',
        ]);

        return redirect()->route('customer.bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment completed successfully!',
        ]);
    }

    public function index()
    {
        $query = Payment::with('booking.car');

        if (auth()->user()->role !== 'admin') {
            $query->whereHas('booking', function ($q) {
                $q->where('customer_id', auth()->id());
            });
        }

        $payments = $query->latest()
            ->get();

        return Inertia::render('customer/payment-history', [
            'payments' => $payments,
        ]);
    }
}
