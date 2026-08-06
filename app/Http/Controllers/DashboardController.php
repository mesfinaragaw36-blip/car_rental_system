<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\OwnerProfile;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
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
        $commissionRate = config('commission.rate', 10);

        $paidPayments = Payment::where('payment_status', 'paid');
        $totalRevenue = (float) (clone $paidPayments)->sum('amount');
        $totalCommission = round($totalRevenue * $commissionRate / 100, 2);

        $dateFormat = DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', paid_at)"
            : "DATE_FORMAT(paid_at, '%Y-%m')";

        $monthlyPaid = (clone $paidPayments)
            ->selectRaw("{$dateFormat} as month, SUM(amount) as revenue")
            ->whereNotNull('paid_at')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthlyData = $monthlyPaid->map(fn ($m) => [
            'month' => $m->month,
            'revenue' => round((float) $m->revenue, 2),
            'commission' => round((float) $m->revenue * $commissionRate / 100, 2),
        ]);

        return Inertia::render('dashboard', [
            'role' => 'admin',
            'stats' => [
                'total_users' => User::where('role', '!=', 'admin')->orWhere(fn ($q) => $q->where('role', 'admin')->whereNull('staff_role_id'))->count(),
                'active_users' => User::where('status', 'active')->where(fn ($q) => $q->where('role', '!=', 'admin')->orWhere(fn ($q2) => $q2->where('role', 'admin')->whereNull('staff_role_id')))->count(),
                'total_vehicles' => Car::count(),
                'pending_vehicles' => Car::where('approval_status', 'pending')->count(),
                'total_bookings' => Booking::count(),
                'pending_bookings' => Booking::where('status', 'confirmed')->count(),
                'active_bookings' => Booking::whereIn('status', ['deposit_paid', 'paid', 'picked_up'])->count(),
                'completed_bookings' => Booking::where('status', 'completed')->count(),
                'total_revenue' => number_format($totalRevenue, 2),
                'total_commission' => number_format($totalCommission, 2),
                'commission_rate' => $commissionRate,
                'pending_owners' => OwnerProfile::where('verification_status', 'pending')->count(),
                'pending_drivers' => DriverProfile::where('verification_status', 'pending')->count(),
                'total_staff' => User::where('role', 'admin')->whereNotNull('staff_role_id')->count(),
            ],
            'monthlyData' => $monthlyData,
        ]);
    }

    private function ownerDashboard(): Response
    {
        $ownerId = auth()->id();

        $vehicles = Car::where('owner_id', $ownerId);

        $dateFormat = DB::getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', paid_at)"
            : "DATE_FORMAT(paid_at, '%Y-%m')";

        $monthlyData = Payment::where('payment_status', 'paid')
            ->whereHas('booking', fn ($q) => $q->where('owner_id', $ownerId))
            ->whereNotNull('paid_at')
            ->selectRaw("{$dateFormat} as month, SUM(amount) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'revenue' => round((float) $row->revenue, 2),
                'commission' => 0,
            ]);

        $recentBookings = Booking::with('car:id,brand,model', 'customer:id,name')
            ->where('owner_id', $ownerId)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Booking $b) => [
                'id' => $b->id,
                'status' => $b->status,
                'pickup_date' => $b->pickup_date->toDateString(),
                'customer' => $b->customer ? ['name' => $b->customer->name] : null,
                'car' => $b->car ? ['brand' => $b->car->brand, 'model' => $b->car->model] : null,
            ]);

        return Inertia::render('dashboard', [
            'role' => 'owner',
            'stats' => [
                'total_vehicles' => $vehicles->count(),
                'active_bookings' => Booking::where('owner_id', $ownerId)->whereIn('status', ['deposit_paid', 'paid', 'picked_up'])->count(),
                'pending_bookings' => Booking::where('owner_id', $ownerId)->where('status', 'confirmed')->count(),
                'total_earnings' => number_format((float) Payment::where('payment_status', 'paid')->whereHas('booking', fn ($q) => $q->where('owner_id', $ownerId))->sum('amount'), 2),
                'available_vehicles' => (clone $vehicles)->where('availability_status', 'available')->count(),
                'rented_vehicles' => (clone $vehicles)->where('availability_status', 'rented')->count(),
                'pending_vehicles' => (clone $vehicles)->where('approval_status', 'pending')->count(),
            ],
            'monthlyData' => $monthlyData,
            'recentBookings' => $recentBookings,
        ]);
    }

    private function customerDashboard(): Response
    {
        $customerId = auth()->id();

        return Inertia::render('dashboard', [
            'role' => 'customer',
            'stats' => [
                'active_bookings' => Booking::where('customer_id', $customerId)->whereIn('status', ['confirmed', 'deposit_paid', 'paid', 'picked_up'])->count(),
                'past_bookings' => Booking::where('customer_id', $customerId)->whereIn('status', ['returned', 'completed'])->count(),
                'upcoming_returns' => Booking::with('car:id,brand,model')->where('customer_id', $customerId)->whereIn('status', ['deposit_paid', 'paid', 'picked_up'])->where('return_date', '>=', now()->toDateString())->orderBy('return_date')->limit(5)->get()->map(fn (Booking $booking) => [
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
