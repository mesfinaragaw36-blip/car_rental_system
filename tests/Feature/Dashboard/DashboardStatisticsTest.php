<?php

namespace Tests\Feature\Dashboard;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardStatisticsTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function createCar(User $owner, array $overrides = []): Car
    {
        return Car::create(array_merge([
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
        ], $overrides));
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
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'pending',
        ], $overrides));
    }

    private function createPayment(Booking $booking, array $overrides = []): Payment
    {
        return Payment::create(array_merge([
            'booking_id' => $booking->id,
            'amount' => $booking->total_price,
            'payment_method' => 'Telebirr',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ], $overrides));
    }

    private function createDriver(): User
    {
        $role = \App\Models\Role::firstOrCreate(['name' => 'Driver'], ['permissions' => ['driver.access']]); $driver = User::factory()->create(['role' => 'admin', 'staff_role_id' => $role->id]);

        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => fake()->bothify('DL-#####'),
            'experience_years' => 2,
            'availability' => 'available',
            'verification_status' => 'approved',
        ]);

        return $driver;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    public function test_admin_sees_correct_total_user_count(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(3)->create(['role' => 'customer']);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page->where('stats.total_users', 4)
        );
    }

    public function test_admin_sees_correct_vehicle_and_pending_counts(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);

        $this->createCar($owner, ['approval_status' => 'approved']);
        $this->createCar($owner, ['approval_status' => 'pending']);
        $this->createCar($owner, ['approval_status' => 'pending']);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertInertia(fn ($page) => $page
            ->where('stats.total_vehicles', 3)
            ->where('stats.pending_vehicles', 2)
        );
    }

    public function test_admin_sees_correct_booking_count(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $this->createBooking($owner, $customer, $car);
        $this->createBooking($owner, $customer, $car, ['status' => 'approved']);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.total_bookings', 2)
        );
    }

    public function test_admin_sees_only_paid_revenue(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $paid = $this->createBooking($owner, $customer, $car, ['total_price' => 200.00]);
        $pending = $this->createBooking($owner, $customer, $car, ['total_price' => 500.00]);

        $this->createPayment($paid, ['amount' => 200.00, 'payment_status' => 'paid']);
        $this->createPayment($pending, ['amount' => 500.00, 'payment_status' => 'pending']);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.total_revenue', '200.00')
        );
    }

    // ─── Owner ────────────────────────────────────────────────────────────────

    public function test_owner_sees_only_their_own_vehicle_count(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $otherOwner = User::factory()->create(['role' => 'owner']);

        $this->createCar($owner);
        $this->createCar($owner);
        $this->createCar($otherOwner);

        $response = $this->actingAs($owner)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.total_vehicles', 2)
        );
    }

    public function test_owner_sees_only_their_own_active_bookings(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);

        $ownCar = $this->createCar($owner);
        $otherCar = $this->createCar($otherOwner);

        $this->createBooking($owner, $customer, $ownCar, ['status' => 'deposit_paid']);
        $this->createBooking($owner, $customer, $ownCar, ['status' => 'picked_up']);
        $this->createBooking($otherOwner, $customer, $otherCar, ['status' => 'deposit_paid']);

        $response = $this->actingAs($owner)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.active_bookings', 2)
        );
    }

    public function test_owner_sees_only_their_own_earnings(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $otherOwner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);

        $ownCar = $this->createCar($owner);
        $otherCar = $this->createCar($otherOwner);

        $ownBooking = $this->createBooking($owner, $customer, $ownCar, ['total_price' => 300.00, 'status' => 'paid']);
        $otherBooking = $this->createBooking($otherOwner, $customer, $otherCar, ['total_price' => 500.00, 'status' => 'paid']);

        $this->createPayment($ownBooking, ['amount' => 300.00]);
        $this->createPayment($otherBooking, ['amount' => 500.00]);

        $response = $this->actingAs($owner)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.total_earnings', '300.00')
        );
    }

    // ─── Customer ─────────────────────────────────────────────────────────────

    public function test_customer_sees_correct_active_booking_count(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $this->createBooking($owner, $customer, $car, ['status' => 'confirmed']);
        $this->createBooking($owner, $customer, $car, ['status' => 'deposit_paid']);
        $this->createBooking($owner, $customer, $car, ['status' => 'completed']);

        $response = $this->actingAs($customer)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.active_bookings', 2)
        );
    }

    public function test_customer_sees_correct_past_booking_count(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $this->createBooking($owner, $customer, $car, ['status' => 'completed']);
        $this->createBooking($owner, $customer, $car, ['status' => 'returned']);
        $this->createBooking($owner, $customer, $car, ['status' => 'pending']);

        $response = $this->actingAs($customer)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.past_bookings', 2)
        );
    }

    public function test_customer_sees_upcoming_returns_sorted_by_date(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $this->createBooking($owner, $customer, $car, [
            'status' => 'deposit_paid',
            'return_date' => now()->addDays(10)->toDateString(),
        ]);
        $this->createBooking($owner, $customer, $car, [
            'status' => 'deposit_paid',
            'return_date' => now()->addDays(3)->toDateString(),
        ]);

        $response = $this->actingAs($customer)->get(route('dashboard'));

        $response->assertInertia(function ($page) {
            $returns = $page->toArray()['props']['stats']['upcoming_returns'];
            $this->assertCount(2, $returns);
            $this->assertLessThan($returns[1]['return_date'], $returns[0]['return_date']);
        });
    }

    public function test_customer_upcoming_returns_limited_to_five(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        for ($i = 1; $i <= 7; $i++) {
            $this->createBooking($owner, $customer, $car, [
                'status' => 'deposit_paid',
                'return_date' => now()->addDays($i + 1)->toDateString(),
            ]);
        }

        $response = $this->actingAs($customer)->get(route('dashboard'));

        $response->assertInertia(function ($page) {
            $returns = $page->toArray()['props']['stats']['upcoming_returns'];
            $this->assertCount(5, $returns);
        });
    }

    // ─── Driver ───────────────────────────────────────────────────────────────

    public function test_driver_sees_correct_pending_assignment_count(): void
    {
        $driver = $this->createDriver();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $bookingA = $this->createBooking($owner, $customer, $car, ['status' => 'approved']);
        $bookingB = $this->createBooking($owner, $customer, $car, ['status' => 'approved']);

        BookingDriver::create([
            'booking_id' => $bookingA->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);
        BookingDriver::create([
            'booking_id' => $bookingB->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'accepted',
        ]);

        $response = $this->actingAs($driver)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.pending_assignments', 1)
        );
    }

    public function test_driver_sees_correct_active_trip_count(): void
    {
        $driver = $this->createDriver();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $bookingA = $this->createBooking($owner, $customer, $car, ['status' => 'picked_up']);
        $bookingB = $this->createBooking($owner, $customer, $car, ['status' => 'picked_up']);

        BookingDriver::create([
            'booking_id' => $bookingA->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'accepted',
        ]);
        BookingDriver::create([
            'booking_id' => $bookingB->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'accepted',
        ]);

        $response = $this->actingAs($driver)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.active_trips', 2)
        );
    }

    public function test_driver_sees_correct_completed_trip_count(): void
    {
        $driver = $this->createDriver();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $booking = $this->createBooking($owner, $customer, $car, ['status' => 'completed']);

        BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'completed',
        ]);

        $response = $this->actingAs($driver)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.completed_trips', 1)
        );
    }

    public function test_driver_does_not_see_other_drivers_assignments(): void
    {
        $driver = $this->createDriver();
        $otherDriver = $this->createDriver();
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);

        $booking = $this->createBooking($owner, $customer, $car, ['status' => 'approved']);

        BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $otherDriver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        $response = $this->actingAs($driver)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('stats.pending_assignments', 0)
        );
    }
}
