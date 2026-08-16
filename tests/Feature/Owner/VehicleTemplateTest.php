<?php

namespace Tests\Feature\Owner;

use App\Models\CarType;
use App\Models\OwnerProfile;
use App\Models\User;
use Database\Seeders\CarTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VehicleTemplateTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_page_lists_vehicle_templates(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);

        OwnerProfile::create([
            'user_id' => $owner->id,
            'business_name' => 'Test',
            'national_id' => '123',
            'verification_status' => 'approved',
        ]);

        CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2022,
            'categories' => ['Sedan'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Manual'],
            'engine_sizes' => ['1.8L'],
            'seats' => [5],
            'colors' => ['White', 'Black'],
        ]);

        $this->actingAs($owner)
            ->get(route('vehicles.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('create-vehicle')
                ->has('carTypes', 1)
                ->where('carTypes.0.brand', 'Toyota')
                ->where('carTypes.0.model', 'Corolla')
                ->where('carTypes.0.year', '2022')
                ->where('carTypes.0.categories.0', 'Sedan')
                ->where('carTypes.0.fuel_types.0', 'Petrol')
                ->where('carTypes.0.transmissions.0', 'Manual')
                ->where('carTypes.0.colors.0', 'White')
                ->has('locations'));
    }

    public function test_vehicle_template_seeder_seeds_known_models(): void
    {
        $this->seed(CarTypeSeeder::class);

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2022,
            'fuel_types' => json_encode(['Petrol']),
            'transmissions' => json_encode(['Manual', 'Automatic']),
        ]);

        $this->assertGreaterThan(30, CarType::count());
    }
}
