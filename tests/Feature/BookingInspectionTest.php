<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingInspectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_inspector_with_permission_can_view_inspections_page(): void
    {
        $role = Role::create(['name' => 'Inspector', 'permissions' => ['bookings.inspect']]);
        $inspector = User::factory()->create(['role' => 'admin', 'staff_role_id' => $role->id]);

        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(4)->toDateString(),
            'return_date' => now()->subDays(1)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'returned',
        ]);

        $response = $this->actingAs($inspector)->get('/inspections');

        $response->assertOk();
        $response->assertSee('Booking Inspections');
        $response->assertSee((string) $booking->id);
    }

    public function test_inspector_can_mark_returned_booking_as_completed(): void
    {
        $role = Role::create(['name' => 'Inspector', 'permissions' => ['bookings.inspect']]);
        $inspector = User::factory()->create(['role' => 'admin', 'staff_role_id' => $role->id]);

        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(4)->toDateString(),
            'return_date' => now()->subDays(1)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'returned',
        ]);

        $response = $this->actingAs($inspector)
            ->post(route('inspections.complete', ['booking' => $booking->id]));

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'completed',
        ]);
    }

    public function test_user_without_permission_cannot_access_inspections(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($user)->get('/inspections');

        $response->assertStatus(403);
    }
}
