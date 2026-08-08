<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Inspection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InspectionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function booking(User $owner, User $customer, string $status, bool $delivered = true): Booking
    {
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        return Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'deposit_amount' => 500.00,
            'status' => $status,
            'car_delivery_status' => $delivered ? Booking::CAR_DELIVERY_ARRIVED : Booking::CAR_DELIVERY_PENDING,
            'picked_up_at' => $status === 'picked_up' || $status === 'returned' ? now() : null,
            'returned_at' => $status === 'returned' ? now() : null,
            'balance_paid_at' => $status === 'paid' ? now() : null,
            'security_deposit_paid_at' => $status === 'paid' ? now() : null,
        ]);
    }

    public function test_index_lists_pickup_queue_return_queue_and_awaiting_completion(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);

        $pickupBooking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);
        $returnBooking = $this->booking($owner, $customer, 'picked_up');
        $completionBooking = $this->booking($owner, $customer, 'returned');

        $this->actingAs($admin)
            ->get(route('inspections.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('pickup_queue', 1)
                ->has('return_queue', 1)
                ->has('awaiting_completion', 1)
                ->where('pickup_queue.0.id', $pickupBooking->id)
                ->where('return_queue.0.id', $returnBooking->id)
                ->where('awaiting_completion.0.id', $completionBooking->id));
    }

    public function test_index_keeps_bookings_with_recorded_pickup_inspection_visible_in_pickup_queue(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $inspection = Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($admin)
            ->get(route('inspections.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('pickup_queue', 1)
                ->where('pickup_queue.0.id', $booking->id)
                ->where('pickup_queue.0.inspections.0.id', $inspection->id)
                ->where('pickup_queue.0.inspections.0.status', Inspection::STATUS_APPROVED));
    }

    public function test_non_staff_cannot_access_inspections(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->get(route('inspections.index'))
            ->assertForbidden();
    }

    public function test_confirm_delivery_arrived_notifies_owner(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID, false);

        $this->actingAs($admin)
            ->post(route('inspections.delivery', ['booking' => $booking->id]), [
                'status' => Booking::CAR_DELIVERY_ARRIVED,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'car_delivery_status' => Booking::CAR_DELIVERY_ARRIVED,
            'car_delivery_confirmed_by' => $admin->id,
        ]);

        $this->assertNotNull($booking->fresh()->car_delivery_confirmed_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'car_arrived',
            'related_id' => $booking->id,
        ]);
    }

    public function test_confirm_delivery_failed_notifies_owner_and_admins(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID, false);

        $this->actingAs($admin)
            ->post(route('inspections.delivery', ['booking' => $booking->id]), [
                'status' => Booking::CAR_DELIVERY_FAILED,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'car_delivery_status' => Booking::CAR_DELIVERY_FAILED,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'car_delivery_failed',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'type' => 'delivery_escalated',
            'related_id' => $booking->id,
        ]);
    }

    public function test_delivery_cannot_be_confirmed_twice(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($admin)
            ->post(route('inspections.delivery', ['booking' => $booking->id]), [
                'status' => Booking::CAR_DELIVERY_ARRIVED,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'car_delivery_status' => Booking::CAR_DELIVERY_ARRIVED,
        ]);
    }

    public function test_conduct_pickup_inspection_requires_car_arrival(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID, false);

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_PICKUP,
                'status' => Inspection::STATUS_APPROVED,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseCount('inspections', 0);
    }

    public function test_approved_pickup_inspection_sets_deposit_from_estimated_value_and_notifies(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_PICKUP,
                'status' => Inspection::STATUS_APPROVED,
                'estimated_value' => 2500000,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('cars', [
            'id' => $booking->car->id,
            'estimated_value' => '2500000.00',
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'security_deposit_amount' => '250000.00',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'car_ready',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'inspection_approved',
            'related_id' => $booking->id,
        ]);
    }

    public function test_escalate_missing_deliveries_command_notifies_owner_and_admins(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ]);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDay()->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'deposit_amount' => 500.00,
            'status' => Booking::STATUS_DEPOSIT_PAID,
            'car_delivery_status' => Booking::CAR_DELIVERY_PENDING,
        ]);

        $this->artisan('bookings:escalate-missing-deliveries')->assertSuccessful();

        $this->assertNotNull($booking->fresh()->car_delivery_escalated_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'delivery_escalated',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'type' => 'delivery_escalated',
            'related_id' => $booking->id,
        ]);
    }

    public function test_conduct_records_pickup_inspection(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_PICKUP,
                'status' => Inspection::STATUS_APPROVED,
                'mileage_reading' => 45230,
                'fuel_level' => 75,
                'notes' => 'No issues.',
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('inspections', [
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
            'conducted_by' => $admin->id,
            'mileage_reading' => 45230,
            'fuel_level' => 75,
        ]);

        $inspection = $booking->inspections()->where('type', Inspection::TYPE_PICKUP)->first();
        $this->assertNotNull($inspection->conducted_at);
    }

    public function test_conduct_records_return_inspection_with_damages(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'picked_up');

        $damages = [
            ['area' => 'Front bumper', 'description' => 'Scratched'],
        ];

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_RETURN,
                'status' => Inspection::STATUS_ISSUES_FOUND,
                'damages' => $damages,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('inspections', [
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_RETURN,
            'status' => Inspection::STATUS_ISSUES_FOUND,
        ]);

        $inspection = $booking->inspections()->where('type', Inspection::TYPE_RETURN)->first();
        $this->assertEquals($damages, $inspection->damages);
    }

    public function test_conduct_rejects_pickup_inspection_for_non_deposit_paid_booking(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'confirmed');

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_PICKUP,
                'status' => Inspection::STATUS_APPROVED,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseCount('inspections', 0);
    }

    public function test_conduct_rejects_duplicate_pickup_inspection(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_PICKUP,
                'status' => Inspection::STATUS_APPROVED,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseCount('inspections', 1);
    }

    public function test_complete_requires_return_inspection(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'returned');

        $this->actingAs($admin)
            ->post(route('inspections.complete', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'returned',
        ]);
    }

    public function test_complete_marks_booking_completed_after_return_inspection(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'returned');

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_RETURN,
            'status' => Inspection::STATUS_ISSUES_FOUND,
        ]);

        $this->actingAs($admin)
            ->post(route('inspections.complete', ['booking' => $booking->id]), [
                'repair_cost' => 200,
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'amount' => '800.00',
            'reason' => 'Security deposit refund after deducting ETB 200.00 for repair costs.',
        ]);

        $this->assertDatabaseHas('owner_payouts', [
            'booking_id' => $booking->id,
            'owner_id' => $owner->id,
            'gross_amount' => '300.00',
            'commission_amount' => '30.00',
            'net_amount' => '270.00',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'booking_completed',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'payout_pending',
            'related_id' => $booking->id,
        ]);
    }

    public function test_complete_with_approved_return_inspection_refunds_security_deposit_in_full(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'returned');

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_RETURN,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($admin)
            ->post(route('inspections.complete', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'amount' => '1000.00',
            'reason' => 'Full security deposit refund after a successful return.',
        ]);
    }

    public function test_complete_requires_repair_cost_when_return_inspection_found_issues(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'returned');

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_RETURN,
            'status' => Inspection::STATUS_ISSUES_FOUND,
        ]);

        $this->actingAs($admin)
            ->post(route('inspections.complete', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHasErrors('repair_cost');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'returned',
        ]);

        $this->assertDatabaseCount('owner_payouts', 0);
    }

    public function test_handover_requires_approved_inspection_before_handing_over_keys(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'paid');

        $this->actingAs($admin)
            ->post(route('inspections.handover', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
        ]);
    }

    public function test_handover_requires_balance_and_security_deposit_paid(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($admin)
            ->post(route('inspections.handover', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_DEPOSIT_PAID,
        ]);
    }

    public function test_handover_allowed_after_approved_inspection_and_full_payment(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'paid');

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($admin)
            ->post(route('inspections.handover', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'picked_up',
        ]);
    }

    public function test_handover_notifies_customer_and_owner(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'paid');

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($admin)
            ->post(route('inspections.handover', ['booking' => $booking->id]))
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'booking_picked_up',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'booking_picked_up',
            'related_id' => $booking->id,
        ]);
    }

    public function test_owner_cannot_hand_over_vehicle(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'paid');

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($owner)
            ->post(route('inspections.handover', ['booking' => $booking->id]))
            ->assertForbidden();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
        ]);
    }

    public function test_mark_returned_marks_picked_up_booking_as_returned_and_notifies(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'picked_up');

        $this->actingAs($admin)
            ->post(route('inspections.returned', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'returned',
        ]);

        $this->assertNotNull($booking->fresh()->returned_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'booking_returned',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'booking_returned',
            'related_id' => $booking->id,
        ]);
    }

    public function test_mark_returned_requires_picked_up_booking(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'returned');

        $this->actingAs($admin)
            ->post(route('inspections.returned', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'returned',
        ]);
    }

    public function test_owner_cannot_mark_booking_as_returned(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'picked_up');

        $this->actingAs($owner)
            ->post(route('inspections.returned', ['booking' => $booking->id]))
            ->assertForbidden();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'picked_up',
        ]);
    }

    public function test_confirm_return_arrival_marks_booking_arrived_and_notifies_owner(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'picked_up');

        $this->actingAs($admin)
            ->post(route('inspections.return-arrival', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'return_arrival_status' => Booking::RETURN_ARRIVAL_ARRIVED,
            'return_arrival_confirmed_by' => $admin->id,
        ]);

        $this->assertNotNull($booking->fresh()->return_arrival_confirmed_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'car_returned',
            'related_id' => $booking->id,
        ]);
    }

    public function test_confirm_return_arrival_requires_picked_up_or_returned_booking(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'paid');

        $this->actingAs($admin)
            ->post(route('inspections.return-arrival', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'return_arrival_status' => Booking::RETURN_ARRIVAL_PENDING,
        ]);
    }

    public function test_confirm_return_arrival_cannot_be_confirmed_twice(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'picked_up');

        $this->actingAs($admin)
            ->post(route('inspections.return-arrival', ['booking' => $booking->id]))
            ->assertSessionHas('toast.type', 'success');

        $this->actingAs($admin)
            ->post(route('inspections.return-arrival', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');
    }

    public function test_mark_returned_auto_confirms_return_arrival(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'picked_up');

        $this->actingAs($admin)
            ->post(route('inspections.returned', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'returned',
            'return_arrival_status' => Booking::RETURN_ARRIVAL_ARRIVED,
        ]);
    }

    public function test_index_exposes_return_arrival_status_and_late_return_days(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);

        $onTime = $this->booking($owner, $customer, 'picked_up');

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ]);

        $late = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(6)->toDateString(),
            'return_date' => now()->subDays(2)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'deposit_amount' => 500.00,
            'status' => 'returned',
            'picked_up_at' => now()->subDays(5),
            'returned_at' => now()->subDay(),
            'return_arrival_status' => Booking::RETURN_ARRIVAL_ARRIVED,
        ]);

        $this->actingAs($admin)
            ->get(route('inspections.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('return_queue.0.id', $onTime->id)
                ->where('return_queue.0.return_arrival_status', Booking::RETURN_ARRIVAL_PENDING)
                ->where('return_queue.0.late_return_days', 0)
                ->where('awaiting_completion.0.id', $late->id)
                ->where('awaiting_completion.0.return_arrival_status', Booking::RETURN_ARRIVAL_ARRIVED)
                ->where('awaiting_completion.0.late_return_days', 1));
    }

    public function test_pickup_inspection_with_issues_cancels_booking_and_refunds_customer(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_PICKUP,
                'status' => Inspection::STATUS_ISSUES_FOUND,
                'damages' => [['area' => 'Brakes', 'description' => 'Unsafe']],
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('refunds', [
            'booking_id' => $booking->id,
            'amount' => '500.00',
            'reason' => 'Pre-rental inspection failed; booking cancelled.',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'booking_cancelled',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'inspection_failed',
            'related_id' => $booking->id,
        ]);
    }

    public function test_rejected_pickup_inspection_still_saves_inspection_details(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($admin)
            ->post(route('inspections.conduct', ['booking' => $booking->id]), [
                'type' => Inspection::TYPE_PICKUP,
                'status' => Inspection::STATUS_ISSUES_FOUND,
                'mileage_reading' => 45230,
                'fuel_level' => 60,
                'damages' => [['area' => 'Brakes', 'description' => 'Unsafe']],
                'notes' => 'Multiple faults found.',
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('inspections', [
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_ISSUES_FOUND,
            'mileage_reading' => 45230,
            'fuel_level' => 60,
            'conducted_by' => $admin->id,
        ]);

        $inspection = $booking->inspections()->first();

        $this->assertNotNull($inspection);
        $this->assertEquals(
            [['area' => 'Brakes', 'description' => 'Unsafe']],
            $inspection->damages,
        );
    }

    public function test_booking_details_include_inspection_history(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'returned');

        $pickup = Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
            'conducted_by' => $admin->id,
            'conducted_at' => now(),
            'mileage_reading' => 10000,
            'fuel_level' => 80,
        ]);

        $this->actingAs($customer)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('booking.inspections', 1)
                ->where('booking.inspections.0.id', $pickup->id)
                ->where('booking.inspections.0.type', 'pickup')
                ->where('booking.inspections.0.status', 'approved')
                ->where('booking.inspections.0.mileage_reading', 10000)
                ->where('booking.inspections.0.conducted_by_name', $admin->name));
    }
}
