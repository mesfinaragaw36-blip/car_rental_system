<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CarAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    private function car(User $owner): Car
    {
        return Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);
    }

    private function availablePeriod(Car $car, string $start, string $end): CarAvailablePeriod
    {
        return CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => $start,
            'end_date' => $end,
        ]);
    }

    private function createBranch(): Location
    {
        return Location::create(['name' => 'Bole Branch', 'address' => 'Bole Road', 'city' => 'Addis Ababa']);
    }

    public function test_owner_can_pause_vehicle_and_it_leaves_browse(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);
        $this->availablePeriod($car, now()->addDays(1)->toDateString(), now()->addDays(30)->toDateString());

        $this->actingAs($owner)->post(route('vehicles.toggle-availability', ['car' => $car->id]));

        $this->assertDatabaseHas('cars', ['id' => $car->id, 'availability_status' => 'maintenance']);

        $this->actingAs($customer)
            ->get(route('cars.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('cars', function ($cars) use ($car) {
                    foreach ($cars as $item) {
                        if ($item['id'] === $car->id) {
                            return false;
                        }
                    }

                    return true;
                }));
    }

    public function test_car_without_available_ranges_is_hidden_from_browse(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $hidden = $this->car($owner);
        $visible = $this->car($owner);
        $this->availablePeriod($visible, now()->addDays(1)->toDateString(), now()->addDays(30)->toDateString());

        $this->actingAs($customer)
            ->get(route('cars.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('cars', function ($cars) use ($hidden, $visible) {
                    $visibleFound = false;

                    foreach ($cars as $item) {
                        if ($item['id'] === $hidden->id) {
                            return false;
                        }

                        if ($item['id'] === $visible->id) {
                            $visibleFound = true;
                        }
                    }

                    return $visibleFound;
                }));
    }

    public function test_paused_vehicle_cannot_be_booked(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);
        $branch = $this->createBranch();
        $car->update(['availability_status' => 'maintenance']);

        $response = $this->actingAs($customer)->post(route('cars.book', ['car' => $car->id]), [
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => false,
        ]);

        $response->assertNotFound();
        $this->assertSame(0, Booking::count());
    }

    public function test_owner_can_resume_paused_vehicle(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $car = $this->car($owner);
        $car->update(['availability_status' => 'maintenance']);

        $this->actingAs($owner)->post(route('vehicles.toggle-availability', ['car' => $car->id]));

        $this->assertDatabaseHas('cars', ['id' => $car->id, 'availability_status' => 'available']);
    }

    public function test_non_owner_cannot_pause_vehicle(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $other = User::factory()->create(['role' => 'owner']);
        $car = $this->car($owner);

        $response = $this->actingAs($other)->post(route('vehicles.toggle-availability', ['car' => $car->id]));

        $response->assertForbidden();
        $this->assertDatabaseHas('cars', ['id' => $car->id, 'availability_status' => 'available']);
    }

    public function test_owner_can_add_available_date_range(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $car = $this->car($owner);

        $this->actingAs($owner)->post(route('vehicles.available-periods.store', ['car' => $car->id]), [
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(15)->toDateString(),
        ]);

        $period = CarAvailablePeriod::where('car_id', $car->id)->first();

        $this->assertNotNull($period);
        $this->assertSame(now()->addDays(5)->toDateString(), $period->start_date->toDateString());
        $this->assertSame(now()->addDays(15)->toDateString(), $period->end_date->toDateString());
    }

    public function test_booking_outside_available_range_is_rejected(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);
        $branch = $this->createBranch();

        $this->availablePeriod($car, now()->addDays(10)->toDateString(), now()->addDays(12)->toDateString());

        $response = $this->actingAs($customer)->post(route('cars.book', ['car' => $car->id]), [
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => false,
        ]);

        $response->assertSessionHas('toast');
        $this->assertSame(0, Booking::count());
    }

    public function test_booking_partially_outside_available_range_is_rejected(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);
        $branch = $this->createBranch();

        $this->availablePeriod($car, now()->addDays(4)->toDateString(), now()->addDays(8)->toDateString());

        $response = $this->actingAs($customer)->post(route('cars.book', ['car' => $car->id]), [
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => false,
        ]);

        $response->assertSessionHas('toast');
        $this->assertSame(0, Booking::count());
    }

    public function test_booking_within_available_range_is_allowed(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->car($owner);
        $branch = $this->createBranch();

        $this->availablePeriod($car, now()->addDays(1)->toDateString(), now()->addDays(30)->toDateString());

        $response = $this->actingAs($customer)->post(route('cars.book', ['car' => $car->id]), [
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => false,
        ]);

        $response->assertRedirect(route('bookings.index'));
        $this->assertDatabaseHas('bookings', [
            'car_id' => $car->id,
            'customer_id' => $customer->id,
            'status' => Booking::STATUS_CONFIRMED,
            'pickup_location' => $branch->name.', '.$branch->city,
            'return_location' => $branch->name.', '.$branch->city,
        ]);
    }

    public function test_overlapping_available_ranges_are_rejected(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $car = $this->car($owner);

        $this->availablePeriod($car, now()->addDays(4)->toDateString(), now()->addDays(8)->toDateString());

        $response = $this->actingAs($owner)->post(route('vehicles.available-periods.store', ['car' => $car->id]), [
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
        ]);

        $response->assertSessionHas('toast');
        $this->assertSame(1, CarAvailablePeriod::count());
    }

    public function test_owner_can_remove_available_range(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $car = $this->car($owner);

        $period = $this->availablePeriod($car, now()->addDays(4)->toDateString(), now()->addDays(8)->toDateString());

        $this->actingAs($owner)->delete(route('vehicles.available-periods.destroy', ['car' => $car->id, 'availablePeriod' => $period->id]));

        $this->assertDatabaseMissing('car_available_periods', ['id' => $period->id]);
    }
}
