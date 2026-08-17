<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\Location;
use App\Services\DriverMatchingService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BrowseCarController extends Controller
{
    public function __construct(private readonly DriverMatchingService $driverMatching) {}

    public function index(Request $request): Response
    {
        $user = auth()->user();
        $pickupDate = $request->pickup_date;
        $returnDate = $request->return_date;
        $cars = Car::with(['images', 'owner'])
            ->where('approval_status', 'approved')
            ->where('availability_status', 'available')
            ->when($pickupDate && $returnDate, function ($q) use ($pickupDate, $returnDate) {
                $q->whereDoesntHave('bookings', function ($booking) use ($pickupDate, $returnDate) {
                    $booking->whereNotIn('status', Booking::INACTIVE_STATUSES)
                        ->where(function ($overlap) use ($pickupDate, $returnDate) {
                            $overlap->whereBetween('pickup_date', [$pickupDate, $returnDate])
                                ->orWhereBetween('return_date', [$pickupDate, $returnDate])
                                ->orWhere(function ($inside) use ($pickupDate, $returnDate) {
                                    $inside->where('pickup_date', '<=', $pickupDate)
                                        ->where('return_date', '>=', $returnDate);
                                });
                        });
                });
            })
            ->whereHas('availablePeriods', fn ($q) => $q->whereDate('end_date', '>=', now()->toDateString()))
            ->when($request->search, fn ($q, $v) => $q->where(fn ($q2) => $q2->where('brand', 'like', "%{$v}%")->orWhere('model', 'like', "%{$v}%")))
            ->when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->when($request->fuel_type, fn ($q, $v) => $q->where('fuel_type', $v))
            ->when($request->transmission, fn ($q, $v) => $q->where('transmission', $v))
            ->when($request->min_price, fn ($q, $v) => $q->where('daily_price', '>=', $v))
            ->when($request->max_price, fn ($q, $v) => $q->where('daily_price', '<=', $v))
            ->latest()
            ->get()
            ->map(function (Car $car) {
                $hasActiveBooking = $car->bookings()
                    ->whereNotIn('status', Booking::INACTIVE_STATUSES)
                    ->whereDate('return_date', '>=', now()->toDateString())
                    ->exists();

                return array_merge($car->toArray(), [
                    'average_rating' => round($car->reviews()->avg('rating') ?? 0, 1),
                    'review_count' => $car->reviews()->count(),
                    'is_currently_booked' => $hasActiveBooking,
                ]);
            });

        return Inertia::render('browse-cars', [
            'cars' => $cars,
            'role' => $user?->role,
            'verification_status' => $user?->role === 'customer' ? $user?->customerIdentity?->verification_status : null,
            'filters' => $request->only(['search', 'category', 'fuel_type', 'transmission', 'min_price', 'max_price', 'pickup_date', 'return_date']),
        ]);
    }

    public function show(Car $car): Response
    {
        $user = auth()->user();

        if ($car->approval_status !== 'approved' || $car->availability_status !== 'available') {
            if (! $user || ! (($user->role === 'owner' && $car->owner_id === $user->id) || $user->role === 'admin')) {
                abort(404);
            }
        }
        $car->load(['images', 'owner']);

        $recent = $car->reviews()->with('reviewer')->latest()->take(5)->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'reviewer' => ['id' => $r->reviewer->id, 'name' => $r->reviewer->name],
                'rating' => $r->rating,
                'review_text' => $r->review_text,
                'created_at' => $r->created_at->toDateTimeString(),
            ];
        })->toArray();

        $hasActiveBooking = $car->bookings()
            ->whereNotIn('status', Booking::INACTIVE_STATUSES)
            ->whereDate('return_date', '>=', now()->toDateString())
            ->exists();

        return Inertia::render('car-details', [
            'car' => array_merge($car->toArray(), [
                'average_rating' => round($car->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $car->reviews()->count(),
                'recent_reviews' => $recent,
                'is_currently_booked' => $hasActiveBooking,
                'available_periods' => $car->availablePeriods()
                    ->whereDate('end_date', '>=', now()->toDateString())
                    ->orderBy('start_date')
                    ->get(['id', 'start_date', 'end_date'])
                    ->map(fn (CarAvailablePeriod $period) => [
                        'id' => $period->id,
                        'start_date' => $period->start_date->toDateString(),
                        'end_date' => $period->end_date->toDateString(),
                    ]),
            ]),
            'role' => $user?->role,
            'verification_status' => $user?->role === 'customer' ? $user?->customerIdentity?->verification_status : null,
            'locations' => Location::orderBy('name')->get(['id', 'name', 'city']),
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

        $user = auth()->user();
        $identity = $user->customerIdentity;

if (! $identity) {
    return redirect()->route('profile.edit')->with('toast', [
        'type' => 'error',
        'message' => 'Please submit your national ID to complete verification.',
    ]);
}

if ($identity->verification_status === 'rejected') {
    return redirect()->route('profile.edit')->with('toast', [
        'type' => 'error',
        'message' => 'The national ID you entered could not be verified. Please check your ID and try again.',
    ]);
}

if ($identity->verification_status === 'pending') {
    return redirect()->route('profile.edit')->with('toast', [
        'type' => 'error',
        'message' => 'Your national ID is still being verified. Please wait until verification is complete before booking.',
    ]);
}

if ($identity->verification_status !== 'approved') {
    return redirect()->route('profile.edit')->with('toast', [
        'type' => 'error',
        'message' => 'Your identity verification is not complete. Please verify your national ID before booking.',
    ]);
}

        $validated = $request->validate([
            'pickup_date' => ['required', 'date', 'after_or_equal:today'],
            'return_date' => ['required', 'date', 'after:pickup_date'],
            'pickup_branch_id' => ['required', 'exists:locations,id'],
            'return_branch_id' => ['required', 'exists:locations,id'],
            'need_driver' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $pickupBranch = Location::findOrFail($validated['pickup_branch_id']);
        $returnBranch = Location::findOrFail($validated['return_branch_id']);
        $pickupDate = Carbon::parse($validated['pickup_date']);
        $returnDate = Carbon::parse($validated['return_date']);

        $days = $pickupDate->diffInDays($returnDate);

        if ($days < 1) {
            return back()->with('toast', ['type' => 'error', 'message' => 'The rental must be at least one day.']);
        }

        $totalPrice = round($days * $car->daily_price, 2);
        $depositAmount = max(500.0, round($totalPrice * 0.10, 2));
        $estimatedValue = (float) $car->estimated_value;
        $securityDepositAmount = $estimatedValue > 0
            ? max(1000.0, round($estimatedValue * 0.10, 2))
            : max(1000.0, round($totalPrice * 0.20, 2));

        try {
            $booking = DB::transaction(function () use ($car, $validated, $pickupBranch, $returnBranch, $pickupDate, $returnDate, $totalPrice, $depositAmount, $securityDepositAmount) {
                Car::whereKey($car->id)->lockForUpdate()->first();

                $hasOverlap = Booking::where('car_id', $car->id)
                    ->whereNotIn('status', Booking::INACTIVE_STATUSES)
                    ->where(fn ($q) => $q->whereBetween('pickup_date', [$pickupDate, $returnDate])
                        ->orWhereBetween('return_date', [$pickupDate, $returnDate])
                        ->orWhere(fn ($q2) => $q2->where('pickup_date', '<=', $pickupDate)->where('return_date', '>=', $returnDate)))
                    ->exists();

                if ($hasOverlap) {
                    throw new \RuntimeException('overlap');
                }

                $hasBlock = CarAvailablePeriod::where('car_id', $car->id)
                    ->whereDate('start_date', '<=', $pickupDate)
                    ->whereDate('end_date', '>=', $returnDate)
                    ->doesntExist();

                if ($hasBlock) {
                    throw new \RuntimeException('blocked');
                }

                return Booking::create([
                    'customer_id' => auth()->id(),
                    'owner_id' => $car->owner_id,
                    'car_id' => $car->id,
                    'pickup_date' => $validated['pickup_date'],
                    'return_date' => $validated['return_date'],
                    'pickup_branch_id' => $pickupBranch->id,
                    'return_branch_id' => $returnBranch->id,
                    'pickup_location' => $this->branchLabel($pickupBranch),
                    'return_location' => $this->branchLabel($returnBranch),
                    'need_driver' => $validated['need_driver'] ?? false,
                    'total_price' => $totalPrice,
                    'deposit_amount' => $depositAmount,
                    'deposit_hold_until' => now()->addHours(24),
                    'security_deposit_amount' => $securityDepositAmount,
                    'status' => 'confirmed',
                    'notes' => $validated['notes'] ?? null,
                ]);
            });
        } catch (\RuntimeException $exception) {
            if ($exception->getMessage() === 'blocked') {
                return back()->with('toast', ['type' => 'error', 'message' => "The selected dates do not fit within the vehicle's available date ranges."]);
            }

            return back()->with('toast', ['type' => 'error', 'message' => 'The selected dates overlap with an existing booking.']);
        }

        if ($booking->need_driver) {
            $this->driverMatching->assignDriver($booking, $this->driverMatching->bestMatchFor($booking));
        }

        $booking->owner?->notifyNow(
            "New booking #{$booking->id} for your {$car->brand} {$car->model}",
            sprintf(
                'A customer booked your %s %s from %s at %s to %s at %s for ETB %s. The booking is confirmed and awaits the %s%% deposit to lock the dates.',
                $car->brand,
                $car->model,
                $booking->pickup_date->format('M j, Y'),
                $booking->pickup_location,
                $booking->return_date->format('M j, Y'),
                $booking->return_location,
                number_format($booking->total_price, 2),
                '10',
            ),
            'booking_confirmed',
            Booking::class,
            $booking->id,
        );

        return redirect()->route('bookings.index')->with('toast', [
            'type' => 'success',
            'message' => "Booking confirmed! Pay the ETB {$depositAmount} deposit within 24 hours to lock your dates.",
        ]);
    }

    private function branchLabel(Location $location): string
    {
        return trim("{$location->name}, {$location->city}", ', ');
    }
}
