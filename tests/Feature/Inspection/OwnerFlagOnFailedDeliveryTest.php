<?php

namespace Tests\Feature\Inspection;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerFlagOnFailedDeliveryTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function booking(User $owner, User $customer): Booking
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
            'status' => Booking::STATUS_DEPOSIT_PAID,
            'car_delivery_status' => Booking::CAR_DELIVERY_PENDING,
        ]);
    }

    public function test_owner_is_flagged_suspended_and_notified_on_failed_delivery(): void
    {
        $admin = $this->admin();
        $owner = User::factory()->create(['role' => 'owner', 'status' => 'active']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        $response = $this->actingAs($admin)
            ->post(route('inspections.delivery', ['booking' => $booking->id]), [
                'status' => Booking::CAR_DELIVERY_FAILED,
            ]);

        $response->assertRedirect();

        // Assert owner status is now suspended
        $this->assertEquals('suspended', $owner->fresh()->status);

        // Assert owner received account_suspended notification
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'account_suspended',
            'related_id' => $booking->id,
        ]);

        // Assert admins received notification with suspension details
        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'type' => 'delivery_escalated',
            'related_id' => $booking->id,
        ]);

        $adminNotification = Notification::where('user_id', $admin->id)
            ->where('type', 'delivery_escalated')
            ->first();

        $this->assertStringContainsString('suspended', $adminNotification->message);
    }
}
