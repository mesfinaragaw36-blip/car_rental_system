<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\Location;
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

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
        ]);

        $this->actingAs($customer);

        $branch = Location::create(['name' => 'Airport Branch', 'address' => 'Airport Road', 'city' => 'Addis Ababa']);

        $response = $this->post(route('cars.book', $car), [
            'pickup_date' => now()->addDays(2)->toDateString(),
            'return_date' => now()->addDays(4)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => true,
        ]);

        $response->assertRedirect(route('bookings.index'));
        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'car_id' => $car->id,
            'pickup_location' => $branch->name.', '.$branch->city,
            'return_location' => $branch->name.', '.$branch->city,
            'need_driver' => true,
            'total_price' => 200.00,
            'deposit_amount' => 500.00,
            'status' => 'confirmed',
        ]);
    }
}
