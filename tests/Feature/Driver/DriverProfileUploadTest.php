<?php

namespace Tests\Feature\Driver;

use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverProfileUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_can_update_driver_profile()
    {
        $driver = User::factory()->create(['role' => 'driver']);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'Light Vehicle',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('driver.profile'));

        $this->assertDatabaseHas('driver_profiles', [
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 5,
            'location' => 'Addis Ababa',
        ]);

        $this->assertNotNull(DriverProfile::where('user_id', $driver->id)->first());
    }
}
