<?php

namespace Tests\Feature\Admin;

use App\Models\Location;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StaffDriverRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_page_exposes_driver_role_permissions(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);

        $this->actingAs($admin)
            ->get(route('admin.staff.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/staff/create')
                ->has('roles', 1)
                ->where('roles.0.id', $role->id)
                ->where('roles.0.permissions', ['driver.access']));
    }

    public function test_admin_can_register_a_driver_as_staff(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);
        $location = Location::create([
            'name' => 'Main Branch',
            'address' => 'Bole Road',
            'city' => 'Addis Ababa',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.staff.store'), [
                'name' => 'Alem Driver',
                'email' => 'alem.driver@example.com',
                'phone' => '0911111111',
                'staff_role_id' => $role->id,
                'branch_id' => $location->id,
                'license_number' => 'DL-123456',
                'license_type' => 'Light Vehicle',
                'experience_years' => 3,
            ]);

        $response->assertRedirect(route('admin.staff.index'));
        $this->assertDatabaseHas('users', [
            'email' => 'alem.driver@example.com',
            'staff_role_id' => $role->id,
        ]);
        $this->assertDatabaseHas('driver_profiles', [
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 3,
            'availability' => 'available',
            'verification_status' => 'approved',
        ]);
    }

    public function test_driver_profile_page_fetches_experience_years(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);
        $location = Location::create([
            'name' => 'Main Branch',
            'address' => 'Bole Road',
            'city' => 'Addis Ababa',
        ]);

        $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Alem Driver',
            'email' => 'alem.driver@example.com',
            'phone' => '0911111111',
            'staff_role_id' => $role->id,
            'branch_id' => $location->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
        ]);

        $driver = User::where('email', 'alem.driver@example.com')->first();

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
        $admin = User::factory()->admin()->create();
        $role = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);
        $location = Location::create([
            'name' => 'Main Branch',
            'address' => 'Bole Road',
            'city' => 'Addis Ababa',
        ]);

        $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Alem Driver',
            'email' => 'alem.driver@example.com',
            'phone' => '0911111111',
            'staff_role_id' => $role->id,
            'branch_id' => $location->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
        ]);

        $driver = User::where('email', 'alem.driver@example.com')->first();

        $this->actingAs($driver)
            ->get(route('profile.edit'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/profile')
                ->where('profile.experience_years', 7));
    }

    public function test_admin_drivers_index_fetches_experience_years(): void
    {
        $admin = User::factory()->admin()->create();
        $role = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);
        $location = Location::create([
            'name' => 'Main Branch',
            'address' => 'Bole Road',
            'city' => 'Addis Ababa',
        ]);

        $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Alem Driver',
            'email' => 'alem.driver@example.com',
            'phone' => '0911111111',
            'staff_role_id' => $role->id,
            'branch_id' => $location->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
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
        $admin = User::factory()->admin()->create();
        $role = Role::create([
            'name' => 'Driver',
            'permissions' => ['driver.access'],
        ]);
        $location = Location::create([
            'name' => 'Main Branch',
            'address' => 'Bole Road',
            'city' => 'Addis Ababa',
        ]);

        $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Alem Driver',
            'email' => 'alem.driver@example.com',
            'phone' => '0911111111',
            'staff_role_id' => $role->id,
            'branch_id' => $location->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 7,
        ]);

        $driver = User::where('email', 'alem.driver@example.com')->first();

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
