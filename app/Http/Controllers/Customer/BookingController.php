<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $bookings = Booking::with(['car', 'payment'])
            ->where('customer_id', auth()->id())
            ->latest()
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'status' => $booking->status,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'total_price' => $booking->total_price,
                'need_driver' => $booking->need_driver,
                'notes' => $booking->notes,
                'car' => [
                    'id' => $booking->car->id,
                    'brand' => $booking->car->brand,
                    'model' => $booking->car->model,
                    'year' => $booking->car->year,
                    'plate_number' => $booking->car->plate_number,
                ],
                'payment' => $booking->payment
                    ? [
                        'payment_method' => $booking->payment->payment_method,
                        'payment_status' => $booking->payment->payment_status,
                        'paid_at' => $booking->payment->paid_at?->toDateTimeString(),
                    ]
                    : null,
            ]);

        return Inertia::render('customer/my-bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function store(Request $request, Car $car): RedirectResponse
    {
        if ($car->approval_status !== 'approved' || $car->availability_status !== 'available') {
            abort(404);
        }

        $validated = $request->validate([
            'pickup_date' => ['required', 'date', 'after_or_equal:today'],
            'return_date' => ['required', 'date', 'after:pickup_date'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'return_location' => ['required', 'string', 'max:255'],
            'need_driver' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $pickupDate = Carbon::parse($validated['pickup_date']);
        $returnDate = Carbon::parse($validated['return_date']);

        $days = $pickupDate->diffInDays($returnDate);
        $totalPrice = $days * $car->daily_price;

        Booking::create([
            'customer_id' => auth()->id(),
            'owner_id' => $car->owner_id,
            'car_id' => $car->id,
            'pickup_date' => $validated['pickup_date'],
            'return_date' => $validated['return_date'],
            'pickup_location' => $validated['pickup_location'],
            'return_location' => $validated['return_location'],
            'need_driver' => $validated['need_driver'] ?? false,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('customer.bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Booking request submitted! The owner will review it shortly.',
        ]);
    }

    public function pay(Request $request, Booking $booking): RedirectResponse
    {
        if ($booking->customer_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        if ($booking->status !== 'approved') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only approved bookings can be paid.',
            ]);
        }

        if ($booking->payment) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking has already been paid.',
            ]);
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'in:Cash,Bank Transfer,Telebirr,CBE Birr'],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
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

        return redirect()->route('customer.bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment submitted successfully! Your booking is confirmed.',
        ]);
    }
}
