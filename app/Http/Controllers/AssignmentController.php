<?php

namespace App\Http\Controllers;

use App\Models\BookingDriver;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $query = BookingDriver::with(['booking.customer', 'booking.car'])
            ->whereIn('status', ['assigned', 'accepted', 'completed']);

        if ($user->role !== 'admin') {
            $query->where('driver_id', $user->id);
        }

        $assignments = $query->latest('assigned_at')->get()->map(fn (BookingDriver $assignment) => [
            'id' => $assignment->id,
            'status' => $assignment->status,
            'assigned_at' => $assignment->assigned_at->toDateTimeString(),
            'booking' => [
                'id' => $assignment->booking->id,
                'pickup_date' => $assignment->booking->pickup_date->toDateString(),
                'return_date' => $assignment->booking->return_date->toDateString(),
                'pickup_location' => $assignment->booking->pickup_location,
                'return_location' => $assignment->booking->return_location,
                'status' => $assignment->booking->status,
            ],
            'customer' => [
                'name' => $assignment->booking->customer?->name,
                'phone' => $assignment->booking->customer?->phone,
            ],
            'car' => [
                'brand' => $assignment->booking->car->brand,
                'model' => $assignment->booking->car->model,
                'year' => $assignment->booking->car->year,
                'plate_number' => $assignment->booking->car->plate_number,
            ],
        ]);

        return Inertia::render('assignments', [
            'role' => $user->role,
            'assignments' => $assignments,
        ]);
    }

    public function accept(BookingDriver $assignment): RedirectResponse
    {
        $user = auth()->user();
        if ($assignment->driver_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($assignment->status !== 'assigned') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only pending assignments can be accepted.']);
        }
        $assignment->update(['status' => 'accepted']);

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
