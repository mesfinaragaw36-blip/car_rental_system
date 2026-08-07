<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Inspection;
use App\Models\Refund;
use App\Models\User;
use App\Services\BookingCompletionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InspectionController extends Controller
{
    private const PICKUP_ELIGIBLE_STATUSES = [Booking::STATUS_DEPOSIT_PAID, Booking::STATUS_PAID];

    public function __construct(private readonly BookingCompletionService $completion) {}

    public function index(): Response
    {
        $bookings = Booking::with(['customer', 'owner', 'car', 'inspections'])
            ->whereIn('status', ['deposit_paid', 'paid', 'picked_up', 'returned'])
            ->latest('return_date')
            ->get();

        $mapper = fn (Booking $booking) => [
            'id' => $booking->id,
            'status' => $booking->status,
            'pickup_date' => $booking->pickup_date->toDateString(),
            'return_date' => $booking->return_date->toDateString(),
            'pickup_location' => $booking->pickup_location,
            'return_location' => $booking->return_location,
            'total_price' => $booking->total_price,
            'security_deposit_amount' => $booking->securityDepositAmount(),
            'car_delivery_status' => $booking->car_delivery_status,
            'car_delivery_confirmed_at' => $booking->car_delivery_confirmed_at?->toDateTimeString(),
            'car_delivery_due_date' => $booking->carDeliveryDueDate()->toDateString(),
            'car' => [
                'brand' => $booking->car->brand,
                'model' => $booking->car->model,
                'year' => $booking->car->year,
                'plate_number' => $booking->car->plate_number,
                'estimated_value' => $booking->car->estimated_value,
            ],
            'customer' => $booking->customer ? ['id' => $booking->customer->id, 'name' => $booking->customer->name, 'phone' => $booking->customer->phone] : null,
            'owner' => $booking->owner ? ['id' => $booking->owner->id, 'name' => $booking->owner->name, 'phone' => $booking->owner->phone] : null,
            'inspections' => $booking->inspections
                ->map(fn (Inspection $inspection) => $this->inspectionPayload($inspection))
                ->values(),
        ];

        $pickupQueue = $bookings
            ->filter(fn (Booking $booking) => in_array($booking->status, self::PICKUP_ELIGIBLE_STATUSES, true))
            ->values()
            ->map($mapper)
            ->all();

        $returnQueue = $bookings
            ->filter(fn (Booking $booking) => $booking->status === 'picked_up')
            ->values()
            ->map($mapper)
            ->all();

        $awaitingCompletion = $bookings
            ->filter(fn (Booking $booking) => $booking->status === 'returned')
            ->values()
            ->map($mapper)
            ->all();

        return Inertia::render('inspections', [
            'pickup_queue' => $pickupQueue,
            'return_queue' => $returnQueue,
            'awaiting_completion' => $awaitingCompletion,
        ]);
    }

    public function confirmDelivery(Request $request, Booking $booking): RedirectResponse
    {
        if (! in_array($booking->status, [Booking::STATUS_CONFIRMED, Booking::STATUS_DEPOSIT_PAID, Booking::STATUS_PAID], true)) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Car delivery can only be confirmed for active or confirmed bookings.']);
        }

        if ($booking->hasCarDeliveryBeenConfirmed()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'The car delivery status has already been confirmed for this booking.']);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:arrived,failed'],
        ]);

        $booking->update([
            'car_delivery_status' => $validated['status'],
            'car_delivery_confirmed_at' => now(),
            'car_delivery_confirmed_by' => $request->user()->id,
        ]);

        if ($validated['status'] === Booking::CAR_DELIVERY_ARRIVED) {
            $this->notifyOwnerArrived($booking);

            $message = 'Car arrival confirmed. The pre-rental inspection can now be conducted.';
        } else {
            $this->notifyOwnerNotDelivered($booking);
            $this->notifyAdminsOfFailedDelivery($booking);

            $message = 'Delivery marked as failed. The owner and admins have been notified.';
        }

        return back()->with('toast', ['type' => 'success', 'message' => $message]);
    }

    public function conduct(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:pickup,return'],
            'status' => ['required', 'in:approved,issues_found'],
            'mileage_reading' => ['nullable', 'integer', 'min:0'],
            'fuel_level' => ['nullable', 'integer', 'between:0,100'],
            'damages' => ['nullable', 'array'],
            'damages.*.area' => ['required_with:damages', 'string', 'max:255'],
            'damages.*.description' => ['required_with:damages', 'string', 'max:1000'],
            'estimated_value' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
        ]);

        $type = $validated['type'];
        $error = $this->validateBookingState($booking, $type);

        if ($error !== null) {
            return back()->with('toast', ['type' => 'error', 'message' => $error]);
        }

        if ($type === Inspection::TYPE_PICKUP && $booking->hasInspection($type)) {
            return back()->with('toast', ['type' => 'error', 'message' => 'A pickup inspection has already been recorded for this booking.']);
        }

        $existing = Inspection::where('booking_id', $booking->id)->where('type', $type)->first();
        $photoPaths = $existing?->photos ?? [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $photoPaths[] = $photo->store('inspection-photos', 'public');
            }
        }

        Inspection::updateOrCreate(
            ['booking_id' => $booking->id, 'type' => $type],
            [
                'status' => $validated['status'],
                'conducted_by' => $request->user()->id,
                'conducted_at' => now(),
                'mileage_reading' => $validated['mileage_reading'] ?? null,
                'fuel_level' => $validated['fuel_level'] ?? null,
                'damages' => $validated['damages'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'photos' => $photoPaths,
            ]
        );

        if ($type === Inspection::TYPE_PICKUP && $validated['status'] === Inspection::STATUS_ISSUES_FOUND) {
            $this->cancelForFailedPickupInspection($booking);

            return back()->with('toast', [
                'type' => 'success',
                'message' => "Pickup inspection rejected for booking #{$booking->id}. The booking was cancelled and the customer's deposit refunded.",
            ]);
        }

        if ($type === Inspection::TYPE_PICKUP && $validated['status'] === Inspection::STATUS_APPROVED) {
            $this->handleApprovedPickupInspection($booking, $validated['estimated_value'] ?? null);
        }

        $label = $type === Inspection::TYPE_PICKUP ? 'Pickup' : 'Return';

        return back()->with('toast', [
            'type' => 'success',
            'message' => "{$label} inspection recorded for booking #{$booking->id}.",
        ]);
    }

    public function complete(Request $request, Booking $booking): RedirectResponse
    {
        if ($booking->status !== 'returned') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only returned bookings can be marked as completed.',
            ]);
        }

        if (! $booking->hasInspection(Inspection::TYPE_RETURN)) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Record the return inspection before completing this booking.',
            ]);
        }

        $returnInspection = $booking->inspections()->where('type', Inspection::TYPE_RETURN)->first();

        $repairCost = null;

        if ($returnInspection->status === Inspection::STATUS_ISSUES_FOUND) {
            $repairCost = (float) $request->validate([
                'repair_cost' => ['required', 'numeric', 'min:0'],
            ])['repair_cost'];
        }

        $this->completion->complete($booking, $repairCost);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking inspection completed and marked as finished.',
        ]);
    }

    public function handover(Booking $booking): RedirectResponse
    {
        if ($booking->status !== Booking::STATUS_PAID) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'The rental balance and security deposit must be collected before handing over the vehicle.',
            ]);
        }

        if (! $booking->hasApprovedInspection(Inspection::TYPE_PICKUP)) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'The pickup inspection must be approved before handing over the vehicle.',
            ]);
        }

        $booking->update([
            'status' => Booking::STATUS_PICKED_UP,
            'picked_up_at' => now(),
        ]);

        $booking->customer?->notifyNow(
            "Keys handed over - Booking #{$booking->id}",
            sprintf(
                'You have received the keys for the %s %s. Drive safely and return it to %s on %s.',
                $booking->car->brand,
                $booking->car->model,
                $booking->return_location,
                $booking->return_date->format('M j, Y'),
            ),
            'booking_picked_up',
            Booking::class,
            $booking->id,
        );

        $booking->owner?->notifyNow(
            "Vehicle handed over - Booking #{$booking->id}",
            sprintf(
                'Your %s %s has been handed over to the customer. It is due back at %s on %s.',
                $booking->car->brand,
                $booking->car->model,
                $booking->return_location,
                $booking->return_date->format('M j, Y'),
            ),
            'booking_picked_up',
            Booking::class,
            $booking->id,
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle marked as picked up. Keys handed over to the customer.',
        ]);
    }

    public function markReturned(Booking $booking): RedirectResponse
    {
        if ($booking->status !== Booking::STATUS_PICKED_UP) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only picked up bookings can be marked as returned.',
            ]);
        }

        $booking->update([
            'status' => Booking::STATUS_RETURNED,
            'returned_at' => now(),
        ]);
        $booking->car->update([
        'availability_status' => 'available',
        ]);

        $booking->customer?->notifyNow(
            "Return received - Booking #{$booking->id}",
            sprintf(
                'Your %s %s has been received back at %s. The return inspection will now be finalized.',
                $booking->car->brand,
                $booking->car->model,
                $booking->return_location,
            ),
            'booking_returned',
            Booking::class,
            $booking->id,
        );

        $booking->owner?->notifyNow(
            "Vehicle returned - Booking #{$booking->id}",
            sprintf(
                'Your %s %s has been returned to %s. The return inspection will now be finalized.',
                $booking->car->brand,
                $booking->car->model,
                $booking->return_location,
            ),
            'booking_returned',
            Booking::class,
            $booking->id,
        );

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle marked as returned.',
        ]);
    }

    private function handleApprovedPickupInspection(Booking $booking, ?float $estimatedValue): void
    {
        if ($estimatedValue !== null) {
            $booking->car()->update(['estimated_value' => $estimatedValue]);
            $booking->update([
                'security_deposit_amount' => max(1000.0, round($estimatedValue * 0.10, 2)),
            ]);
        }

        $booking->customer?->notifyNow(
            "Your {$booking->car->brand} {$booking->car->model} is ready for pickup",
            sprintf(
                'The vehicle passed the pickup inspection. Please pay the remaining balance and security deposit of ETB %s on the system to receive your keys.',
                number_format($booking->balanceAmount() + $booking->securityDepositAmount(), 2),
            ),
            'car_ready',
            Booking::class,
            $booking->id,
        );

        $booking->owner?->notifyNow(
            "Pickup inspection approved for booking #{$booking->id}",
            sprintf(
                'Your %s %s passed the pickup inspection. The customer will pay the remaining balance and security deposit before handover.',
                $booking->car->brand,
                $booking->car->model,
            ),
            'inspection_approved',
            Booking::class,
            $booking->id,
        );
    }

    private function cancelForFailedPickupInspection(Booking $booking): void
    {
        $paid = $booking->totalPaid();

        DB::transaction(function () use ($booking, $paid) {
            $booking->update(['status' => Booking::STATUS_CANCELLED]);

            if ($paid > 0) {
                Refund::create([
                    'booking_id' => $booking->id,
                    'amount' => round($paid, 2),
                    'reason' => 'Pre-rental inspection failed; booking cancelled.',
                ]);
            }
        });

        $booking->customer?->notifyNow(
            "Booking #{$booking->id} cancelled",
            sprintf(
                'The pre-rental inspection for the %s %s did not pass, so your booking has been cancelled. Your payment of ETB %s will be refunded to your original payment method.',
                $booking->car->brand,
                $booking->car->model,
                number_format(round($paid, 2), 2),
            ),
            'booking_cancelled',
            Booking::class,
            $booking->id,
        );

        $booking->owner?->notifyNow(
            "Booking #{$booking->id} cancelled after failed inspection",
            sprintf(
                'The pre-rental inspection for your %s %s did not pass. The booking has been cancelled and the customer refunded. Update the vehicle and return it to availability.',
                $booking->car->brand,
                $booking->car->model,
            ),
            'inspection_failed',
            Booking::class,
            $booking->id,
        );
    }

    private function notifyOwnerArrived(Booking $booking): void
    {
        $booking->owner?->notifyNow(
            "Your {$booking->car->brand} {$booking->car->model} arrived at the branch",
            sprintf(
                'The car has been confirmed at %s. The pre-rental inspection is now scheduled before pickup on %s.',
                $booking->pickup_location,
                $booking->pickup_date->format('M j, Y g:i A'),
            ),
            'car_arrived',
            Booking::class,
            $booking->id,
        );
    }

    private function notifyOwnerNotDelivered(Booking $booking): void
    {
        $booking->owner?->notifyNow(
            "Your {$booking->car->brand} {$booking->car->model} was not delivered on time",
            sprintf(
                'The car has not been delivered to %s. Please bring it immediately so the inspection can happen before pickup on %s.',
                $booking->pickup_location,
                $booking->pickup_date->format('M j, Y g:i A'),
            ),
            'car_delivery_failed',
            Booking::class,
            $booking->id,
        );
    }

    private function notifyAdminsOfFailedDelivery(Booking $booking): void
    {
        User::query()->where('role', 'admin')->whereNull('staff_role_id')->get()
            ->each->notifyNow(
                "Car not delivered - booking #{$booking->id}",
                sprintf(
                    'The %s %s for booking #%s has not arrived at %s before the pickup inspection. Please follow up with the owner.',
                    $booking->car->brand,
                    $booking->car->model,
                    $booking->id,
                    $booking->pickup_location,
                ),
                'delivery_escalated',
                Booking::class,
                $booking->id,
            );
    }

    private function validateBookingState(Booking $booking, string $type): ?string
    {
        if ($type === Inspection::TYPE_PICKUP) {
            if (! in_array($booking->status, self::PICKUP_ELIGIBLE_STATUSES, true)) {
                return 'Only bookings with a paid deposit can receive a pickup inspection.';
            }

            if (! $booking->hasCarArrived()) {
                return 'Confirm that the car has arrived at the branch before conducting the pickup inspection.';
            }

            return null;
        }

        if ($booking->status !== 'picked_up') {
            return 'Only picked up bookings can receive a return inspection.';
        }

        return null;
    }

    private function inspectionPayload(Inspection $inspection): array
    {
        return [
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
        ];
    }
}
