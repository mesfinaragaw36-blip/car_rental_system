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

        $customerColumns = $user->role === 'admin' ? 'customer:id,name,phone,email' : 'customer:id,name,phone';

        $query = Booking::with([
            $customerColumns,
            'owner:id,name,phone',
            'car:id,brand,model,year,plate_number',
            'payments',
            'driverAssignment:id,booking_id,driver_id,status',
            'driverAssignment.driver:id,name,phone',
        ]);

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

        return Inertia::render('bookings', [
            'role' => $user->role,
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'search']),
            'stats' => $user->role === 'admin' ? [
                'total' => Booking::count(),
                'awaiting_deposit' => Booking::where('status', Booking::STATUS_CONFIRMED)->count(),
                'deposit_paid' => Booking::where('status', Booking::STATUS_DEPOSIT_PAID)->count(),
                'active' => Booking::where('status', 'picked_up')->count(),
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

        $booking->load([
            'customer:id,name,phone,email',
            'owner:id,name,phone',
            'car:id,brand,model,year,plate_number',
            'payments',
            'driverAssignment:id,booking_id,driver_id,status',
            'driverAssignment.driver:id,name,phone',
            'reviews.reviewer:id,name',
            'refunds',
            'ownerPayout',
            'inspections.conductedBy:id,name',
        ]);

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

        $depositPayment = $booking->depositPayment();

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
                'payment' => $depositPayment ? ['id' => $depositPayment->id, 'payment_method' => $depositPayment->payment_method, 'payment_status' => $depositPayment->payment_status, 'paid_at' => $depositPayment->paid_at?->toDateTimeString()] : null,
                'security_deposit_amount' => number_format($booking->securityDepositAmount(), 2),
                'balance_amount' => number_format($booking->balanceAmount(), 2),
                'has_balance_paid' => $booking->hasPaidBalance(),
                'has_security_deposit_paid' => $booking->hasPaidSecurityDeposit(),
                'balance_paid_at' => $booking->balance_paid_at?->toDateTimeString(),
                'security_deposit_paid_at' => $booking->security_deposit_paid_at?->toDateTimeString(),
                'refunds' => $booking->refunds->map(fn ($refund) => [
                    'id' => $refund->id,
                    'amount' => $refund->amount,
                    'reason' => $refund->reason,
                    'created_at' => $refund->created_at->toDateTimeString(),
                ])->values(),
                'payout' => $booking->ownerPayout ? [
                    'gross_amount' => $booking->ownerPayout->gross_amount,
                    'commission_amount' => $booking->ownerPayout->commission_amount,
                    'net_amount' => $booking->ownerPayout->net_amount,
                    'status' => $booking->ownerPayout->status,
                    'paid_at' => $booking->ownerPayout->paid_at?->toDateTimeString(),
                ] : null,
                'driver' => $booking->driverAssignment?->driver ? ['id' => $booking->driverAssignment->driver->id, 'name' => $booking->driverAssignment->driver->name, 'phone' => $booking->driverAssignment->driver->phone] : null,
                'driver_status' => $booking->driverAssignment?->status,
                'picked_up_at' => $booking->picked_up_at?->toDateTimeString(),
                'returned_at' => $booking->returned_at?->toDateTimeString(),
                'car_delivery_status' => $booking->car_delivery_status,
                'car_delivery_confirmed_at' => $booking->car_delivery_confirmed_at?->toDateTimeString(),
                'car_delivery_due_date' => $booking->carDeliveryDueDate()->toDateString(),
                'pickup_inspection_approved' => $booking->hasApprovedInspection(Inspection::TYPE_PICKUP),
                'inspections' => $booking->inspections
                    ->map(fn (Inspection $inspection) => [
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
        if (! in_array($booking->status, ['confirmed', 'pending'])) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Only bookings that have not paid the deposit can be cancelled.']);
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
