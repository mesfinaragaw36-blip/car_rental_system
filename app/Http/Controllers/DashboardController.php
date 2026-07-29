<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\OwnerProfile;
use App\Models\Payment;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        return match ($user->role) {
            'admin' => $this->adminDashboard(),
            'owner' => $this->ownerDashboard(),
            'driver' => $this->driverDashboard(),
            default => $this->customerDashboard(),
        };
    }

    private function adminDashboard(): Response
    {
        return Inertia::render('dashboard', [
            'role' => 'admin',
            'stats' => [
                'total_users' => User::where('role', '!=', 'admin')->orWhere(fn ($q) => $q->where('role', 'admin')->whereNull('staff_role_id'))->count(),
                'active_users' => User::where('status', 'active')->where(fn ($q) => $q->where('role', '!=', 'admin')->orWhere(fn ($q2) => $q2->where('role', 'admin')->whereNull('staff_role_id')))->count(),
                'total_vehicles' => Car::count(),
                'pending_vehicles' => Car::where('approval_status', 'pending')->count(),
                'total_bookings' => Booking::count(),
                'pending_bookings' => Booking::where('status', 'pending')->count(),
                'active_bookings' => Booking::where('status', 'approved')->count(),
                'completed_bookings' => Booking::where('status', 'completed')->count(),
                'total_revenue' => number_format((float) Payment::where('payment_status', 'paid')->sum('amount'), 2),
                'pending_owners' => OwnerProfile::where('verification_status', 'pending')->count(),
                'pending_drivers' => DriverProfile::where('verification_status', 'pending')->count(),
                'total_staff' => User::where('role', 'admin')->whereNotNull('staff_role_id')->count(),
            ],
        ]);
    }

    private function ownerDashboard(): Response
    {
        $ownerId = auth()->id();

        return Inertia::render('dashboard', [
            'role' => 'owner',
            'stats' => [
                'total_vehicles' => Car::where('owner_id', $ownerId)->count(),
                'active_bookings' => Booking::where('owner_id', $ownerId)->whereIn('status', ['approved', 'paid', 'picked_up'])->count(),
                'total_earnings' => number_format((float) Payment::where('payment_status', 'paid')->whereHas('booking', fn ($q) => $q->where('owner_id', $ownerId))->sum('amount'), 2),
            ],
        ]);
    }

    private function customerDashboard(): Response
    {
        $customerId = auth()->id();

        return Inertia::render('dashboard', [
            'role' => 'customer',
            'stats' => [
                'active_bookings' => Booking::where('customer_id', $customerId)->whereIn('status', ['pending', 'approved', 'paid', 'picked_up'])->count(),
                'past_bookings' => Booking::where('customer_id', $customerId)->whereIn('status', ['returned', 'completed'])->count(),
                'upcoming_returns' => Booking::with('car:id,brand,model')->where('customer_id', $customerId)->whereIn('status', ['approved', 'paid', 'picked_up'])->where('return_date', '>=', now()->toDateString())->orderBy('return_date')->limit(5)->get()->map(fn (Booking $booking) => [
                    'id' => $booking->id,
                    'vehicle' => $booking->car->brand.' '.$booking->car->model,
                    'return_date' => $booking->return_date->toDateString(),
                ]),
            ],
        ]);
    }

    private function driverDashboard(): Response
    {
        $driverId = auth()->id();

        $recentAssignments = BookingDriver::with(['booking.customer', 'booking.car'])
            ->where('driver_id', $driverId)
            ->whereIn('status', ['assigned', 'accepted'])
            ->latest('assigned_at')
            ->get()
            ->map(fn (BookingDriver $assignment) => [
                'id' => $assignment->id,
                'status' => $assignment->status,
                'assigned_at' => $assignment->assigned_at?->toDateTimeString(),
                'booking' => [
                    'id' => $assignment->booking->id,
                    'pickup_date' => $assignment->booking->pickup_date->toDateString(),
                    'return_date' => $assignment->booking->return_date->toDateString(),
                    'pickup_location' => $assignment->booking->pickup_location,
                    'return_location' => $assignment->booking->return_location,
                ],
                'customer' => [
                    'name' => $assignment->booking->customer->name,
                    'phone' => $assignment->booking->customer->phone,
                ],
                'car' => [
                    'brand' => $assignment->booking->car->brand,
                    'model' => $assignment->booking->car->model,
                    'year' => $assignment->booking->car->year,
                    'plate_number' => $assignment->booking->car->plate_number,
                ],
            ]);

        return Inertia::render('dashboard', [
            'role' => 'driver',
            'stats' => [
                'pending_assignments' => BookingDriver::where('driver_id', $driverId)->where('status', 'assigned')->count(),
                'active_trips' => BookingDriver::where('driver_id', $driverId)->where('status', 'accepted')->count(),
                'completed_trips' => BookingDriver::where('driver_id', $driverId)->where('status', 'completed')->count(),
            ],
            'recentAssignments' => $recentAssignments,
        ]);
    }
}
