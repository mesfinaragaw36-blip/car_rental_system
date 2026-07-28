<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('booking.car', 'booking.customer', 'booking.owner')
            ->latest();

        if ($request->filled('status')) {
            $query->where('payment_status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('booking.customer', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        $payments = $query->paginate(15)->withQueryString();
        $totalRevenue = Payment::where('payment_status', 'paid')->sum('amount');

        return Inertia::render('admin/payments', [
            'payments' => $payments,
            'totalRevenue' => $totalRevenue,
            'filters' => $request->only(['status', 'search']),
        ]);
    }
}
