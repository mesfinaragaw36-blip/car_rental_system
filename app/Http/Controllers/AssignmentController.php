<?php

namespace App\Http\Controllers;

use App\Models\BookingDriver;
use App\Services\DriverMatchingService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function __construct(private readonly DriverMatchingService $driverMatching) {}

    public function index(): Response
    {
        $user = auth()->user();

        if ($user->role === 'admin' || $user->role === 'owner') {
            $query = BookingDriver::with(['booking.customer', 'booking.car', 'driver:id,name,phone'])
                ->whereIn('status', ['assigned', 'accepted', 'completed']);

            if ($user->role === 'owner') {
                $query->whereHas('booking', fn ($q) => $q->where('owner_id', $user->id));
            }

            $assignments = $query->latest('assigned_at')->get()->map(fn (BookingDriver $a) => [
                'id' => $a->id,
                'status' => $a->status,
                'assigned_at' => $a->assigned_at->toDateTimeString(),
                'booking' => [
                    'id' => $a->booking->id,
                    'pickup_date' => $a->booking->pickup_date->toDateString(),
                    'return_date' => $a->booking->return_date->toDateString(),
                    'pickup_location' => $a->booking->pickup_location,
                    'return_location' => $a->booking->return_location,
                    'status' => $a->booking->status,
                ],
                'customer' => ['name' => $a->booking->customer?->name, 'phone' => $a->booking->customer?->phone],
                'car' => ['brand' => $a->booking->car->brand, 'model' => $a->booking->car->model, 'year' => $a->booking->car->year, 'plate_number' => $a->booking->car->plate_number],
                'driver' => $a->driver ? ['id' => $a->driver->id, 'name' => $a->driver->name, 'phone' => $a->driver->phone] : null,
            ]);
        } else {
            $query = BookingDriver::with(['booking.customer', 'booking.car'])
                ->where('driver_id', $user->id)
                ->whereIn('status', ['assigned', 'accepted', 'completed', 'rejected']);

            $assignments = $query->latest('assigned_at')->get()->map(fn (BookingDriver $a) => [
                'id' => $a->id,
                'status' => $a->status,
                'assigned_at' => $a->assigned_at->toDateTimeString(),
                'booking' => [
                    'id' => $a->booking->id,
                    'pickup_date' => $a->booking->pickup_date->toDateString(),
                    'return_date' => $a->booking->return_date->toDateString(),
                    'pickup_location' => $a->booking->pickup_location,
                    'return_location' => $a->booking->return_location,
                    'status' => $a->booking->status,
                ],
                'customer' => ['name' => $a->booking->customer?->name, 'phone' => $a->booking->customer?->phone],
                'car' => ['brand' => $a->booking->car->brand, 'model' => $a->booking->car->model, 'year' => $a->booking->car->year, 'plate_number' => $a->booking->car->plate_number],
            ]);
        }

        return Inertia::render('assignments', [
            'role' => $user->role,
            'assignments' => $assignments,
            'driverVerificationStatus' => $user->role === 'driver'
                ? ($user->driverProfile?->verification_status ?? 'none')
                : null,
        ]);
    }

    public function reject(BookingDriver $assignment): RedirectResponse
    {
        $user = auth()->user();
        if ($assignment->driver_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($assignment->status !== 'assigned') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only assigned trips can be rejected.']);
        }
        $assignment->update(['status' => 'rejected']);

        $booking = $assignment->booking;
        $needsChauffeur = $booking->need_driver && ! in_array($booking->status, ['rejected', 'cancelled', 'returned', 'completed'], true);

        if ($needsChauffeur) {
            $nextDriver = $this->driverMatching->bestMatchFor($booking, $this->driverMatching->alreadyTriedDriverIds($booking));

            if ($nextDriver === null) {
                $this->driverMatching->escalateToAdmin($booking);

                return back()->with('toast', ['type' => 'success', 'message' => 'Assignment rejected. No other chauffeur is available - admin has been notified.']);
            }

            $this->driverMatching->assignDriver($booking, $nextDriver);

            return back()->with('toast', ['type' => 'success', 'message' => 'Assignment rejected. Another chauffeur has been assigned.']);
        }

        return back()->with('toast', ['type' => 'success', 'message' => 'Assignment rejected.']);
    }

    public function accept(BookingDriver $assignment): RedirectResponse
    {
        $user = auth()->user();
        if ($assignment->driver_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($assignment->status !== 'assigned') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only assigned trips can be accepted.']);
        }
        $assignment->update(['status' => 'accepted']);

        $booking = $assignment->booking;

        if ($booking->need_driver) {
            $days = Carbon::parse($booking->pickup_date)->diffInDays(Carbon::parse($booking->return_date));
            $driverRate = $assignment->driver?->driverProfile?->daily_rate ?? config('driver.daily_fee', 0);

            $booking->update([
                'total_price' => round(($booking->car->daily_price + $driverRate) * $days, 2),
            ]);
        }

        return redirect()->route('dashboard')->with('toast', ['type' => 'success', 'message' => 'Assignment accepted.']);
    }

    public function complete(BookingDriver $assignment): RedirectResponse
    {
        $user = auth()->user();
        if ($assignment->driver_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($assignment->status !== 'accepted') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only active trips can be completed.']);
        }
        $assignment->update(['status' => 'completed']);
        $booking = $assignment->booking;
        if ($booking->status === 'picked_up') {
            $booking->update(['status' => 'returned']);
        }

        return back()->with('toast', ['type' => 'success', 'message' => 'Trip completed.']);
    }
}
