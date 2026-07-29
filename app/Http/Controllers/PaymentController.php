<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $query = Payment::with('booking.car', 'booking.customer', 'booking.owner');

        if ($user->role === 'admin') {
            if ($request->filled('status')) {
                $query->where('payment_status', $request->input('status'));
            }
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->whereHas('booking.customer', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            }
        } elseif ($user->role === 'owner') {
            $query->whereHas('booking', fn ($q) => $q->where('owner_id', $user->id));
        } else {
            $query->whereHas('booking', fn ($q) => $q->where('customer_id', $user->id));
        }

        $payments = $query->latest()->get()->map(fn (Payment $payment) => [
            'id' => $payment->id,
            'payment_method' => $payment->payment_method,
            'payment_status' => $payment->payment_status,
            'amount' => $payment->amount,
            'paid_at' => $payment->paid_at?->toDateTimeString(),
            'booking_id' => $payment->booking_id,
            'customer' => $payment->booking->customer ? ['id' => $payment->booking->customer->id, 'name' => $payment->booking->customer->name] : null,
            'car' => $payment->booking->car ? ['brand' => $payment->booking->car->brand, 'model' => $payment->booking->car->model, 'plate_number' => $payment->booking->car->plate_number] : null,
        ]);

        return Inertia::render('payments', [
            'role' => $user->role,
            'payments' => $payments,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create(Booking $booking): Response
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'approved') {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'Only approved bookings can be paid.']);
        }
        if ($booking->payment) {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'This booking has already been paid.']);
        }

        return Inertia::render('payment', [
            'booking' => $booking->load('car'),
            'role' => $user->role,
        ]);
    }

    public function store(Request $request, Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'approved') {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'This booking cannot be paid.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:cash,bank_transfer,telebirr,chapa',
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->update(['status' => 'paid']);

        return redirect()->route('bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment completed successfully!',
        ]);
    }
}
