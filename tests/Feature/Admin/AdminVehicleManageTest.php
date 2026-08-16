<?php

namespace Tests\Feature\Admin;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminVehicleManageTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    private function carData(array $overrides = []): array
    {
        CarType::factory()->create([
            'brand' => 'Toyota',
            'model' => 'Camry',
            'year' => 2020,
            'categories' => ['Sedan'],
        ]);

        return array_merge([
            'brand' => 'Toyota',
            'model' => 'Camry',
            'year' => 2020,
            'plate_number' => 'ABC-123',
            'category' => 'Sedan',
            'color' => 'Black',
            'fuel_type' => 'Petrol',
            'transmission' => 'Automatic',
            'daily_price' => 1500.00,
            'availability_status' => 'available',
            'engine_size' => '2.5L',
            'mileage' => 50000,
            'seats' => 5,
            'description' => 'A comfortable family car.',
            'available_periods' => [
                ['start_date' => now()->toDateString(), 'end_date' => now()->addYear()->toDateString()],
            ],
            'photos' => [UploadedFile::fake()->image('car.jpg')],
            'primary_photo_index' => 0,
            'ownership_document' => UploadedFile::fake()->create('ownership.pdf', 100, 'application/pdf'),
            'ownership_expiry' => now()->addYear()->toDateString(),
        ], $overrides);
    }

    public function test_admin_can_view_create_vehicle_page(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->get(route('admin.vehicles.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/vehicle-create')
                ->has('carTypes'));
    }

    public function test_admin_can_store_a_new_vehicle_with_all_details(): void
    {
        Storage::fake('public');
        $admin = $this->admin();
        $carData = $this->carData();

        $this->actingAs($admin)
            ->post(route('admin.vehicles.store'), $carData)
            ->assertRedirect(route('admin.vehicles'))
            ->assertSessionHas('toast', ['type' => 'success', 'message' => 'Vehicle added and approved.']);

        $this->assertDatabaseHas('cars', [
            'owner_id' => $admin->id,
            'brand' => 'Toyota',
            'model' => 'Camry',
            'plate_number' => 'ABC-123',
            'approval_status' => 'approved',
        ]);

        $car = Car::where('plate_number', 'ABC-123')->first();
        $this->assertNotNull($car->images()->first());
        $this->assertNotNull($car->documents()->first());
        $this->assertCount(1, $car->availablePeriods);

        Storage::disk('public')->assertExists($car->images()->first()->image_path);
        Storage::disk('public')->assertExists($car->documents()->first()->document_path);
    }

    public function test_admin_cannot_store_vehicle_without_required_fields(): void
    {
        $admin = $this->admin();
        $carData = $this->carData([
            'brand' => '',
            'plate_number' => '',
            'daily_price' => null,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.vehicles.store'), $carData)
            ->assertSessionHasErrors(['brand', 'plate_number', 'daily_price']);
    }

    public function test_admin_can_delete_a_vehicle(): void
    {
        $admin = $this->admin();
        $car = Car::factory()->create(['owner_id' => $admin->id]);

        $this->actingAs($admin)
            ->delete(route('admin.vehicles.destroy', $car))
            ->assertRedirect(route('admin.vehicles'))
            ->assertSessionHas('toast', ['type' => 'success', 'message' => 'Vehicle deleted.']);

        $this->assertSoftDeleted($car);
    }

    public function test_admin_cannot_delete_a_vehicle_with_active_bookings(): void
    {
        $admin = $this->admin();
        $car = Car::factory()->create(['owner_id' => $admin->id]);
        Booking::create([
            'car_id' => $car->id,
            'customer_id' => User::factory()->create()->id,
            'owner_id' => $admin->id,
            'pickup_location' => 'Branch',
            'return_location' => 'Branch',
            'pickup_date' => now()->addDay(),
            'return_date' => now()->addDays(3),
            'total_price' => 3000,
            'status' => Booking::STATUS_CONFIRMED,
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.vehicles.destroy', $car))
            ->assertSessionHas('toast', ['type' => 'error', 'message' => 'Cannot delete a vehicle that has active bookings.']);

        $this->assertDatabaseHas('cars', ['id' => $car->id]); // Not deleted
    }

    public function test_staff_admin_with_permission_can_create_vehicle(): void
    {
        Storage::fake('public');
        $staffAdmin = User::factory()->staffAdmin()->withPermissions(['vehicles.approve'])->create();
        $carData = $this->carData();

        $this->actingAs($staffAdmin)
            ->post(route('admin.vehicles.store'), $carData)
            ->assertRedirect(route('admin.vehicles'))
            ->assertSessionHas('toast', ['type' => 'success', 'message' => 'Vehicle added and approved.']);

        $this->assertDatabaseHas('cars', [
            'owner_id' => $staffAdmin->id,
            'plate_number' => 'ABC-123',
        ]);
    }

    public function test_staff_admin_without_permission_cannot_create_vehicle(): void
    {
        $staffAdmin = User::factory()->staffAdmin()->create(); // No 'vehicles.approve' permission
        $carData = $this->carData();

        $this->actingAs($staffAdmin)
            ->post(route('admin.vehicles.store'), $carData)
            ->assertForbidden();
    }

    public function test_staff_admin_with_permission_can_delete_vehicle(): void
    {
        $staffAdmin = User::factory()->staffAdmin()->withPermissions(['vehicles.manage'])->create();
        $car = Car::factory()->create(['owner_id' => $staffAdmin->id]);

        $this->actingAs($staffAdmin)
            ->delete(route('admin.vehicles.destroy', $car))
            ->assertRedirect(route('admin.vehicles'))
            ->assertSessionHas('toast', ['type' => 'success', 'message' => 'Vehicle deleted.']);

        $this->assertSoftDeleted($car);
    }

    public function test_staff_admin_without_permission_cannot_delete_vehicle(): void
    {
        $staffAdmin = User::factory()->staffAdmin()->create(); // No 'vehicles.manage' permission
        $car = Car::factory()->create(['owner_id' => $staffAdmin->id]);

        $this->actingAs($staffAdmin)
            ->delete(route('admin.vehicles.destroy', $car))
            ->assertForbidden();
    }
}
