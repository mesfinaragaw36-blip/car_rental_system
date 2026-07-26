<?php

namespace Tests\Feature\Customer;

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingSubmissionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create an approved, available car owned by the given user.
     */
    private function createCar(User $owner): Car
    {
        return Car::create([
            'owner_id' => $owner->id,
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2022,
            'plate_number' => fake()->unique()->bothify('??###'),
            'category' => 'Sedan',
            'color' => 'White',
            'fuel_type' => 'Petrol',
            'transmission' => 'Automatic',
            'engine_size' => '1.8L',
            'mileage' => 10000,
            'seats' => 5,
            'daily_price' => 100.00,
            'description' => 'Test car.',
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ]);
    }

    public function test_customer_can_submit_a_booking_request(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $response = $this
            ->actingAs($customer)
            ->post(route('customer.bookings.store', ['car' => $car]), [
                'pickup_date' => now()->addDays(2)->toDateString(),
                'return_date' => now()->addDays(5)->toDateString(),
                'pickup_location' => 'Bole, Addis Ababa',
                'return_location' => 'Bole, Addis Ababa',
                'need_driver' => false,
                'notes' => 'Please clean the car.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'status' => 'pending',
        ]);
    }

    public function test_booking_total_price_is_calculated_from_days_and_daily_price(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner); // daily_price = 100

        $this
            ->actingAs($customer)
            ->post(route('customer.bookings.store', ['car' => $car]), [
                'pickup_date' => now()->addDays(1)->toDateString(),
                'return_date' => now()->addDays(4)->toDateString(), // 3 days
                'pickup_location' => 'Addis Ababa',
                'return_location' => 'Addis Ababa',
                'need_driver' => false,
            ]);

        $booking = Booking::where('customer_id', $customer->id)->first();
        $this->assertNotNull($booking);
        $this->assertEquals('300.00', $booking->total_price);
    }

    public function test_customer_can_request_a_driver_with_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $this
            ->actingAs($customer)
            ->post(route('customer.bookings.store', ['car' => $car]), [
                'pickup_date' => now()->addDays(2)->toDateString(),
                'return_date' => now()->addDays(4)->toDateString(),
                'pickup_location' => 'Addis Ababa',
                'return_location' => 'Addis Ababa',
                'need_driver' => true,
            ]);

        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'need_driver' => true,
        ]);
    }

    public function test_booking_requires_pickup_and_return_dates(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $response = $this
            ->actingAs($customer)
            ->post(route('customer.bookings.store', ['car' => $car]), [
                'pickup_location' => 'Addis Ababa',
                'return_location' => 'Addis Ababa',
            ]);

        $response->assertSessionHasErrors(['pickup_date', 'return_date']);
        $this->assertDatabaseMissing('bookings', ['customer_id' => $customer->id]);
    }

    public function test_return_date_must_be_after_pickup_date(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $response = $this
            ->actingAs($customer)
            ->post(route('customer.bookings.store', ['car' => $car]), [
                'pickup_date' => now()->addDays(5)->toDateString(),
                'return_date' => now()->addDays(3)->toDateString(),
                'pickup_location' => 'Addis Ababa',
                'return_location' => 'Addis Ababa',
            ]);

        $response->assertSessionHasErrors(['return_date']);
        $this->assertDatabaseMissing('bookings', ['customer_id' => $customer->id]);
    }

    public function test_unauthenticated_user_cannot_submit_a_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $car = $this->createCar($owner);

        $response = $this->post(route('customer.bookings.store', ['car' => $car]), [
            'pickup_date' => now()->addDays(2)->toDateString(),
            'return_date' => now()->addDays(5)->toDateString(),
            'pickup_location' => 'Addis Ababa',
            'return_location' => 'Addis Ababa',
        ]);

        $response->assertRedirect('/login');
        $this->assertDatabaseMissing('bookings', ['car_id' => $car->id]);
    }

    public function test_customer_cannot_book_an_unavailable_car(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $car->update(['availability_status' => 'inactive']);

        $response = $this
            ->actingAs($customer)
            ->post(route('customer.bookings.store', ['car' => $car]), [
                'pickup_date' => now()->addDays(2)->toDateString(),
                'return_date' => now()->addDays(5)->toDateString(),
                'pickup_location' => 'Addis Ababa',
                'return_location' => 'Addis Ababa',
            ]);

        $response->assertNotFound();
        $this->assertDatabaseMissing('bookings', ['customer_id' => $customer->id]);
    }
}
