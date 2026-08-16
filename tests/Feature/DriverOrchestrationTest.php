<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CustomerIdentity;
use App\Models\DriverProfile;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverOrchestrationTest extends TestCase
{
    use RefreshDatabase;

    private function createCar(User $owner): Car
    {
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
        ]);

        return $car;
    }

    private function createDriver(array $overrides = [], float $dailyRate = 0.0): User
    {
        $driver = User::factory()->create(array_merge(['role' => 'driver'], $overrides));

        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => fake()->bothify('DL-#####'),
            'experience_years' => 2,
            'daily_rate' => $dailyRate,
            'availability' => 'available',
            'verification_status' => 'approved',
        ]);

        return $driver;
    }

    private function bookChauffeur(Car $car, User $customer, array $overrides = [])
    {
        $branch = Location::first() ?? Location::create(['name' => 'Bole Branch', 'address' => 'Bole Road', 'city' => 'Addis Ababa']);

        CustomerIdentity::updateOrCreate(
            ['user_id' => $customer->id],
            [
                'national_id_number' => fake()->numerify('##############'),
                'verification_status' => 'approved',
                'verified_at' => now(),
            ]
        );

        return $this->actingAs($customer)
            ->post(route('cars.book', $car), array_merge([
                'pickup_date' => now()->addDays(2)->toDateString(),
                'return_date' => now()->addDays(5)->toDateString(),
                'pickup_branch_id' => $branch->id,
                'return_branch_id' => $branch->id,
                'need_driver' => true,
            ], $overrides));
    }

    public function test_auto_assigns_eligible_driver_and_notifies_when_chauffeur_booked(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $driver = $this->createDriver();

        $this->bookChauffeur($car, $customer)->assertRedirect();

        $booking = Booking::where('customer_id', $customer->id)->first();

        $this->assertDatabaseHas('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $customer->id,
            'status' => BookingDriver::STATUS_ASSIGNED,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $driver->id,
            'type' => 'trip_assigned',
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);
    }

    public function test_no_assignment_created_without_chauffeur_request(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $this->createDriver();

        $this->bookChauffeur($car, $customer, ['need_driver' => false])->assertRedirect();

        $this->assertDatabaseCount('booking_drivers', 0);
    }

    public function test_escalates_to_admin_when_no_driver_is_eligible(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        User::factory()->create(['role' => 'driver']);
        $pendingDriver = $this->createDriver();
        $pendingDriver->driverProfile->update(['verification_status' => 'pending']);
        $suspendedDriver = $this->createDriver();
        $suspendedDriver->update(['status' => 'suspended']);

        $this->bookChauffeur($car, $customer)->assertRedirect();

        $booking = Booking::where('customer_id', $customer->id)->first();

        $this->assertDatabaseCount('booking_drivers', 0);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'type' => 'driver_escalation',
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);
    }

    public function test_skips_driver_with_overlapping_assignment(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $otherCar = $this->createCar($owner);

        $busyDriver = $this->createDriver();
        $freeDriver = $this->createDriver();

        $existingBooking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $otherCar->id,
            'pickup_date' => now()->addDays(1)->toDateString(),
            'return_date' => now()->addDays(4)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => true,
            'total_price' => 300.00,
            'status' => 'confirmed',
        ]);

        BookingDriver::create([
            'booking_id' => $existingBooking->id,
            'driver_id' => $busyDriver->id,
            'assigned_by' => null,
            'assigned_at' => now(),
            'status' => BookingDriver::STATUS_ACCEPTED,
        ]);

        $this->bookChauffeur($car, $customer)->assertRedirect();

        $booking = Booking::where('customer_id', $customer->id)->latest('id')->first();

        $this->assertDatabaseHas('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $freeDriver->id,
            'status' => BookingDriver::STATUS_ASSIGNED,
        ]);

        $this->assertDatabaseMissing('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $busyDriver->id,
        ]);
    }

    public function test_decline_reassigns_to_next_candidate(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $firstDriver = $this->createDriver();
        $secondDriver = $this->createDriver();

        $this->bookChauffeur($car, $customer)->assertRedirect();

        $booking = Booking::where('customer_id', $customer->id)->first();

        $this->assertDatabaseHas('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $firstDriver->id,
            'status' => BookingDriver::STATUS_ASSIGNED,
        ]);

        $this->actingAs($firstDriver)
            ->post(route('driver.assignments.reject', ['assignment' => BookingDriver::where('booking_id', $booking->id)->first()]), ['rejection_reason' => 'Not available'])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $firstDriver->id,
            'status' => BookingDriver::STATUS_REJECTED,
        ]);

        $this->assertDatabaseHas('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $secondDriver->id,
            'status' => BookingDriver::STATUS_ASSIGNED,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $secondDriver->id,
            'type' => 'trip_assigned',
            'related_id' => $booking->id,
        ]);
    }

    public function test_decline_escalates_to_admin_when_no_candidate_remains(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $driver = $this->createDriver();

        $this->bookChauffeur($car, $customer)->assertRedirect();

        $booking = Booking::where('customer_id', $customer->id)->first();

        $this->actingAs($driver)
            ->post(route('driver.assignments.reject', ['assignment' => BookingDriver::where('booking_id', $booking->id)->first()]), ['rejection_reason' => 'Not available'])
            ->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $admin->id,
            'type' => 'driver_escalation',
            'related_type' => Booking::class,
            'related_id' => $booking->id,
        ]);

        $this->assertSame(0, BookingDriver::where('booking_id', $booking->id)->where('status', BookingDriver::STATUS_ASSIGNED)->count());
    }

    public function test_driver_accept_after_auto_assign_marks_assignment_accepted(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $driver = $this->createDriver();

        $this->bookChauffeur($car, $customer)->assertRedirect();

        $booking = Booking::where('customer_id', $customer->id)->first();

        $this->actingAs($driver)
            ->post(route('driver.assignments.accept', ['assignment' => BookingDriver::where('booking_id', $booking->id)->first()]))
            ->assertRedirect();

        $this->assertDatabaseHas('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'status' => BookingDriver::STATUS_ACCEPTED,
        ]);
    }
}
