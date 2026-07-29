<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $customerId = auth()->id();

        $activeBookings = Booking::where('customer_id', $customerId)
            ->whereIn('status', ['pending', 'approved', 'paid', 'picked_up'])
            ->count();

        $pastBookings = Booking::where('customer_id', $customerId)
            ->whereIn('status', ['returned', 'completed'])
            ->count();

        $upcomingReturns = Booking::with('car:id,brand,model')
            ->where('customer_id', $customerId)
            ->whereIn('status', ['approved', 'paid', 'picked_up'])
            ->where('return_date', '>=', now()->toDateString())
            ->orderBy('return_date')
            ->limit(5)
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'vehicle' => $booking->car->brand.' '.$booking->car->model,
                'return_date' => $booking->return_date->toDateString(),
            ]);

        return Inertia::render('customer/dashboard', [
            'stats' => [
                'active_bookings' => $activeBookings,
                'past_bookings' => $pastBookings,
                'total_bookings' => $activeBookings + $pastBookings,
                'upcoming_returns' => $upcomingReturns,
            ],
        ]);
    }
}
