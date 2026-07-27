<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Payment;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $ownerId = auth()->id();

        $totalVehicles = Car::where('owner_id', $ownerId)->count();

        $activeBookings = Booking::where('owner_id', $ownerId)
            ->whereIn('status', ['approved', 'paid', 'picked_up'])
            ->count();

        $totalEarnings = Payment::where('payment_status', 'paid')
            ->whereHas('booking', fn ($q) => $q->where('owner_id', $ownerId))
            ->sum('amount');

        return Inertia::render('owner/dashboard', [
            'stats' => [
                'total_vehicles' => $totalVehicles,
                'active_bookings' => $activeBookings,
                'total_earnings' => number_format((float) $totalEarnings, 2),
            ],
        ]);
    }
}
