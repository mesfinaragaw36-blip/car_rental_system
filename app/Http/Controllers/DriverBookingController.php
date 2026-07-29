<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverBookingController extends Controller
{
    public function available(Request $request): Response
    {
        $driver = auth()->user();
        $profile = $driver->driverProfile;

        $isVerified = $profile && $profile->verification_status === 'approved';
        $hasProfile = $profile !== null;

        $bookings = [];
        if ($isVerified) {
            $query = Booking::with(['car.images', 'customer', 'owner'])
                ->where('need_driver', true)
                ->where('status', 'approved')
                ->whereDoesntHave('driverAssignment', fn ($q) => $q->whereIn('status', ['claimed', 'assigned', 'accepted']));

            if ($request->filled('location')) {
                $query->where(function ($q) use ($request) {
                    $loc = $request->input('location');
                    $q->where('pickup_location', 'like', "%{$loc}%")
                        ->orWhere('return_location', 'like', "%{$loc}%");
                });
            }

            if ($request->filled('date')) {
                $query->where('pickup_date', '<=', $request->input('date'))
                    ->where('return_date', '>=', $request->input('date'));
            }

            $bookings = $query->latest()->get()->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'pickup_date' => $booking->pickup_date->toDateString(),
                'return_date' => $booking->return_date->toDateString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'daily_price' => $booking->car->daily_price,
                'driver_daily_rate' => $profile?->daily_rate ?? 0,
                'total_price' => $booking->total_price,
                'notes' => $booking->notes,
                'car' => [
                    'id' => $booking->car->id,
                    'brand' => $booking->car->brand,
                    'model' => $booking->car->model,
                    'year' => $booking->car->year,
                    'plate_number' => $booking->car->plate_number,
                    'photo' => $booking->car->images->first()?->image_path ?? $booking->car->photo,
                ],
                'owner' => [
                    'id' => $booking->owner?->id,
                    'name' => $booking->owner?->name,
                    'phone' => $booking->owner?->phone,
                ],
                'customer' => [
                    'id' => $booking->customer?->id,
                    'name' => $booking->customer?->name,
                    'phone' => $booking->customer?->phone,
                ],
                'booking_status' => $booking->status,
            ]);
        }

        return Inertia::render('driver/available-bookings', [
            'bookings' => $bookings,
            'filters' => $request->only(['location', 'date']),
            'profileStatus' => $profile?->verification_status ?? 'none',
            'hasProfile' => $hasProfile,
        ]);
    }

    public function claim(Booking $booking): RedirectResponse
    {
        $driver = auth()->user();
        $profile = $driver->driverProfile;

        if (! $profile) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Complete your driver profile before claiming a trip.']);
        }

        if ($profile->verification_status !== 'approved') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Your driver account must be verified before claiming trips.']);
        }

        if ($profile->availability !== 'available') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Set your availability to Available before claiming.']);
        }

        if (! $booking->need_driver) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This booking did not request a driver.']);
        }

        if ($booking->status !== 'approved') {
            return back()->with('toast', ['type' => 'error', 'message' => 'This booking is not available.']);
        }

        $existing = BookingDriver::where('booking_id', $booking->id)
            ->whereIn('status', ['claimed', 'assigned', 'accepted'])
            ->exists();

        if ($existing) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This trip has already been claimed by another driver.']);
        }

        BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $driver->id,
            'assigned_at' => now(),
            'status' => BookingDriver::STATUS_CLAIMED,
        ]);

        return redirect()->route('assignments.index')->with('toast', [
            'type' => 'success',
            'message' => 'Trip claimed! Waiting for owner approval.',
        ]);
    }

    public function history(): Response
    {
        $assignments = BookingDriver::with(['booking.car', 'booking.customer', 'booking.owner'])
            ->where('driver_id', auth()->id())
            ->whereIn('status', ['completed', 'rejected'])
            ->latest('assigned_at')
            ->get()
            ->map(fn (BookingDriver $a) => [
                'id' => $a->id,
                'status' => $a->status,
                'assigned_at' => $a->assigned_at->toDateTimeString(),
                'booking' => [
                    'pickup_date' => $a->booking->pickup_date->toDateString(),
                    'return_date' => $a->booking->return_date->toDateString(),
                    'pickup_location' => $a->booking->pickup_location,
                    'return_location' => $a->booking->return_location,
                ],
                'car' => [
                    'brand' => $a->booking->car->brand,
                    'model' => $a->booking->car->model,
                    'year' => $a->booking->car->year,
                    'plate_number' => $a->booking->car->plate_number,
                ],
                'customer' => ['name' => $a->booking->customer?->name],
            ]);

        return Inertia::render('driver/trip-history', [
            'assignments' => $assignments,
        ]);
    }
}
