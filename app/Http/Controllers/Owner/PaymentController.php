<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::whereHas('booking', function ($query) {
            $query->where('owner_id', auth()->id());
        })
        ->with('booking.car', 'booking.customer')
        ->latest()
        ->get();

        return Inertia::render('owner/payment-history', [
            'payments' => $payments,
        ]);
    }
}