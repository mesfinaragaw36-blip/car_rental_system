<?php

namespace Tests\Feature\Driver;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentActionsTest extends TestCase
{
    use RefreshDatabase;

    private function createCar(User $owner): Car
    {
        return Car::create([
            'owner_id' => $owner->id,
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2022,
            'plate_number' => fake()->unique()->bothify('??-###'),
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

    private function createBooking(User $owner, User $customer, Car $car): Booking
    {
        return Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(2)->toDateString(),
            'return_date' => now()->addDays(5)->toDateString(),
            'pickup_location' => 'Addis Ababa',
            'return_location' => 'Addis Ababa',
            'need_driver' => true,
            'total_price' => 300.00,
            'status' => 'approved',
        ]);
    }

    private function createDriver(): User
    {
        $driver = User::factory()->create(['role' => 'driver']);
        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => fake()->bothify('DL-#####'),
            'experience_years' => 2,
            'availability' => 'available',
            'verification_status' => 'approved',
        ]);

        return $driver;
    }

    private function createAssignment(Booking $booking, User $driver, User $owner, string $status = 'assigned'): BookingDriver
    {
        return BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => $status,
        ]);
    }

    public function test_driver_can_accept_a_pending_assignment(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);
        $assignment = $this->createAssignment($booking, $driver, $owner);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.assignments.accept', ['assignment' => $assignment]));

        $response->assertRedirect();

        $this->assertDatabaseHas('booking_drivers', [
            'id' => $assignment->id,
            'status' => 'accepted',
        ]);
    }

    public function test_driver_can_complete_an_accepted_assignment(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);
        $assignment = $this->createAssignment($booking, $driver, $owner, 'accepted');

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.assignments.complete', ['assignment' => $assignment]));

        $response->assertRedirect();

        $this->assertDatabaseHas('booking_drivers', [
            'id' => $assignment->id,
            'status' => 'completed',
        ]);
    }

    public function test_driver_cannot_accept_another_drivers_assignment(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $otherDriver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);
        $assignment = $this->createAssignment($booking, $otherDriver, $owner);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.assignments.accept', ['assignment' => $assignment]));

        $response->assertForbidden();

        $this->assertDatabaseHas('booking_drivers', [
            'id' => $assignment->id,
            'status' => 'assigned',
        ]);
    }

    public function test_driver_cannot_complete_a_pending_assignment(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);
        $assignment = $this->createAssignment($booking, $driver, $owner, 'assigned');

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.assignments.complete', ['assignment' => $assignment]));

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseHas('booking_drivers', [
            'id' => $assignment->id,
            'status' => 'assigned',
        ]);
    }

    public function test_driver_cannot_accept_an_already_accepted_assignment(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);
        $assignment = $this->createAssignment($booking, $driver, $owner, 'accepted');

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.assignments.accept', ['assignment' => $assignment]));

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'error');
    }
}
