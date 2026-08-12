<?php

namespace Tests\Feature\Driver;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignmentVisibilityTest extends TestCase
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

    private function createBooking(User $owner, User $customer, Car $car, array $overrides = []): Booking
    {
        return Booking::create(array_merge([
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
        ], $overrides));
    }

    private function createDriver(string $verificationStatus = 'approved'): User
    {
        $driver = User::factory()->driver()->create();

        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => fake()->bothify('DL-#####'),
            'experience_years' => 2,
            'availability' => 'available',
            'verification_status' => $verificationStatus,
        ]);

        return $driver;
    }

    private function assignDriver(Booking $booking, User $driver, User $assignedBy, string $status = 'assigned'): BookingDriver
    {
        return BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $assignedBy->id,
            'assigned_at' => now(),
            'status' => $status,
        ]);
    }

    public function test_driver_can_see_their_assignments_page(): void
    {
        $driver = $this->createDriver();

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('assignments'));
    }

    public function test_assignment_appears_after_owner_assigns_driver(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $this->assignDriver($booking, $driver, $owner);

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertOk();
        $response->assertInertia(function ($page) use ($booking) {
            $assignments = $page->toArray()['props']['assignments'];
            $this->assertCount(1, $assignments);
            $this->assertEquals($booking->id, $assignments[0]['booking']['id']);
        });
    }

    public function test_driver_sees_customer_name_and_vehicle_details(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer', 'name' => 'John Doe']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $this->assignDriver($booking, $driver, $owner);

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertInertia(function ($page) {
            $assignment = $page->toArray()['props']['assignments'][0];
            $this->assertEquals('John Doe', $assignment['customer']['name']);
            $this->assertEquals('Toyota', $assignment['car']['brand']);
            $this->assertEquals('Corolla', $assignment['car']['model']);
        });
    }

    public function test_driver_sees_all_relevant_statuses(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);

        $bookingA = $this->createBooking($owner, $customer, $car);
        $bookingB = $this->createBooking($owner, $customer, $car);
        $bookingC = $this->createBooking($owner, $customer, $car);

        $this->assignDriver($bookingA, $driver, $owner, 'assigned');
        $this->assignDriver($bookingB, $driver, $owner, 'accepted');
        $this->assignDriver($bookingC, $driver, $owner, 'completed');

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertInertia(function ($page) {
            $assignments = $page->toArray()['props']['assignments'];
            $this->assertCount(3, $assignments);
        });
    }

    public function test_driver_does_not_see_other_drivers_assignments(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $otherDriver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $this->assignDriver($booking, $otherDriver, $owner);

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertInertia(function ($page) {
            $assignments = $page->toArray()['props']['assignments'];
            $this->assertCount(0, $assignments);
        });
    }

    public function test_rejected_assignments_are_shown_in_history(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $driver = $this->createDriver();
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $this->assignDriver($booking, $driver, $owner, 'rejected');

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertInertia(function ($page) {
            $assignments = $page->toArray()['props']['assignments'];
            $this->assertCount(1, $assignments);
            $this->assertEquals('rejected', $assignments[0]['status']);
        });
    }

    public function test_pending_driver_gets_pending_verification_status(): void
    {
        $driver = $this->createDriver('pending');

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('assignments')
            ->where('driverVerificationStatus', 'pending'));
    }

    public function test_approved_driver_gets_approved_verification_status(): void
    {
        $driver = $this->createDriver('approved');

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('assignments')
            ->where('driverVerificationStatus', 'approved'));
    }

    public function test_driver_without_profile_gets_none_verification_status(): void
    {
        $driver = User::factory()->driver()->create();

        $response = $this->actingAs($driver)->get(route('assignments.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('assignments')
            ->where('driverVerificationStatus', 'none'));
    }

    public function test_non_drivers_get_null_verification_status(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer)->get(route('assignments.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('assignments')
            ->where('driverVerificationStatus', null));
    }
}
