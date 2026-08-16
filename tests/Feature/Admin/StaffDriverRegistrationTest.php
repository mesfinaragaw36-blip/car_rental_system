<?php

namespace Tests\Feature\Admin;

use App\Models\DriverProfile;
use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StaffDriverRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_page_excludes_driver_role(): void
    {
        $admin = User::factory()->admin()->create();
        $driverRole = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);

        $this->actingAs($admin)
            ->get(route('admin.staff.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/staff/create')
                ->has('roles', 0)
                ->where('roles', []));
    }

    public function test_admin_cannot_register_a_driver_as_staff(): void
    {
        $admin = User::factory()->admin()->create();
        $driverRole = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);
        $location = Location::create([
            'name' => 'Main Branch',
            'address' => 'Bole Road',
            'city' => 'Addis Ababa',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.staff.store'), [
                'name' => 'Alem Driver',
                'email' => 'alem.driver@example.com',
                'phone' => '0911111111',
                'staff_role_id' => $driverRole->id,
                'branch_id' => $location->id,
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'email' => 'alem.driver@example.com',
        ]);
    }

    public function test_driver_profile_page_fetches_experience_years(): void
    {
        $driver = User::factory()->create(['role' => 'driver']);
        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
            'location' => 'Addis Ababa',
            'verification_status' => 'approved',
        ]);

        $this->actingAs($driver)
            ->get(route('driver.profile'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('driver/profile')
                ->where('profile.license_number', 'DL-123456')
                ->where('profile.license_type', 'Light Vehicle')
                ->where('profile.experience_years', 7));
    }

    public function test_settings_profile_page_fetches_experience_years(): void
    {
        $driver = User::factory()->create(['role' => 'driver']);
        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
            'location' => 'Addis Ababa',
            'verification_status' => 'approved',
        ]);

        $this->actingAs($driver)
            ->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/profile')
                ->where('profile.experience_years', 7));
    }

    public function test_admin_drivers_index_fetches_experience_years(): void
    {
        $admin = User::factory()->admin()->create();
        $driver = User::factory()->create(['role' => 'driver']);
        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
            'location' => 'Addis Ababa',
            'verification_status' => 'approved',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.drivers.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/drivers')
                ->has('drivers.data', 1)
                ->where('drivers.data.0.driver_profile.experience_years', 7));
    }

    public function test_driver_can_update_and_refetch_experience_years(): void
    {
        $driver = User::factory()->create(['role' => 'driver']);
        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
            'location' => 'Addis Ababa',
            'verification_status' => 'approved',
        ]);

        $this->actingAs($driver)->post(route('driver.profile.update'), [
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 9,
            'location' => 'Addis Ababa',
        ]);

        $this->actingAs($driver)
            ->get(route('driver.profile'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('driver/profile')
                ->where('profile.experience_years', 9));
    }
}
