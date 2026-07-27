<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Booking::with(['customer', 'owner', 'car', 'payment'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('customer', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                ->orWhereHas('car', fn ($q) => $q->where('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%"));
        }

        $bookings = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/bookings', [
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'search']),
            'stats' => [
                'total'     => Booking::count(),
                'pending'   => Booking::where('status', 'pending')->count(),
                'active'    => Booking::where('status', 'approved')->count(),
                'completed' => Booking::where('status', 'completed')->count(),
                'cancelled' => Booking::whereIn('status', ['cancelled', 'rejected'])->count(),
            ],
        ]);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        abort_unless(in_array($booking->status, ['pending', 'approved']), 422);

        $booking->update(['status' => 'cancelled']);

        return back()->with('toast', [
            'type'    => 'success',
            'message' => 'Booking cancelled.',
        ]);
    }
}
