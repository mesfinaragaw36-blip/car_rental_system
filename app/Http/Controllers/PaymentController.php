<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
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

        if ($booking->need_driver) {
            $hasDriver = $booking->driverAssignment()
                ->whereIn('status', [BookingDriver::STATUS_ASSIGNED, BookingDriver::STATUS_ACCEPTED])
                ->exists();

            if (! $hasDriver) {
                return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'Payment is not available until a driver is assigned to this trip.']);
            }
        }

        $booking->load('car');

        return Inertia::render('payment', [
            'booking' => [
                'id' => $booking->id,
                'total_price' => $booking->total_price,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'car' => $booking->car->only(['brand', 'model', 'plate_number']),
                'need_driver' => $booking->need_driver,
                'driver' => $booking->driverAssignment?->driver ? [
                    'name' => $booking->driverAssignment->driver->name,
                ] : null,
            ],
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

        if ($booking->need_driver) {
            $hasDriver = $booking->driverAssignment()
                ->whereIn('status', [BookingDriver::STATUS_ASSIGNED, BookingDriver::STATUS_ACCEPTED])
                ->exists();

            if (! $hasDriver) {
                return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'Payment is not available until a driver is assigned.']);
            }
        }

        if ($booking->payment) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This booking has already been paid.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:Cash,Bank Transfer,Telebirr,CBE Birr',
            'transaction_reference' => 'nullable|string|max:255',
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'payment_method' => $validated['payment_method'],
            'transaction_reference' => $validated['transaction_reference'] ?? null,
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->update(['status' => 'paid']);

        return redirect()->route('bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment completed successfully!',
        ]);
    }

    public function receipt(Payment $payment): Response
    {
        $user = auth()->user();

        $payment->load([
            'booking.customer',
            'booking.owner',
            'booking.car',
        ]);

        $booking = $payment->booking;

        $days = $booking->pickup_date->diffInDays($booking->return_date);
        $dailyRate = $days > 0
            ? number_format($booking->total_price / $days, 2)
            : '0.00';

        // Security check: customer, owner, or admin can view receipt
        if (
            $booking->customer_id !== $user->id &&
            $booking->owner_id !== $user->id &&
            $user->role !== 'admin'
        ) {
            abort(403);
        }

        return Inertia::render('receipt', [
            'payment' => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'transaction_reference' => $payment->transaction_reference,
                'payment_status' => $payment->payment_status,
                'paid_at' => $payment->paid_at?->toDateTimeString(),
            ],
            'booking' => [
                'id' => $booking->id,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'total_price' => $booking->total_price,
                'days' => $days,
                'daily_rate' => $dailyRate,
            ],
            'customer' => $booking->customer ? [
                'name' => $booking->customer->name,
                'email' => $booking->customer->email,
                'phone' => $booking->customer->phone,
            ] : null,
            'car' => $booking->car ? [
                'brand' => $booking->car->brand,
                'model' => $booking->car->model,
                'plate_number' => $booking->car->plate_number,
            ] : null,
        ]);
    }
}
