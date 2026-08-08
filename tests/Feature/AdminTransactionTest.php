<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\OwnerPayout;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminTransactionTest extends TestCase
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

    public function test_admin_transactions_index_lists_all_transaction_types(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = User::factory()->create(['role' => 'driver']);

        $refundBooking = $this->booking($owner, $customer, 'completed');
        Refund::create([
            'booking_id' => $refundBooking->id,
            'amount' => 500.00,
            'reason' => 'Security deposit refund after a successful return.',
        ]);

        $payoutBooking = $this->booking($owner, $customer, 'completed');
        OwnerPayout::create([
            'booking_id' => $payoutBooking->id,
            'owner_id' => $owner->id,
            'gross_amount' => 300.00,
            'commission_amount' => 30.00,
            'net_amount' => 270.00,
            'status' => OwnerPayout::STATUS_PENDING,
        ]);

        $driverBooking = $this->booking($owner, $customer, 'completed');
        BookingDriver::create([
            'booking_id' => $driverBooking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => BookingDriver::STATUS_ACCEPTED,
            'earnings' => 600.00,
            'payout_status' => BookingDriver::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.transactions.index'))
            ->assertOk()
            ->assertInertia(function (Assert $page) {
                $page->has('transactions.data', 3)->where('transactions.total', 3);

                $types = array_column($page->toArray()['props']['transactions']['data'], 'type');
                $this->assertContains('refund', $types);
                $this->assertContains('owner_payout', $types);
                $this->assertContains('driver_payout', $types);
            });
    }

    public function test_admin_transactions_index_filters_by_type(): void
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

        Refund::create([
            'booking_id' => $booking->id,
            'amount' => 500.00,
            'reason' => 'Full security deposit refund after a successful return.',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.transactions.index', ['type' => 'owner_payout']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 1)
                ->where('transactions.data.0.type', 'owner_payout'));
    }

    public function test_admin_can_mark_driver_payout_paid(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = User::factory()->create(['role' => 'driver']);

        $booking = $this->booking($owner, $customer, 'completed');
        $assignment = BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => BookingDriver::STATUS_ACCEPTED,
            'earnings' => 600.00,
            'payout_status' => BookingDriver::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.transactions.driver-payouts.mark-paid', ['assignment' => $assignment->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('booking_drivers', [
            'id' => $assignment->id,
            'payout_status' => BookingDriver::STATUS_PAID,
        ]);

        $this->assertNotNull($assignment->fresh()->paid_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $driver->id,
            'type' => 'payout_paid',
            'related_id' => $assignment->id,
        ]);
    }

    public function test_admin_can_process_refund(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);

        $booking = $this->booking($owner, $customer, 'completed');

        $refund = Refund::create([
            'booking_id' => $booking->id,
            'amount' => 500.00,
            'reason' => 'Security deposit refund after a successful return.',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.transactions.refunds.process', ['refund' => $refund->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('refunds', [
            'id' => $refund->id,
            'status' => 'processed',
            'processed_by' => $admin->id,
        ]);

        $this->assertNotNull($refund->fresh()->processed_at);
    }

    public function test_admin_can_mark_owner_payout_paid(): void
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
            ->post(route('admin.transactions.owner-payouts.mark-paid', ['payout' => $payout->id]))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('owner_payouts', [
            'id' => $payout->id,
            'status' => OwnerPayout::STATUS_PAID,
        ]);

        $this->assertNotNull($payout->fresh()->paid_at);
    }

    public function test_non_admin_cannot_access_transactions(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);

        $this->actingAs($owner)
            ->get(route('admin.transactions.index'))
            ->assertForbidden();
    }
}
