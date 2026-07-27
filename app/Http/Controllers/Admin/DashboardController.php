<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\OwnerProfile;
use App\Models\Payment;
use App\Models\User;
use App\Models\Role;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::where('role', '!=', 'admin')->orWhere(fn ($q) => $q->where('role', 'admin')->whereNull('staff_role_id'))->count();
        $totalVehicles = Car::count();
        $pendingVehicles = Car::where('approval_status', 'pending')->count();
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $activeBookings = Booking::where('status', 'approved')->count();
        $completedBookings = Booking::where('status', 'completed')->count();
        $totalRevenue = Payment::where('payment_status', 'paid')->sum('amount');
        $pendingOwners = OwnerProfile::where('verification_status', 'pending')->count();
        $pendingDrivers = DriverProfile::where('verification_status', 'pending')->count();
        $totalStaff = User::where('role', 'admin')->whereNotNull('staff_role_id')->count();
        $activeUsers = User::where('status', 'active')->where(fn ($q) => $q->where('role', '!=', 'admin')->orWhere(fn ($q2) => $q2->where('role', 'admin')->whereNull('staff_role_id')))->count();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users'        => $totalUsers,
                'active_users'       => $activeUsers,
                'total_vehicles'     => $totalVehicles,
                'pending_vehicles'   => $pendingVehicles,
                'total_bookings'     => $totalBookings,
                'pending_bookings'   => $pendingBookings,
                'active_bookings'    => $activeBookings,
                'completed_bookings' => $completedBookings,
                'total_revenue'      => number_format((float) $totalRevenue, 2),
                'pending_owners'     => $pendingOwners,
                'pending_drivers'    => $pendingDrivers,
                'total_staff'        => $totalStaff,
            ],
        ]);
    }
}
