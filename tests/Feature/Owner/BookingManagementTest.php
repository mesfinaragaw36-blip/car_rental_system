<?php

namespace Tests\Feature\Owner;

use App\Models\Booking;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Create a car owned by the given user.
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

    /**
     * Create a booking for the given owner's car.
     *
     * @param  array<string, mixed>  $overrides
     */
    private function createBooking(User $owner, User $customer, Car $car, array $overrides = []): Booking
    {
        return Booking::create(array_merge([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_location' => 'Addis Ababa',
            'return_location' => 'Addis Ababa',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'pending',
        ], $overrides));
    }

    /**
     * Create an approved and available driver with a profile.
     */
    private function createAvailableDriver(): User
    {
        $driver = User::factory()->driver()->create();

        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => fake()->bothify('DL-#####'),
            'experience_years' => 3,
            'availability' => 'available',
            'verification_status' => 'approved',
        ]);

        return $driver;
    }

    public function test_owner_can_view_only_their_own_bookings(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);

        $ownedCar = $this->createCar($owner);
        $otherCar = $this->createCar($otherOwner);

        $ownedBooking = $this->createBooking($owner, $customer, $ownedCar);
        $otherBooking = $this->createBooking($otherOwner, $customer, $otherCar);

        $response = $this->actingAs($owner)->get(route('bookings.index'));

        $response->assertOk();

        $bookings = collect($response->original->getData()['page']['props']['bookings']['data'] ?? $response->original->getData()['page']['props']['bookings']);

        $this->assertTrue($bookings->contains('id', $ownedBooking->id));
        $this->assertFalse($bookings->contains('id', $otherBooking->id));
    }

    public function test_owner_can_approve_a_pending_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($owner)
            ->post(route('bookings.approve', $booking));

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'approved',
        ]);
    }

    public function test_owner_can_reject_a_pending_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($owner)
            ->post(route('bookings.reject', $booking));

        $response->assertRedirect();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'rejected',
        ]);
    }

    public function test_owner_cannot_approve_another_owners_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($otherOwner);
        $booking = $this->createBooking($otherOwner, $customer, $car);

        $response = $this
            ->actingAs($owner)
            ->post(route('bookings.approve', $booking));

        $response->assertForbidden();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'pending',
        ]);
    }

    public function test_owner_cannot_reject_another_owners_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($otherOwner);
        $booking = $this->createBooking($otherOwner, $customer, $car);

        $response = $this
            ->actingAs($owner)
            ->post(route('bookings.reject', $booking));

        $response->assertForbidden();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'pending',
        ]);
    }

    public function test_owner_cannot_approve_an_already_approved_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car, ['status' => 'approved']);

        $response = $this
            ->actingAs($owner)
            ->post(route('bookings.approve', $booking));

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'error');
    }

    public function test_owner_can_assign_a_driver_when_one_was_requested(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car, ['need_driver' => true]);
        $driver = $this->createAvailableDriver();

        $response = $this
            ->actingAs($owner)
            ->post(route('bookings.assign-driver', $booking), [
                'driver_id' => $driver->id,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('booking_drivers', [
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
        ]);
    }

    public function test_owner_cannot_assign_a_driver_when_none_was_requested(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car, ['need_driver' => false]);
        $driver = $this->createAvailableDriver();

        $response = $this
            ->actingAs($owner)
            ->post(route('bookings.assign-driver', $booking), [
                'driver_id' => $driver->id,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseMissing('booking_drivers', [
            'booking_id' => $booking->id,
        ]);
    }
}
