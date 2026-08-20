<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\Inspection;
use App\Models\Payment;
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
    public function __construct(
        private readonly BookingCompletionService $completion
    ) {}

    public function index(Request $request): Response
    {
        $user = auth()->user();

        $query = Booking::with([
            'customer',
            'owner',
            'car.images',
            'payments',
            'driverAssignment.driver',
        ]);

        if ($user->role === 'admin') {
            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }

            if ($request->filled('search')) {
                $search = $request->input('search');

                $query->where(function ($q) use ($search) {
                    $q->whereHas('customer', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    })->orWhereHas('car', function ($q2) use ($search) {
                        $q2->where('brand', 'like', "%{$search}%")
                            ->orWhere('model', 'like', "%{$search}%");
                    });
                });
            }
        } elseif ($user->role === 'owner') {
            $query->where('owner_id', $user->id);
        } else {
            $query->where('customer_id', $user->id);
        }

        $bookings = $query
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $bookings->getCollection()->transform(function ($booking) use ($user) {
            $booking->has_dispute = $booking->disputes()
                ->where('type', 'owner_no_show')
                ->exists();

            $identity = $user->customerIdentity;

            $booking->identity_approved =
                $user->role !== 'customer'
                || ($identity !== null && $identity->isApproved());

            $booking->identity_status =
                $user->role === 'customer'
                    ? $identity?->verification_status
                    : null;

            if (
                $user->role !== 'admin'
                && $user->id !== $booking->customer_id
                && $booking->customer
            ) {
                unset($booking->customer->email);
            }

            return $booking;
        });

        return Inertia::render('bookings', [
            'role' => $user->role,
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'search']),
            'stats' => $user->role === 'admin'
                ? [
                    'total' => Booking::count(),
                    'pending' => Booking::where('status', 'pending')->count(),
                    'active' => Booking::where('status', 'approved')->count(),
                    'completed' => Booking::where('status', 'completed')->count(),
                    'cancelled' => Booking::whereIn(
                        'status',
                        ['cancelled', 'rejected']
                    )->count(),
                ]
                : null,
        ]);
    }

    public function show(Booking $booking): Response
    {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id
            && $booking->owner_id !== $user->id
            && $user->role !== 'admin'
        ) {
            abort(403);
        }

        $booking->load([
            'customer',
            'owner',
            'car',
            'payments',
            'refunds',
            'driverAssignment.driver.driverProfile',
            'driverAssignment.driver.reviews',
            'reviews.reviewer',
            'inspections.conductedBy:id,name',
            'inspections.idVerifiedBy:id,name',
            'disputes',
            'ownerPayout',
        ]);

        $userReviews = Review::where('booking_id', $booking->id)
            ->where('reviewer_id', $user->id)
            ->get();

        $reviewed = [
            'car' => false,
            'driver' => false,
        ];

        foreach ($userReviews as $review) {
            if ($review->reviewable_type === Car::class) {
                $reviewed['car'] = true;
            }

            if (
                $review->reviewable_type === User::class
                && $review->reviewable_id
                === $booking->driverAssignment?->driver_id
            ) {
                $reviewed['driver'] = true;
            }
        }

        $reviewTargets = [];

        if (
            in_array(
                $booking->status,
                ['returned', 'completed'],
                true
            )
        ) {
            if ($user->role === 'customer' && $booking->car) {
                $reviewTargets[] = [
                    'key' => 'car',
                    'label' => 'Vehicle',
                    'type' => 'car',
                    'id' => $booking->car->id,
                    'name' => $booking->car->brand.' '.$booking->car->model,
                    'alreadyReviewed' => $reviewed['car'],
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
        }

        $days = max(
            1,
            Carbon::parse($booking->pickup_date)
                ->diffInDays(Carbon::parse($booking->return_date))
        );

        $reviewList = $booking->reviews->map(
            function (Review $review) use ($booking) {
                $targetName = $review->reviewable_type === Car::class
                    ? (
                        $booking->car
                            ? $booking->car->brand.' '.$booking->car->model
                            : 'Unknown Vehicle'
                    )
                    : match ($review->reviewable_id) {
                        $booking->driverAssignment?->driver_id => $booking->driverAssignment->driver->name,
                        default => 'Unknown',
                    };

                return [
                    'id' => $review->id,
                    'reviewer' => [
                        'id' => $review->reviewer->id,
                        'name' => $review->reviewer->name,
                    ],
                    'target' => $review->reviewable_type === Car::class
                            ? 'Vehicle'
                            : $targetName,
                    'rating' => $review->rating,
                    'review_text' => $review->review_text,
                ];
            }
        )->toArray();

        return Inertia::render('booking-details', [
            'booking' => [
                'id' => $booking->id,
                'status' => $booking->status,

                'has_dispute' => $booking->disputes
                    ->where('type', 'owner_no_show')
                    ->count() > 0,

                'pickup_date' => $booking->pickup_date->toDateTimeString(),
                'return_date' => $booking->return_date->toDateTimeString(),
                'pickup_location' => $booking->pickup_location,
                'return_location' => $booking->return_location,
                'total_price' => $booking->total_price,
                'need_driver' => $booking->need_driver,
                'notes' => $booking->notes,
                'days' => $days,

                'daily_rate' => $days > 0
                    ? number_format(
                        $booking->total_price / $days,
                        2
                    )
                    : '0.00',
                'customer' => ($booking->customer && $user->role === 'admin')
                        ? $this->customerPayload($booking, $user)
                        : null,

                'owner' => ($booking->owner && $user->role === 'admin')
                    ? [
                        'id' => $booking->owner->id,
                        'name' => $booking->owner->name,
                        'phone' => $booking->owner->phone,
                    ]
                    : null,

                'car' => $booking->car
                    ? [
                        'id' => $booking->car->id,
                        'brand' => $booking->car->brand,
                        'model' => $booking->car->model,
                        'year' => $booking->car->year,
                        'plate_number' => $booking->car->plate_number,
                    ]
                    : null,

                'payment' => $booking->payment,

                'refunds' => $booking->refunds
                    ->map(fn ($refund) => [
                        'id' => $refund->id,
                        'amount' => $refund->amount,
                        'reason' => $refund->reason,
                        'created_at' => $refund->created_at->toDateTimeString(),
                    ])
                    ->values(),

                'security_deposit_amount' => number_format(
                    $booking->securityDepositAmount(),
                    2,
                    '.',
                    ''
                ),

                'balance_amount' => number_format(
                    $booking->balanceAmount(),
                    2,
                    '.',
                    ''
                ),

                'has_balance_paid' => $booking->hasPaidBalance(),

                'has_security_deposit_paid' => $booking->hasPaidSecurityDeposit(),

                'balance_paid_at' => $booking->balance_paid_at?->toDateTimeString(),

                'security_deposit_paid_at' => $booking->security_deposit_paid_at?->toDateTimeString(),

                'has_leverage_document' => $booking->hasLeverageDocument(),
                'leverage_document_type' => $booking->leverage_document_type,
                'leverage_document_name' => $booking->leverage_document_name,
                'leverage_document_status' => $booking->leverage_document_status,
                'leverage_document_released_at' => $booking->leverage_document_released_at,

                'late_days' => $booking->late_days,
                'late_fee' => $booking->late_fee,

                'driver' => $booking->driverAssignment?->driver
                    ? [
                        'id' => $booking->driverAssignment->driver->id,
                        'name' => $booking->driverAssignment->driver->name,
                        'phone' => $booking->driverAssignment->driver->phone,
                        'license_number' => $booking->driverAssignment->driver->driverProfile?->license_number,
                        'license_type' => $booking->driverAssignment->driver->driverProfile?->license_type,
                        'experience_years' => $booking->driverAssignment->driver->driverProfile?->experience_years,
                        'gender' => $booking->driverAssignment->driver->driverProfile?->gender,
                        'location' => $booking->driverAssignment->driver->driverProfile?->location,
                        'daily_rate' => $booking->driverAssignment->driver->driverProfile?->daily_rate,
                        'proficient_language' => $booking->driverAssignment->driver->driverProfile?->proficient_language,
                        'average_rating' => round($booking->driverAssignment->driver->reviews()->avg('rating') ?? 0, 1),
                        'review_count' => $booking->driverAssignment->driver->reviews()->count(),
                    ]
                    : null,

                'driver_status' => $booking->driverAssignment?->status,

                'driver_response_deadline' => $booking->driverAssignment?->response_deadline
                    ?->toDateTimeString(),

                'driver_responded_at' => $booking->driverAssignment?->responded_at
                    ?->toDateTimeString(),

                'driver_rejection_reason' => $booking->driverAssignment?->rejection_reason,

                'pickup_inspection_approved' => $booking->hasApprovedInspection(
                    Inspection::TYPE_PICKUP
                ),

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
                        'photos' => $inspection->photos ?? [],
                        'id_verified' => $inspection->id_verified,
                        'id_verified_by_name' => $inspection->idVerifiedBy?->name,
                        'id_verified_at' => $inspection->id_verified_at?->toDateTimeString(),
                    ])
                    ->values(),

                'reviewed' => $reviewed,
                'review_targets' => $reviewTargets,
                'can_review' => count($reviewTargets) > 0,
                'reviews' => $reviewList,

                'identity_approved' => $user->role !== 'customer'
    || (
        $user->customerIdentity !== null
        && $user->customerIdentity->isApproved()
    ),

                'identity_status' => $user->role === 'customer'
                    ? $user->customerIdentity?->verification_status
                    : null,

                'security_deposit' => $booking->securityDepositAmount(),

                'late_fee_deduction' => min(
                    (float) $booking->late_fee,
                    $booking->securityDepositAmount()
                ),

                'extra_charge' => (float) $booking->payments()
                    ->where('type', Payment::TYPE_EXTRA_CHARGE)
                    ->where('payment_status', 'pending')
                    ->sum('amount'),
            ],

            'role' => $user->role,
        ]);
    }

    private function customerPayload(
        Booking $booking,
        User $user
    ): array {
        $payload = [
            'id' => $booking->customer->id,
            'name' => $booking->customer->name,
            'phone' => $booking->customer->phone,
        ];

        if (
            $user->role === 'admin'
            || $user->id === $booking->customer_id
        ) {
            $payload['email'] = $booking->customer->email;
        }

        return $payload;
    }

    public function approve(Booking $booking): RedirectResponse
    {
        $user = auth()->user();

        if (
            $booking->owner_id !== $user->id
            && $user->role !== 'admin'
        ) {
            abort(403);
        }

        if ($booking->status !== 'pending') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only pending bookings can be approved.',
            ]);
        }

        $booking->update([
            'status' => 'approved',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking approved.',
        ]);
    }

    public function reject(Booking $booking): RedirectResponse
    {
        $user = auth()->user();

        if (
            $booking->owner_id !== $user->id
            && $user->role !== 'admin'
        ) {
            abort(403);
        }

        if ($booking->status !== 'pending') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only pending bookings can be rejected.',
            ]);
        }

        $booking->update([
            'status' => 'rejected',
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking rejected.',
        ]);
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $user = auth()->user();

        if (
            $booking->customer_id !== $user->id
            && $user->role !== 'admin'
        ) {
            abort(403);
        }

        if (! in_array($booking->status, [
            Booking::STATUS_CONFIRMED,
            Booking::STATUS_DEPOSIT_PAID,
            Booking::STATUS_PAID,
        ], true)) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking can no longer be cancelled.',
            ]);
        }

        $hadPaidDeposit = $booking->hasPaidDeposit();

        if ($hadPaidDeposit) {
            $depositAmount = $booking->depositAmount();
            $retained = round($depositAmount * 0.25, 2);
            $refundAmount = round($depositAmount - $retained, 2);

            $booking->refunds()->create([
                'amount' => $refundAmount,
                'reason' => 'Booking cancelled after deposit paid - 75% refund, 25% retained.',
                'status' => 'pending',
            ]);
        }

        $booking->update([
            'status' => Booking::STATUS_CANCELLED,
        ]);

        $booking->owner?->notifyNow(
            "Booking #{$booking->id} cancelled",
            sprintf(
                'The customer cancelled their booking for your %s %s.%s',
                $booking->car->brand,
                $booking->car->model,
                $hadPaidDeposit
                    ? ' The deposit refund is being processed (25% retained per policy).'
                    : ' No deposit had been paid.'
            ),
            'booking_cancelled',
            Booking::class,
            $booking->id,
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => $hadPaidDeposit
                ? 'Booking cancelled. 75% of your deposit will be refunded; 25% is non-refundable.'
                : 'Booking cancelled.',
        ]);
    }

    /**
     * Assign a driver to a booking.
     *
     * The driver gets 24 hours to accept or reject the assignment.
     */
    public function assignDriver(
        Request $request,
        Booking $booking
    ): RedirectResponse {
        $user = auth()->user();

        if (
            $booking->owner_id !== $user->id
            && $user->role !== 'admin'
        ) {
            abort(403);
        }

        if (! $booking->need_driver) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This booking did not request a driver.',
            ]);
        }

        $validated = $request->validate([
            'driver_id' => [
                'required',
                'exists:users,id',
            ],
        ]);

        $driver = User::drivers()
            ->where('id', $validated['driver_id'])
            ->whereHas('driverProfile', function ($q) {
                $q->where('availability', 'available');
            })
            ->firstOrFail();

        $responseDeadline = now()->addHours(24);

        BookingDriver::updateOrCreate(
            [
                'booking_id' => $booking->id,
            ],
            [
                'driver_id' => $driver->id,
                'assigned_by' => $user->id,
                'assigned_at' => now(),
                'response_deadline' => $responseDeadline,
                'responded_at' => null,
                'rejection_reason' => null,
                'status' => BookingDriver::STATUS_ASSIGNED,
            ]
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Driver assigned. The driver has 24 hours to respond.',
        ]);
    }

    public function markPickedUp(
        Booking $booking
    ): RedirectResponse {
        $user = auth()->user();

        if (
            $booking->owner_id !== $user->id
            && $user->role !== 'admin'
        ) {
            abort(403);
        }

        if ($booking->status !== 'paid') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only paid bookings can be marked as picked up.',
            ]);
        }

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

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle marked as picked up.',
        ]);
    }

    public function markReturned(
        Booking $booking
    ): RedirectResponse {
        $user = auth()->user();

        if (
            $booking->owner_id !== $user->id
            && $user->role !== 'admin'
        ) {
            abort(403);
        }

        if ($booking->status !== 'picked_up') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only picked up bookings can be marked as returned.',
            ]);
        }

        $booking->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        $booking->completeDriverTrips();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle marked as returned.',
        ]);
    }

    public function complete(
        Booking $booking
    ): RedirectResponse {
        $user = auth()->user();

        if (
            $booking->owner_id !== $user->id
            && $user->role !== 'admin'
        ) {
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
