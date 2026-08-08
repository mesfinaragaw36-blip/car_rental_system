<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDispute;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingDisputeTest extends TestCase
{
    use RefreshDatabase;

    private function car(User $owner): Car
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

        return $car;
    }

    private function booking(User $owner, User $customer, string $status): Booking
    {
        $car = $this->car($owner);

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
        ]);
    }

    public function test_customer_reports_owner_no_show_dispute(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($customer)->post(route('bookings.owner-no-show', ['booking' => $booking->id]));

        $this->assertDatabaseHas('booking_disputes', [
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'type' => 'owner_no_show',
            'description' => 'Owner did not deliver the car.',
            'status' => 'pending',
        ]);
    }

    public function test_customer_cannot_report_dispute_twice(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($customer)->post(route('bookings.owner-no-show', ['booking' => $booking->id]));
        $this->actingAs($customer)->post(route('bookings.owner-no-show', ['booking' => $booking->id]));

        $this->assertSame(1, BookingDispute::count());
    }

    public function test_non_customer_cannot_report_dispute(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $stranger = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $this->actingAs($stranger)->post(route('bookings.owner-no-show', ['booking' => $booking->id]))
            ->assertForbidden();

        $this->assertSame(0, BookingDispute::count());
    }

    public function test_admin_can_approve_dispute(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $dispute = BookingDispute::create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'type' => 'owner_no_show',
            'description' => 'Owner did not deliver the car.',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)->post(route('disputes.approve', ['dispute' => $dispute->id]));

        $this->assertDatabaseHas('booking_disputes', [
            'id' => $dispute->id,
            'status' => 'approved',
        ]);
    }

    public function test_admin_can_reject_dispute(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        $dispute = BookingDispute::create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'type' => 'owner_no_show',
            'description' => 'Owner did not deliver the car.',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)->post(route('disputes.reject', ['dispute' => $dispute->id]));

        $this->assertDatabaseHas('booking_disputes', [
            'id' => $dispute->id,
            'status' => 'rejected',
        ]);
    }

    public function test_non_admin_cannot_access_disputes_index(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)->get(route('disputes.index'))->assertForbidden();
    }

    public function test_admin_can_view_disputes_index(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer, Booking::STATUS_DEPOSIT_PAID);

        BookingDispute::create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'type' => 'owner_no_show',
            'description' => 'Owner did not deliver the car.',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)->get(route('disputes.index'))->assertOk();
    }
}
