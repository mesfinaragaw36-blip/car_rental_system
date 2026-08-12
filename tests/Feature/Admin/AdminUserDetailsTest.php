<?php

namespace Tests\Feature\Admin;

use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_driver_profile_verification_document_link()
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        /** @var User $driver */
        $driver = User::factory()->driver()->create();

        DriverProfile::create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 4,
            'daily_rate' => 500.00,
            'location' => 'Addis Ababa',
            'availability' => 'available',
            'verification_status' => 'pending',
            'license_file_path' => 'driver_documents/test-driver.pdf',
        ]);

        $this
            ->actingAs($admin)
            ->get(route('admin.users.show', $driver))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/show')
                ->where('user.id', $driver->id)
                ->where('user.driver_profile.license_file_path', 'driver_documents/test-driver.pdf')
            );
    }
}
