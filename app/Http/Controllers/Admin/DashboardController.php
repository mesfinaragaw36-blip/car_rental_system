<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Payment;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::count();
        $totalVehicles = Car::count();
        $pendingVehicles = Car::where('approval_status', 'pending')->count();
        $totalBookings = Booking::count();
        $totalRevenue = Payment::where('payment_status', 'paid')->sum('amount');

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => $totalUsers,
                'total_vehicles' => $totalVehicles,
                'pending_vehicles' => $pendingVehicles,
                'total_bookings' => $totalBookings,
                'total_revenue' => number_format((float) $totalRevenue, 2),
            ],
        ]);
    }
}
