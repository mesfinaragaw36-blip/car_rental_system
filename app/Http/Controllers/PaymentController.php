<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Inspection;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'type' => $payment->type,
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

    public function create(Booking $booking): Response|RedirectResponse
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'This booking is not awaiting a deposit payment.']);
        }
        if ($booking->hasPaidDeposit()) {
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
            'mode' => 'deposit',
            'booking' => [
                'id' => $booking->id,
                'total_price' => round((float) $booking->total_price, 2),
                'deposit_amount' => round($booking->depositAmount(), 2),
                'balance_amount' => round($booking->balanceAmount(), 2),
                'security_deposit_amount' => round($booking->securityDepositAmount(), 2),
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

    public function createPickup(Booking $booking): Response|RedirectResponse
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== Booking::STATUS_DEPOSIT_PAID) {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'This booking is not awaiting the pickup balance payment.']);
        }
        if ($booking->hasPaidBalance()) {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'The balance has already been paid for this booking.']);
        }
        if (! $booking->hasApprovedInspection(Inspection::TYPE_PICKUP)) {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'You can pay the balance once the vehicle passes the pickup inspection.']);
        }

        $booking->load('car', 'driverAssignment.driver');

        return Inertia::render('payment', [
            'mode' => 'pickup',
            'booking' => [
                'id' => $booking->id,
                'total_price' => round((float) $booking->total_price, 2),
                'deposit_amount' => round($booking->depositAmount(), 2),
                'balance_amount' => round($booking->balanceAmount(), 2),
                'security_deposit_amount' => round($booking->securityDepositAmount(), 2),
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
        if ($booking->status !== Booking::STATUS_CONFIRMED) {
            return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'This booking is not awaiting a deposit payment.']);
        }

        if ($booking->need_driver) {
            $hasDriver = $booking->driverAssignment()
                ->whereIn('status', [BookingDriver::STATUS_ASSIGNED, BookingDriver::STATUS_ACCEPTED])
                ->exists();

            if (! $hasDriver) {
                return redirect()->back()->with('toast', ['type' => 'error', 'message' => 'Payment is not available until a driver is assigned.']);
            }
        }

        if ($booking->hasPaidDeposit()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This booking has already been paid.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:Cash,Bank Transfer,Telebirr,CBE Birr',
            'transaction_reference' => 'required_unless:payment_method,Cash|string|max:255',
        ]);

        $depositAmount = $booking->depositAmount();

        DB::transaction(function () use ($booking, $validated, $depositAmount) {
            Booking::whereKey($booking->id)->lockForUpdate()->first();

            if ($booking->status !== Booking::STATUS_CONFIRMED) {
                throw new \RuntimeException('status');
            }

            Payment::create([
                'booking_id' => $booking->id,
                'type' => 'booking_deposit',
                'amount' => $depositAmount,
                'payment_method' => $validated['payment_method'],
                'transaction_reference' => $validated['transaction_reference'] ?? null,
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);

            $booking->update([
                'status' => Booking::STATUS_DEPOSIT_PAID,
                'deposit_paid_at' => now(),
            ]);

            $owner = $booking->owner;
            $car = $booking->car;

            if ($owner) {
                $owner->notifyNow(
                    "Bring your {$car->brand} {$car->model} to the branch",
                    sprintf(
                        'A customer paid the ETB %s booking deposit for your %s %s. Please deliver the car to %s by %s so the pre-rental inspection can take place before pickup on %s.',
                        number_format($depositAmount, 2),
                        $car->brand,
                        $car->model,
                        $booking->pickup_location,
                        $booking->carDeliveryDueDate()->format('M j, Y'),
                        $booking->pickup_date->format('M j, Y g:i A'),
                    ),
                    'booking_locked',
                    Booking::class,
                    $booking->id,
                );
            }
        });

        return redirect()->route('bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Deposit payment completed! Your booking dates are now locked.',
        ]);
    }

    public function storePickup(Request $request, Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== Booking::STATUS_DEPOSIT_PAID) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This booking is not awaiting the pickup balance payment.']);
        }
        if ($booking->hasPaidBalance()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'The balance has already been paid for this booking.']);
        }
        if (! $booking->hasApprovedInspection(Inspection::TYPE_PICKUP)) {
            return back()->with('toast', ['type' => 'error', 'message' => 'You can pay the balance once the vehicle passes the pickup inspection.']);
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:Cash,Bank Transfer,Telebirr,CBE Birr',
            'transaction_reference' => 'required_unless:payment_method,Cash|string|max:255',
        ]);

        $balance = $booking->balanceAmount();
        $securityDeposit = $booking->securityDepositAmount();
        $totalReceived = round($balance + $securityDeposit, 2);

        DB::transaction(function () use ($booking, $balance, $securityDeposit, $totalReceived, $validated) {
            Booking::whereKey($booking->id)->lockForUpdate()->first();

            if ($booking->status !== Booking::STATUS_DEPOSIT_PAID || $booking->hasPaidBalance()) {
                throw new \RuntimeException('status');
            }

            foreach ([
                Payment::TYPE_BALANCE => $balance,
                Payment::TYPE_SECURITY_DEPOSIT => $securityDeposit,
            ] as $type => $amount) {
                if ($amount <= 0) {
                    continue;
                }

                Payment::create([
                    'booking_id' => $booking->id,
                    'type' => $type,
                    'amount' => $amount,
                    'payment_method' => $validated['payment_method'],
                    'transaction_reference' => $validated['transaction_reference'] ?? null,
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                ]);
            }

            $booking->update([
                'status' => Booking::STATUS_PAID,
                'balance_paid_at' => now(),
                'security_deposit_paid_at' => now(),
            ]);
            $booking->car->update([
            'availability_status' => 'booked',
        ]);

            $booking->customer?->notifyNow(
                "Booking #{$booking->id} fully paid",
                sprintf(
                    'Your payment of ETB %s (ETB %s rental balance + ETB %s security deposit) was received for the %s %s. The vehicle is ready for pickup at %s on %s.',
                    number_format($totalReceived, 2),
                    number_format($balance, 2),
                    number_format($securityDeposit, 2),
                    $booking->car->brand,
                    $booking->car->model,
                    $booking->pickup_location,
                    $booking->pickup_date->format('M j, Y g:i A'),
                ),
                'booking_paid',
                Booking::class,
                $booking->id,
            );

            $booking->owner?->notifyNow(
                "Booking #{$booking->id} fully paid",
                sprintf(
                    'The customer paid ETB %s (ETB %s rental balance + ETB %s security deposit) for your %s %s. Prepare for handover at %s on %s.',
                    number_format($totalReceived, 2),
                    number_format($balance, 2),
                    number_format($securityDeposit, 2),
                    $booking->car->brand,
                    $booking->car->model,
                    $booking->pickup_location,
                    $booking->pickup_date->format('M j, Y g:i A'),
                ),
                'booking_paid',
                Booking::class,
                $booking->id,
            );
        });

        return redirect()->route('bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment complete! The vehicle is ready for pickup at the branch.',
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
