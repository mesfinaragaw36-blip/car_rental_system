<?php

namespace Tests\Feature\Admin;

use App\Models\CarType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCarTypeManageTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_configurations_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => '2022',
            'categories' => ['Sedan'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Automatic'],
            'engine_sizes' => ['1.8L'],
            'seats' => [5],
        ]);

        $this->actingAs($admin)
            ->get(route('admin.car-types.configurations'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/car-types/configurations')
                ->has('items', 1)
                ->where('items.0.brand', 'Toyota')
                ->where('items.0.model', 'Corolla')
                ->where('items.0.year', '2022'));
    }

    public function test_admin_can_create_a_configuration(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.store'), [
                'brand' => 'Toyota',
                'model' => 'RAV4',
                'year_start' => '2023',
                'categories' => ['SUV'],
                'fuel_types' => ['Petrol'],
                'transmissions' => ['Automatic'],
                'engine_sizes' => ['2.0L'],
                'seats' => [5],
                'colors' => ['White', 'Black'],
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.car-types.configurations'));

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Toyota',
            'model' => 'RAV4',
            'year' => '2023',
            'fuel_types' => json_encode(['Petrol']),
            'transmissions' => json_encode(['Automatic']),
        ]);
    }

    public function test_admin_can_create_a_configuration_with_a_year_range(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.store'), [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year_start' => '2002',
                'year_end' => '2010',
                'categories' => ['Sedan'],
                'fuel_types' => ['Petrol'],
                'transmissions' => ['Manual'],
                'engine_sizes' => ['1.5L'],
                'seats' => [5],
                'colors' => ['White'],
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.car-types.configurations'));

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => '2002-2010',
        ]);
    }

    public function test_admin_cannot_create_a_configuration_with_an_invalid_year(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.store'), [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year_start' => 'abc',
                'categories' => ['Sedan'],
                'fuel_types' => ['Petrol'],
                'transmissions' => ['Manual'],
                'engine_sizes' => ['1.5L'],
                'seats' => [5],
                'colors' => ['White'],
            ])
            ->assertSessionHasErrors('year_start');

        $this->assertDatabaseMissing('car_types', ['brand' => 'Toyota', 'model' => 'Corolla']);
    }

    public function test_admin_cannot_create_a_configuration_where_end_year_is_before_start_year(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.store'), [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year_start' => '2010',
                'year_end' => '2002',
                'categories' => ['Sedan'],
                'fuel_types' => ['Petrol'],
                'transmissions' => ['Manual'],
                'engine_sizes' => ['1.5L'],
                'seats' => [5],
                'colors' => ['White'],
            ])
            ->assertSessionHasErrors('year_end');

        $this->assertDatabaseMissing('car_types', ['brand' => 'Toyota', 'model' => 'Corolla']);
    }

    public function test_admin_can_create_a_configuration_with_a_custom_fuel_type(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.store'), [
                'brand' => 'Tesla',
                'model' => 'Model 3',
                'year_start' => '2024',
                'categories' => ['Sedan'],
                'fuel_types' => ['Electric'],
                'transmissions' => ['Automatic'],
                'engine_sizes' => ['N/A'],
                'seats' => [5],
                'colors' => ['White', 'Red'],
            ])
            ->assertRedirect(route('admin.car-types.configurations'));

        $this->assertDatabaseHas('car_types', ['brand' => 'Tesla', 'model' => 'Model 3', 'fuel_types' => json_encode(['Electric'])]);
    }

    public function test_admin_cannot_create_duplicate_brand_model_and_year_configuration(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => '2022',
            'categories' => ['Sedan'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Automatic'],
        ]);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.store'), [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year_start' => '2022',
                'categories' => ['Sedan'],
                'fuel_types' => ['Petrol'],
                'transmissions' => ['Manual'],
                'colors' => ['White'],
                'is_active' => true,
            ]);

        $this->assertSame(1, CarType::count());
    }

    public function test_admin_can_update_a_configuration(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $carType = CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => '2022',
            'categories' => ['Sedan'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Automatic'],
        ]);

        $this->actingAs($admin)
            ->put(route('admin.car-types.configurations.update', $carType), [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year_start' => '2022',
                'categories' => ['Sedan'],
                'fuel_types' => ['Petrol'],
                'transmissions' => ['Manual'],
                'engine_sizes' => ['1.8L'],
                'seats' => [5],
                'colors' => ['Black'],
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.car-types.configurations'));

        $carType->refresh();
        $this->assertSame('2022', $carType->year);
        $this->assertSame(['Manual'], $carType->transmissions);
    }

    public function test_admin_can_toggle_a_configuration_active_state(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $carType = CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => '2022',
            'categories' => ['Sedan'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Automatic'],
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.car-types.configurations.toggle', $carType))
            ->assertRedirect();

        $carType->refresh();
        $this->assertFalse($carType->is_active);

        $this->actingAs($admin)
            ->patch(route('admin.car-types.configurations.toggle', $carType))
            ->assertRedirect();

        $carType->refresh();
        $this->assertTrue($carType->is_active);
    }

    public function test_admin_can_delete_a_configuration(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $carType = CarType::create([
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => '2022',
            'categories' => ['Sedan'],
            'fuel_types' => ['Petrol'],
            'transmissions' => ['Automatic'],
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.car-types.configurations.destroy', $carType))
            ->assertRedirect(route('admin.car-types.configurations'));

        $this->assertDatabaseMissing('car_types', ['id' => $carType->id]);
    }
}
