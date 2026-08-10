<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EscalateLateReturnsTest extends TestCase
{
    use RefreshDatabase;

    private function createBooking(array $overrides = []): Booking
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ]);

        return Booking::create(array_merge([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(7)->toDateString(),
            'return_date' => now()->subDays(3)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => Booking::STATUS_PICKED_UP,
        ], $overrides));
    }

    public function test_command_notifies_customer_owner_and_admins_when_booking_is_overdue(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $booking = $this->createBooking();

        $this->artisan('bookings:escalate-late-returns')->assertSuccessful();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $booking->customer_id,
            'type' => 'late_return',
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $booking->owner_id,
            'type' => 'late_return',
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'type' => 'late_return',
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);
    }

    public function test_command_does_not_notify_when_booking_is_not_overdue(): void
    {
        $booking = $this->createBooking([
            'return_date' => now()->addDays(3)->toDateString(),
        ]);

        $this->artisan('bookings:escalate-late-returns')->assertSuccessful();

        $this->assertDatabaseMissing('notifications', [
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);
    }

    public function test_command_does_not_send_duplicate_notifications(): void
    {
        $booking = $this->createBooking();

        $this->artisan('bookings:escalate-late-returns')->assertSuccessful();
        $countAfterFirstRun = Notification::query()
            ->where('type', 'late_return')
            ->where('related_type', Booking::class)
            ->where('related_id', $booking->id)
            ->count();

        $this->artisan('bookings:escalate-late-returns')->assertSuccessful();
        $countAfterSecondRun = Notification::query()
            ->where('type', 'late_return')
            ->where('related_type', Booking::class)
            ->where('related_id', $booking->id)
            ->count();

        $this->assertGreaterThan(0, $countAfterFirstRun);
        $this->assertSame($countAfterFirstRun, $countAfterSecondRun);
    }
}
