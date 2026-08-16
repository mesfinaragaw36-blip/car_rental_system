<?php

namespace Tests\Feature\Owner;

use App\Models\Car;
use App\Models\CarType;
use App\Models\OwnerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleConfigValidationTest extends TestCase
{
    use RefreshDatabase;

    private function approvedOwner(): User
    {
        $owner = User::factory()->create(['role' => 'owner']);

        OwnerProfile::create([
            'user_id' => $owner->id,
            'business_name' => 'Test Rentals',
            'national_id' => 'OWNER-ID-001',
            'verification_status' => 'approved',
        ]);

        return $owner;
    }

    public function test_owner_submission_without_a_configuration_becomes_a_pending_request(): void
    {
        $owner = $this->approvedOwner();

        $response = $this->actingAs($owner)->post(route('vehicles.store'), [
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => 2024,
            'plate_number' => 'NOTFND1',
            'category' => 'Sedan',
            'color' => 'White',
            'fuel_type' => 'Electric',
            'transmission' => 'Automatic',
            'engine_size' => '1.8L',
            'mileage' => 10000,
            'seats' => 5,
            'daily_price' => 5000,
        ]);

        $response->assertRedirect(route('vehicles.index'));
        $response->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseMissing('cars', ['plate_number' => 'NOTFND1']);

        $this->assertDatabaseHas('car_type_requests', [
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'plate_number' => 'NOTFND1',
            'status' => 'pending',
        ]);
    }

    public function test_owner_submission_outside_the_configuration_year_range_becomes_a_pending_request(): void
    {
        $owner = $this->approvedOwner();

        CarType::create([
            'brand' => 'Toyota',
            'model' => 'Vitz',
            'year' => 2012,
            'categories' => ['Hatchback'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Manual'],
            'engine_sizes' => ['1.0L'],
            'seats' => [5],
        ]);

        $response = $this->actingAs($owner)->post(route('vehicles.store'), [
            'brand' => 'Toyota',
            'model' => 'Vitz',
            'year' => 2024,
            'plate_number' => 'YEAR2024',
            'category' => 'Hatchback',
            'color' => 'Red',
            'fuel_type' => 'Petrol',
            'transmission' => 'Manual',
            'engine_size' => '1.0L',
            'mileage' => 20000,
            'seats' => 5,
            'daily_price' => 2000,
        ]);

        $response->assertRedirect(route('vehicles.index'));
        $response->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseMissing('cars', ['plate_number' => 'YEAR2024']);

        $this->assertDatabaseHas('car_type_requests', [
            'requested_by' => $owner->id,
            'brand' => 'Toyota',
            'model' => 'Vitz',
            'year' => '2024',
            'plate_number' => 'YEAR2024',
            'status' => 'pending',
        ]);
    }

    public function test_owner_can_register_a_car_matching_an_admin_configuration(): void
    {
        $owner = $this->approvedOwner();

        CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2023,
            'categories' => ['Sedan'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Automatic'],
            'engine_sizes' => ['1.8L'],
            'seats' => [5],
        ]);

        $response = $this->actingAs($owner)->post(route('vehicles.store'), [
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2023,
            'plate_number' => 'CONFOK1',
            'category' => 'Sedan',
            'color' => 'White',
            'fuel_type' => 'Petrol',
            'transmission' => 'Automatic',
            'engine_size' => '1.8L',
            'mileage' => 5000,
            'seats' => 5,
            'daily_price' => 3000,
        ]);

        $response->assertRedirect(route('vehicles.index'));

        $this->assertDatabaseHas('cars', [
            'owner_id' => $owner->id,
            'plate_number' => 'CONFOK1',
            'approval_status' => 'pending',
        ]);
    }

    public function test_owner_editing_a_car_to_an_unregistered_configuration_creates_a_request(): void
    {
        $owner = $this->approvedOwner();

        $car = Car::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2023,
            'plate_number' => 'EDITREQ1',
            'category' => 'Sedan',
            'color' => 'White',
            'fuel_type' => 'Petrol',
            'transmission' => 'Automatic',
            'daily_price' => 3000,
            'engine_size' => '1.8L',
            'mileage' => 5000,
            'seats' => 5,
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ]);

        $this->actingAs($owner)->put(route('vehicles.update', $car), [
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => 2024,
            'plate_number' => 'EDITREQ1',
            'category' => 'Sedan',
            'color' => 'White',
            'fuel_type' => 'Electric',
            'transmission' => 'Automatic',
            'engine_size' => 'N/A',
            'mileage' => 10000,
            'seats' => 5,
            'daily_price' => 5000,
        ])->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('car_type_requests', [
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'plate_number' => 'EDITREQ1',
            'status' => 'pending',
        ]);

        $car->refresh();
        $this->assertSame('Toyota', $car->brand);
        $this->assertSame('approved', $car->approval_status);
    }
}
