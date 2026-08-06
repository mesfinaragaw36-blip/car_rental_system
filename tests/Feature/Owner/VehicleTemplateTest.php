<?php

namespace Tests\Feature\Owner;

use App\Models\CarType;
use App\Models\CarTypeName;
use App\Models\User;
use Database\Seeders\CarTypeNameSeeder;
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

        $sedan = CarTypeName::create(['name' => 'Sedan', 'slug' => 'sedan', 'sort_order' => 1]);

        CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'car_type_name_id' => $sedan->id,
            'fuel_type' => 'Petrol',
            'transmission' => 'Manual',
            'engine_size' => '1.8L',
            'seats' => 5,
        ]);

        $this->actingAs($owner)
            ->get(route('vehicles.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('create-vehicle')
                ->has('carTypes', 1)
                ->where('carTypes.0.brand', 'Toyota')
                ->where('carTypes.0.model', 'Corolla')
                ->where('carTypes.0.car_type_name.name', 'Sedan')
                ->has('locations'));
    }

    public function test_vehicle_template_seeder_seeds_known_models(): void
    {
        $this->seed(CarTypeNameSeeder::class);
        $this->seed(CarTypeSeeder::class);

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'fuel_type' => 'Petrol',
            'transmission' => 'Manual',
        ]);

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Toyota',
            'model' => 'Land Cruiser',
            'car_type_name_id' => CarTypeName::where('name', 'SUV')->value('id'),
        ]);

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Toyota',
            'model' => 'Vitz',
            'car_type_name_id' => CarTypeName::where('name', 'Hatchback')->value('id'),
        ]);

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Toyota',
            'model' => 'Probox',
            'car_type_name_id' => CarTypeName::where('name', 'Van')->value('id'),
        ]);

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Haval',
            'model' => 'Jolion',
            'car_type_name_id' => CarTypeName::where('name', 'SUV')->value('id'),
        ]);

        $this->assertGreaterThan(30, CarType::count());
    }
}
