<?php

namespace Tests\Feature\Driver;

use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DriverProfileUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_can_upload_driver_verification_document()
    {
        Storage::fake('public');

        $driver = User::factory()->driver()->create();

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'Light Vehicle',
                'experience_years' => 5,
                'daily_rate' => 600.00,
                'location' => 'Addis Ababa',
                'availability' => 'available',
                'license_file' => UploadedFile::fake()->create('driver-docs.pdf', 100, 'application/pdf'),
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('driver.profile'));

        $this->assertDatabaseHas('driver_profiles', [
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'Light Vehicle',
            'experience_years' => 5,
            'daily_rate' => '600.00',
            'location' => 'Addis Ababa',
            'availability' => 'available',
        ]);

        $profile = DriverProfile::where('user_id', $driver->id)->first();

        $this->assertNotNull($profile);
        $this->assertNotNull($profile->license_file_path);

        Storage::disk('public')->assertExists($profile->license_file_path);
    }
}
