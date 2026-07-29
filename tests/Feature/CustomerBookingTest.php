<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_book_a_vehicle_with_valid_dates()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $this->actingAs($customer);

        $response = $this->post(route('cars.book', $car), [
            'pickup_date' => now()->addDays(2)->toDateString(),
            'return_date' => now()->addDays(4)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => true,
        ]);

        $response->assertRedirect(route('bookings.index'));
        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'car_id' => $car->id,
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => true,
            'total_price' => 200.00,
            'status' => 'pending',
        ]);
    }
}
