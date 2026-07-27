<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with('booking.car', 'booking.customer', 'booking.owner')
            ->latest()
            ->get();

        $totalRevenue = Payment::where('payment_status', 'paid')
            ->sum('amount');

        return Inertia::render('admin/payments', [
            'payments' => $payments,
            'totalRevenue' => $totalRevenue,
        ]);
    }
}