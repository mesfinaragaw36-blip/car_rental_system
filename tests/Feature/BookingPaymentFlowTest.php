<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\Inspection;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingPaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    private function booking(User $owner, User $customer, string $status, array $overrides = []): Booking
    {
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
        ]);

        return Booking::create(array_merge([
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
            'security_deposit_amount' => 1000.00,
            'status' => $status,
        ], $overrides));
    }

    public function test_booking_creation_stores_security_deposit_amount(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
        ]);

        $this->actingAs($customer)->post(route('cars.book', ['car' => $car->id]), [
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
        ]);

        $this->assertDatabaseHas('bookings', [
            'car_id' => $car->id,
            'security_deposit_amount' => '1000.00',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'booking_confirmed',
        ]);
    }

    private function approvedPickupInspection(Booking $booking): void
    {
        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);
    }

    public function test_pickup_payment_page_lists_balance_and_security_deposit(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);
        $this->approvedPickupInspection($booking);

        $this->actingAs($customer)
            ->get(route('payments.pickup-create', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('mode', 'pickup')
                ->where('booking.balance_amount', 0)
                ->where('booking.security_deposit_amount', 1000));
    }

    public function test_pickup_payment_page_blocked_until_inspection_approved(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($customer)
            ->get(route('payments.pickup-create', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');
    }

    public function test_customer_paying_balance_and_security_deposit_marks_booking_paid(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);
        $this->approvedPickupInspection($booking);

        $this->actingAs($customer)
            ->post(route('payments.pickup-store', ['booking' => $booking->id]), [
                'payment_method' => 'Telebirr',
                'transaction_reference' => 'TX-PICKUP-1',
            ])
            ->assertRedirect(route('bookings.index'))
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
        ]);

        $this->assertNotNull($booking->fresh()->balance_paid_at);
        $this->assertNotNull($booking->fresh()->security_deposit_paid_at);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'type' => 'security_deposit',
            'amount' => '1000.00',
            'payment_method' => 'Telebirr',
            'payment_status' => 'paid',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'booking_paid',
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'booking_paid',
            'related_id' => $booking->id,
        ]);
    }

    public function test_pickup_payment_records_balance_and_security_deposit_rows(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID, [
            'total_price' => 1500.00,
        ]);
        $this->approvedPickupInspection($booking);

        $this->actingAs($customer)
            ->post(route('payments.pickup-store', ['booking' => $booking->id]), [
                'payment_method' => 'Bank Transfer',
                'transaction_reference' => 'TX-PICKUP-2',
            ])
            ->assertRedirect(route('bookings.index'))
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'type' => 'balance',
            'amount' => '1000.00',
            'payment_method' => 'Bank Transfer',
            'transaction_reference' => 'TX-PICKUP-2',
            'payment_status' => 'paid',
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'type' => 'security_deposit',
            'amount' => '1000.00',
            'payment_method' => 'Bank Transfer',
            'transaction_reference' => 'TX-PICKUP-2',
            'payment_status' => 'paid',
        ]);

        $this->assertSame(2, Payment::where('booking_id', $booking->id)->count());
    }

    public function test_pickup_payment_blocked_without_approved_inspection(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($customer)
            ->post(route('payments.pickup-store', ['booking' => $booking->id]), [
                'payment_method' => 'Cash',
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_DEPOSIT_PAID,
        ]);
    }

    public function test_transaction_reference_required_for_non_cash_payment(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_CONFIRMED);

        $this->actingAs($customer)
            ->post(route('payments.store', ['booking' => $booking->id]), [
                'payment_method' => 'Telebirr',
            ])
            ->assertSessionHasErrors('transaction_reference');

        $this->assertDatabaseCount('payments', 0);
    }

    public function test_pickup_payment_requires_deposit_paid_status(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_CONFIRMED);

        $this->actingAs($customer)
            ->post(route('payments.pickup-store', ['booking' => $booking->id]), [
                'payment_method' => 'Cash',
            ])
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_CONFIRMED,
        ]);
    }

    public function test_pickup_payment_cannot_be_made_twice(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID, [
            'balance_paid_at' => now(),
            'security_deposit_paid_at' => now(),
        ]);

        $this->actingAs($customer)
            ->post(route('payments.pickup-store', ['booking' => $booking->id]), [
                'payment_method' => 'Cash',
            ])
            ->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_DEPOSIT_PAID,
        ]);
    }

    public function test_pickup_payment_requires_booking_access(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $stranger = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($stranger)
            ->post(route('payments.pickup-store', ['booking' => $booking->id]), [
                'payment_method' => 'Cash',
            ])
            ->assertForbidden();
    }

    public function test_owner_completing_booking_creates_pending_payout(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'returned', [
            'returned_at' => now(),
        ]);

        $this->actingAs($owner)
            ->post(route('bookings.complete', ['booking' => $booking->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('owner_payouts', [
            'booking_id' => $booking->id,
            'owner_id' => $owner->id,
            'gross_amount' => '300.00',
            'commission_amount' => '30.00',
            'net_amount' => '270.00',
            'status' => OwnerPayout::STATUS_PENDING,
        ]);
    }

    public function test_admin_can_mark_payout_paid(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'completed');

        $payout = OwnerPayout::create([
            'booking_id' => $booking->id,
            'owner_id' => $owner->id,
            'gross_amount' => 300.00,
            'commission_amount' => 30.00,
            'net_amount' => 270.00,
            'status' => OwnerPayout::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.payouts.mark-paid', ['payout' => $payout->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('owner_payouts', [
            'id' => $payout->id,
            'status' => OwnerPayout::STATUS_PAID,
        ]);

        $this->assertNotNull($payout->fresh()->paid_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'payout_paid',
            'related_id' => $payout->id,
        ]);
    }

    public function test_admin_payouts_index_lists_payouts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, 'completed');

        OwnerPayout::create([
            'booking_id' => $booking->id,
            'owner_id' => $owner->id,
            'gross_amount' => 300.00,
            'commission_amount' => 30.00,
            'net_amount' => 270.00,
            'status' => OwnerPayout::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.payouts.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('payouts.data', 1)
                ->where('payouts.data.0.booking_id', $booking->id));
    }

    public function test_non_admin_cannot_access_payouts(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);

        $this->actingAs($owner)
            ->get(route('admin.payouts.index'))
            ->assertForbidden();
    }
}
