<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\Location;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingDepositFlowTest extends TestCase
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

    public function test_booking_is_auto_confirmed_with_deposit_when_customer_books(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);
        $branch = Location::first() ?? Location::create(['name' => 'Bole Branch', 'address' => 'Bole', 'city' => 'Addis Ababa']);

        $response = $this->actingAs($customer)->post(route('cars.book', ['car' => $car->id]), [
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => false,
        ]);

        $response->assertRedirect(route('bookings.index'));

        $this->assertDatabaseHas('bookings', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'status' => Booking::STATUS_CONFIRMED,
            'total_price' => '300.00',
            'deposit_amount' => '500.00',
        ]);

        $booking = Booking::where('car_id', $car->id)->first();
        $this->assertNotNull($booking->deposit_hold_until);
    }

    public function test_overlapping_booking_is_rejected(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);
        $branch = Location::first() ?? Location::create(['name' => 'Bole Branch', 'address' => 'Bole', 'city' => 'Addis Ababa']);

        Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $response = $this->actingAs($customer)->post(route('cars.book', ['car' => $car->id]), [
            'pickup_date' => now()->addDays(4)->toDateString(),
            'return_date' => now()->addDays(5)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => false,
        ]);

        $response->assertSessionHas('toast');
        $this->assertSame(1, Booking::count());
    }

    public function test_customer_paying_deposit_locks_booking_and_notifies_owner(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);

        $booking = Booking::create([
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
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $response = $this->actingAs($customer)->post(route('payments.store', ['booking' => $booking->id]), [
            'payment_method' => 'Telebirr',
            'transaction_reference' => 'TX-123',
        ]);

        $response->assertRedirect(route('bookings.index'));

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => Booking::STATUS_DEPOSIT_PAID,
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'type' => 'booking_deposit',
            'amount' => '500.00',
            'payment_status' => 'paid',
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'booking_locked',
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);
    }

    public function test_deposit_cannot_be_paid_twice(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);

        $booking = Booking::create([
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
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        Payment::create([
            'booking_id' => $booking->id,
            'type' => 'booking_deposit',
            'amount' => 500.00,
            'payment_method' => 'Cash',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($customer)->post(route('payments.store', ['booking' => $booking->id]), [
            'payment_method' => 'Cash',
        ]);

        $response->assertSessionHas('toast');
        $this->assertSame(1, Payment::count());
    }

    public function test_expired_holds_are_released_by_scheduled_command(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);

        Booking::create([
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
            'deposit_hold_until' => now()->subHour(),
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $this->artisan('bookings:release-expired-holds')->assertSuccessful();

        $this->assertDatabaseHas('bookings', [
            'car_id' => $car->id,
            'status' => 'cancelled',
        ]);
    }
}
