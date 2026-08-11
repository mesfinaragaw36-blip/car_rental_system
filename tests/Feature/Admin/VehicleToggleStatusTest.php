<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleToggleStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_deactivate_an_active_vehicle(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = Car::factory()->create(['availability_status' => 'available']);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.toggle-status', $car));

        $response->assertRedirect();
        $this->assertDatabaseHas('cars', [
            'id' => $car->id,
            'availability_status' => 'inactive',
        ]);
    }

    public function test_admin_can_reactivate_an_inactive_vehicle(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = Car::factory()->create(['availability_status' => 'inactive']);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.toggle-status', $car));

        $response->assertRedirect();
        $this->assertDatabaseHas('cars', [
            'id' => $car->id,
            'availability_status' => 'available',
        ]);
    }

    public function test_admin_cannot_deactivate_vehicle_with_active_bookings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = Car::factory()->create(['availability_status' => 'available']);

        // Create an active booking
        Booking::create([
            'customer_id' => User::factory()->create()->id,
            'owner_id' => $car->owner_id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(1),
            'return_date' => now()->addDays(3),
            'pickup_location' => 'Branch A',
            'return_location' => 'Branch A',
            'status' => Booking::STATUS_DEPOSIT_PAID,
            'total_price' => 1000,
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.toggle-status', $car));

        $response->assertRedirect();
        $response->assertSessionHas('toast');

        $toast = session('toast');
        $this->assertEquals('error', $toast['type']);
        $this->assertEquals('Cannot deactivate a vehicle with active bookings.', $toast['message']);

        $this->assertDatabaseHas('cars', [
            'id' => $car->id,
            'availability_status' => 'available',
        ]);
    }
}
