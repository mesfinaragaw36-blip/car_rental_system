<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarTypeName;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrowseCarController extends Controller
{
    public function index(Request $request): Response
    {
        $cars = Car::with(['images', 'owner', 'carTypeName'])
            ->where('approval_status', 'approved')
            ->where('availability_status', 'available')
            ->when($request->search, fn ($q, $v) => $q->where(fn ($q2) => $q2->where('brand', 'like', "%{$v}%")->orWhere('model', 'like', "%{$v}%")))
            ->when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->when($request->fuel_type, fn ($q, $v) => $q->where('fuel_type', $v))
            ->when($request->transmission, fn ($q, $v) => $q->where('transmission', $v))
            ->when($request->min_price, fn ($q, $v) => $q->where('daily_price', '>=', $v))
            ->when($request->max_price, fn ($q, $v) => $q->where('daily_price', '<=', $v))
            ->latest()
            ->get()
            ->map(fn (Car $car) => array_merge($car->toArray(), [
                'average_rating' => round($car->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $car->reviews()->count(),
            ]));

        return Inertia::render('browse-cars', [
            'cars' => $cars,
            'carTypeNames' => CarTypeName::orderBy('name')->get(['id', 'name']),
            'role' => auth()->user()->role,
            'filters' => $request->only(['search', 'category', 'fuel_type', 'transmission', 'min_price', 'max_price']),
        ]);
    }

    public function show(Car $car): Response
    {
        $user = auth()->user();

        if ($car->approval_status !== 'approved' || $car->availability_status !== 'available') {
            if (! ($user->role === 'owner' && $car->owner_id === $user->id) && $user->role !== 'admin') {
                abort(404);
            }
        }

        $car->load(['images', 'owner', 'carTypeName']);

        $recent = $car->reviews()->with('reviewer')->latest()->take(5)->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'reviewer' => ['id' => $r->reviewer->id, 'name' => $r->reviewer->name],
                'rating' => $r->rating,
                'review_text' => $r->review_text,
                'created_at' => $r->created_at->toDateTimeString(),
            ];
        })->toArray();

        return Inertia::render('car-details', [
            'car' => array_merge($car->toArray(), [
                'average_rating' => round($car->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $car->reviews()->count(),
                'recent_reviews' => $recent,
            ]),
            'role' => auth()->user()->role,
        ]);
    }

    public function book(Request $request, Car $car): RedirectResponse
    {
        if ($car->approval_status !== 'approved' || $car->availability_status !== 'available') {
            abort(404);
        }
        if ($car->owner_id === auth()->id()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'You cannot book your own vehicle.']);
        }

        $validated = $request->validate([
            'pickup_date' => ['required', 'date', 'after_or_equal:today'],
            'return_date' => ['required', 'date', 'after:pickup_date'],
            'pickup_location' => ['required', 'string', 'max:255'],
            'return_location' => ['required', 'string', 'max:255'],
            'need_driver' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $pickupDate = Carbon::parse($validated['pickup_date']);
        $returnDate = Carbon::parse($validated['return_date']);

        $hasOverlap = Booking::where('car_id', $car->id)
            ->whereNotIn('status', ['rejected', 'cancelled'])
            ->where(fn ($q) => $q->whereBetween('pickup_date', [$pickupDate, $returnDate])
                ->orWhereBetween('return_date', [$pickupDate, $returnDate])
                ->orWhere(fn ($q2) => $q2->where('pickup_date', '<=', $pickupDate)->where('return_date', '>=', $returnDate)))
            ->exists();

        if ($hasOverlap) {
            return back()->with('toast', ['type' => 'error', 'message' => 'The selected dates overlap with an existing booking.']);
        }

        $days = $pickupDate->diffInDays($returnDate);
        $totalPrice = $days * $car->daily_price;

        Booking::create([
            'customer_id' => auth()->id(),
            'owner_id' => $car->owner_id,
            'car_id' => $car->id,
            'pickup_date' => $validated['pickup_date'],
            'return_date' => $validated['return_date'],
            'pickup_location' => $validated['pickup_location'],
            'return_location' => $validated['return_location'],
            'need_driver' => $validated['need_driver'] ?? false,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('bookings.index')->with('toast', [
            'type' => 'success',
            'message' => 'Booking request submitted! The owner will review it shortly.',
        ]);
    }
}
