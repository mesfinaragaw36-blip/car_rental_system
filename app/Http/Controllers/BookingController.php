<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\Inspection;
use App\Models\Review;
use App\Models\User;
use App\Services\BookingCompletionService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(private readonly BookingCompletionService $completion) {}

    public function index(Request $request): Response
    {
        $user = auth()->user();

        $query = Booking::with(['customer', 'owner', 'car', 'payments', 'driverAssignment.driver']);

        if ($user->role === 'admin') {
            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }
            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->whereHas('customer', fn ($q2) => $q2->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('car', fn ($q2) => $q2->where('brand', 'like', "%{$search}%")->orWhere('model', 'like', "%{$search}%"));
                });
            }
        } elseif ($user->role === 'owner') {
            $query->where('owner_id', $user->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        $bookings = $query->latest()->paginate(15)->withQueryString();

        $bookings->getCollection()->transform(function ($booking) use ($user) {
            if ($user->role !== 'admin' && $user->id !== $booking->customer_id && $booking->customer) {
                unset($booking->customer->email);
            }

            return $booking;
        });

        return Inertia::render('bookings', [
            'role' => $user->role,
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'search']),
            'stats' => $user->role === 'admin' ? [
                'total' => Booking::count(),
                'pending' => Booking::where('status', 'pending')->count(),
                'active' => Booking::where('status', 'approved')->count(),
                'completed' => Booking::where('status', 'completed')->count(),
                'cancelled' => Booking::whereIn('status', ['cancelled', 'rejected'])->count(),
            ] : null,
        ]);
    }

    public function show(Booking $booking): Response
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $booking->load(['customer', 'owner', 'car', 'payments', 'driverAssignment.driver', 'driverAssignment.driver:id,name,phone', 'reviews.reviewer', 'inspections.conductedBy:id,name']);

        $userReviews = Review::where('booking_id', $booking->id)
            ->where('reviewer_id', $user->id)
            ->get();

        $reviewed = [
            'car' => false,
            'owner' => false,
            'driver' => false,
            'customer' => false,
        ];

        foreach ($userReviews as $review) {
            if ($review->reviewable_type === Car::class) {
                $reviewed['car'] = true;
            }

            if ($review->reviewable_type === User::class) {
                if ($review->reviewable_id === $booking->owner_id) {
                    $reviewed['owner'] = true;
                }
                if ($review->reviewable_id === $booking->driverAssignment?->driver_id) {
                    $reviewed['driver'] = true;
                }
                if ($review->reviewable_id === $booking->customer_id) {
                    $reviewed['customer'] = true;
                }
            }
        }

        $reviewTargets = [];

        if (in_array($booking->status, ['returned', 'completed'], true)) {
            if ($user->role === 'customer') {
                $reviewTargets[] = [
                    'key' => 'car',
                    'label' => 'Vehicle',
                    'type' => 'car',
                    'id' => $booking->car->id,
                    'name' => $booking->car->brand.' '.$booking->car->model,
                    'alreadyReviewed' => $reviewed['car'],
                ];

                $reviewTargets[] = [
                    'key' => 'owner',
                    'label' => 'Owner',
                    'type' => 'user',
                    'id' => $booking->owner->id,
                    'name' => $booking->owner->name,
                    'alreadyReviewed' => $reviewed['owner'],
                ];

                if ($booking->driverAssignment?->driver) {
                    $reviewTargets[] = [
                        'key' => 'driver',
                        'label' => 'Driver',
                        'type' => 'user',
                        'id' => $booking->driverAssignment->driver->id,
                        'name' => $booking->driverAssignment->driver->name,
                        'alreadyReviewed' => $reviewed['driver'],
                    ];
                }
            }

            // Only customers may submit reviews for cars, owners, and drivers tied to their booking.
        }

        $days = max(1, Carbon::parse($booking->pickup_date)->diffInDays(Carbon::parse($booking->return_date))
        );

        $reviewList = $booking->reviews->map(function (Review $review) use ($booking) {
            $targetName = $review->reviewable_type === Car::class
                ? $booking->car->brand.' '.$booking->car->model
                : match ($review->reviewable_id) {
                    $booking->owner_id => $booking->owner->name,
                    $booking->driverAssignment?->driver_id => $booking->driverAssignment->driver->name,
                    $booking->customer_id => $booking->customer->name,
                    default => 'Unknown',
                };

            return [
                'id' => $review->id,
                'reviewer' => ['id' => $review->reviewer->id, 'name' => $review->reviewer->name],
                'target' => $review->reviewable_type === Car::class ? 'Vehicle' : $targetName,
                'rating' => $review->rating,
                'review_text' => $review->review_text,
            ];
        })->toArray();

        return Inertia::render('booking-details', [
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,
                'pickup_date' => $booking->pickup_date->toDateTimeString(),
                'return_date' => $booking->return_date->toDateTimeString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'total_price' => $booking->total_price,
                'need_driver' => $booking->need_driver,
                'notes' => $booking->notes,
                'days' => $days,
                'daily_rate' => $days > 0 ? number_format($booking->total_price / $days, 2) : '0.00',
                'customer' => $booking->customer ? $this->customerPayload($booking, $user) : null,
                'owner' => $booking->owner ? ['id' => $booking->owner->id, 'name' => $booking->owner->name, 'phone' => $booking->owner->phone] : null,
                'car' => ['id' => $booking->car->id, 'brand' => $booking->car->brand, 'model' => $booking->car->model, 'year' => $booking->car->year, 'plate_number' => $booking->car->plate_number],
                'payment' => $booking->payment,
                'driver' => $booking->driverAssignment?->driver ? ['id' => $booking->driverAssignment->driver->id, 'name' => $booking->driverAssignment->driver->name, 'phone' => $booking->driverAssignment->driver->phone] : null,
                'driver_status' => $booking->driverAssignment?->status,
                'pickup_inspection_approved' => $booking->hasApprovedInspection(Inspection::TYPE_PICKUP),
                'picked_up_at' => $booking->picked_up_at?->toDateTimeString(),
                'returned_at' => $booking->returned_at?->toDateTimeString(),
                'inspections' => $booking->inspections
                    ->map(fn ($inspection) => [
                        'id' => $inspection->id,
                        'type' => $inspection->type,
                        'status' => $inspection->status,
                        'conducted_at' => $inspection->conducted_at?->toDateTimeString(),
                        'conducted_by_name' => $inspection->conductedBy?->name,
                        'mileage_reading' => $inspection->mileage_reading,
                        'fuel_level' => $inspection->fuel_level,
                        'damages' => $inspection->damages,
                        'notes' => $inspection->notes,
                    ])
                    ->values(),
                'reviewed' => $reviewed,
                'review_targets' => $reviewTargets,
                'can_review' => count($reviewTargets) > 0,
                'reviews' => $reviewList,
                'late_days' => $booking->late_days,
                'late_fee' => $booking->late_fee,
                'additional_charge' => $booking->late_fee > $booking->securityDepositAmount()
    ? $booking->late_fee - $booking->securityDepositAmount()
    : 0,
                'security_deposit' => $booking->securityDepositAmount(),
                'late_fee_deduction' => min(
                    (float) $booking->late_fee,
                    $booking->securityDepositAmount()
                ),
                'extra_charge' => max(
                    0,
                    (float) $booking->late_fee - $booking->securityDepositAmount()
                ),
            ],
            'role' => $user->role,
        ]);
    }

    private function customerPayload(Booking $booking, User $user): array
    {
        $payload = [
            'id' => $booking->customer->id,
            'name' => $booking->customer->name,
            'phone' => $booking->customer->phone,
        ];

        if ($user->role === 'admin' || $user->id === $booking->customer_id) {
            $payload['email'] = $booking->customer->email;
        }

        return $payload;
    }

    public function approve(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'pending') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only pending bookings can be approved.']);
        }
        $booking->update(['status' => 'approved']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Booking approved.']);
    }

    public function reject(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'pending') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only pending bookings can be rejected.']);
        }
        $booking->update(['status' => 'rejected']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Booking rejected.']);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->customer_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if (! in_array($booking->status, ['pending', 'approved'])) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only pending or approved bookings can be cancelled.']);
        }
        $booking->update(['status' => 'cancelled']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Booking cancelled.']);
    }

    public function assignDriver(Request $request, Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if (! $booking->need_driver) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This booking did not request a driver.']);
        }
        $validated = $request->validate(['driver_id' => ['required', 'exists:users,id']]);
        $driver = User::where('id', $validated['driver_id'])->where('role', 'driver')->whereHas('driverProfile', fn ($q) => $q->where('availability', 'available'))->firstOrFail();
        BookingDriver::updateOrCreate(['booking_id' => $booking->id], ['driver_id' => $driver->id, 'assigned_by' => $user->id, 'assigned_at' => now(), 'status' => 'assigned']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Driver assigned.']);
    }

    public function markPickedUp(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'paid') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only paid bookings can be marked as picked up.']);
        }
        // Check pre-pickup inspection before allowing pickup
        $inspection = $booking->inspection;

        if (! $inspection || $inspection->status !== 'approved') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Vehicle cannot be picked up until the pre-pickup inspection is passed.',
            ]);

        }
        $booking->update([
            'status' => 'picked_up',
            'picked_up_at' => now(),
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Vehicle marked as picked up.']);
    }

    public function markReturned(Booking $booking): RedirectResponse
    {
        $user = auth()->user();
        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        if ($booking->status !== 'picked_up') {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only picked up bookings can be marked as returned.']);
        }
        $booking->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        $booking->completeDriverTrips();

        return back()->with('toast', ['type' => 'success', 'message' => 'Vehicle marked as returned.']);
    }

    public function complete(Booking $booking): RedirectResponse
    {
        $user = auth()->user();

        if ($booking->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($booking->status !== 'returned') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only returned bookings can be completed.',
            ]);
        }

        $this->completion->complete($booking);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking completed.',
        ]);
    }
}
