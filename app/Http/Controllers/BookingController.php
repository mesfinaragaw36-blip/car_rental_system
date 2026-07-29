<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $query = Booking::with(['customer', 'car', 'payment', 'driverAssignment.driver']);

        if ($user->role === 'admin') {
            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->whereHas('customer', fn ($q2) => $q2->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('car', fn ($q2) => $q2->where('brand', 'like', "%{$search}%")->orWhere('model', 'like', "%{$search}%"));
                });
            }
        } elseif ($user->role === 'owner') {
            $query->where('owner_id', $user->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        $bookings = $query->latest()->paginate(15)->withQueryString();

        $availableDrivers = collect();
        if ($user->role === 'owner' || $user->role === 'admin') {
            $availableDrivers = User::where('role', 'driver')
                ->whereHas('driverProfile', fn ($q) => $q->where('availability', 'available'))
                ->get(['id', 'name', 'phone']);
        }

        return Inertia::render('bookings', [
            'role' => $user->role,
            'bookings' => $bookings,
            'availableDrivers' => $availableDrivers,
            'filters' => $request->only(['status', 'search']),
            'stats' => $user->role === 'admin' ? [
                'total' => Booking::count(),
                'pending' => Booking::where('status', 'pending')->count(),
                'active' => Booking::where('status', 'approved')->count(),
                'completed' => Booking::where('status', 'completed')->count(),
                'cancelled' => Booking::whereIn('status', ['cancelled', 'rejected'])->count(),
            ] : null,
        ]);
    }

    public function approve(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'pending') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only pending bookings can be approved.']);
        }
        $booking->update(['status' => 'approved']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Booking approved.']);
    }

    public function reject(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'pending') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only pending bookings can be rejected.']);
        }
        $booking->update(['status' => 'rejected']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Booking rejected.']);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if (! in_array($booking->status, ['pending', 'approved'])) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only pending or approved bookings can be cancelled.']);
        }
        $booking->update(['status' => 'cancelled']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Booking cancelled.']);
    }

    public function assignDriver(Request $request, Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if (! $booking->need_driver) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This booking did not request a driver.']);
        }
        $validated = $request->validate(['driver_id' => ['required', 'exists:users,id']]);
        $driver = User::where('id', $validated['driver_id'])->where('role', 'driver')->whereHas('driverProfile', fn ($q) => $q->where('availability', 'available'))->firstOrFail();
        BookingDriver::updateOrCreate(['booking_id' => $booking->id], ['driver_id' => $driver->id, 'assigned_by' => $user->id, 'assigned_at' => now(), 'status' => 'assigned']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Driver assigned.']);
    }

    public function markPickedUp(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'paid') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only paid bookings can be marked as picked up.']);
        }
        $booking->update(['status' => 'picked_up']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Vehicle marked as picked up.']);
    }

    public function markReturned(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'picked_up') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only picked up bookings can be marked as returned.']);
        }
        $booking->update(['status' => 'returned']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Vehicle marked as returned.']);
    }
}
