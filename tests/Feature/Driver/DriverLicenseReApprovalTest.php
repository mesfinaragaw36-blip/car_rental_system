<?php

namespace Tests\Feature\Driver;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\Car;
use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DriverLicenseReApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_driver_profile_sets_verification_status_to_pending()
    {
        Storage::fake('public');

        $driver = User::factory()->create(['role' => 'driver']);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'አውቶ',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
                'gender' => 'Male',
                'daily_rate' => 500,
                'license_file' => UploadedFile::fake()->image('license.jpg'),
            ]);

        $response->assertRedirect(route('driver.profile'));

        $profile = DriverProfile::where('user_id', $driver->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('pending', $profile->verification_status);
    }

    public function test_changing_license_number_requires_reapproval()
    {
        $driver = User::factory()->create(['role' => 'driver']);

        DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'verification_status' => 'approved',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-999999',
                'license_type' => 'አውቶ',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
                'gender' => 'Male',
                'daily_rate' => 500,
            ]);

        $response->assertRedirect(route('driver.profile'));

        $profile = $driver->driverProfile->fresh();
        $this->assertEquals('pending', $profile->verification_status);
        $this->assertEquals('DL-999999', $profile->license_number);
    }

    public function test_changing_license_type_requires_reapproval()
    {
        $driver = User::factory()->create(['role' => 'driver']);

        DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'verification_status' => 'approved',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'ህዝብ',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
                'gender' => 'Male',
                'daily_rate' => 500,
            ]);

        $response->assertRedirect(route('driver.profile'));

        $profile = $driver->driverProfile->fresh();
        $this->assertEquals('pending', $profile->verification_status);
        $this->assertEquals('ህዝብ', $profile->license_type);
    }

    public function test_changing_license_document_requires_reapproval()
    {
        Storage::fake('public');

        $driver = User::factory()->create(['role' => 'driver']);

        DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'license_file_path' => '/storage/licenses/old.jpg',
            'verification_status' => 'approved',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'አውቶ',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
                'gender' => 'Male',
                'daily_rate' => 500,
                'license_file' => UploadedFile::fake()->image('new-license.jpg'),
            ]);

        $response->assertRedirect(route('driver.profile'));

        $profile = $driver->driverProfile->fresh();
        $this->assertEquals('pending', $profile->verification_status);
        Storage::disk('public')->assertExists('driver-licenses/' . basename($profile->license_file_path));
    }

    public function test_changing_non_license_fields_does_not_require_reapproval()
    {
        $driver = User::factory()->create(['role' => 'driver']);

        DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'experience_years' => 5,
            'location' => 'Addis Ababa',
            'daily_rate' => 500,
            'verification_status' => 'approved',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'አውቶ',
                'experience_years' => 7,
                'location' => 'Bahir Dar',
                'gender' => 'Male',
                'daily_rate' => 600,
            ]);

        $response->assertRedirect(route('driver.profile'));

        $profile = $driver->driverProfile->fresh();
        $this->assertEquals('approved', $profile->verification_status);
        $this->assertEquals(7, $profile->experience_years);
        $this->assertEquals('Bahir Dar', $profile->location);
        $this->assertEquals(600, $profile->daily_rate);
    }

    public function test_driver_with_active_assignment_cannot_update_license_number()
    {
        $driver = User::factory()->create(['role' => 'driver']);
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $profile = DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'verification_status' => 'approved',
        ]);

        $car = Car::factory()->create(['owner_id' => $owner->id]);

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'car_id' => $car->id,
            'status' => 'approved',
        ]);

        BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'accepted',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-999999',
                'license_type' => 'አውቶ',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
                'gender' => 'Male',
                'daily_rate' => 500,
            ]);

        $response->assertRedirect(route('driver.profile'));
        $response->assertSessionHas('toast.type', 'error');
        $response->assertSessionHas('toast.message');

        $profile->refresh();
        $this->assertEquals('DL-123456', $profile->license_number);
        $this->assertEquals('approved', $profile->verification_status);
    }

    public function test_driver_with_active_assignment_cannot_update_license_type()
    {
        $driver = User::factory()->create(['role' => 'driver']);
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $profile = DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'verification_status' => 'approved',
        ]);

        $car = Car::factory()->create(['owner_id' => $owner->id]);

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'car_id' => $car->id,
            'status' => 'approved',
        ]);

        BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'ህዝብ',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
                'gender' => 'Male',
                'daily_rate' => 500,
            ]);

        $response->assertRedirect(route('driver.profile'));
        $response->assertSessionHas('toast.type', 'error');

        $profile->refresh();
        $this->assertEquals('አውቶ', $profile->license_type);
    }

    public function test_driver_with_active_assignment_cannot_update_license_document()
    {
        Storage::fake('public');

        $driver = User::factory()->create(['role' => 'driver']);
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $profile = DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'license_file_path' => '/storage/licenses/old.jpg',
            'verification_status' => 'approved',
        ]);

        $car = Car::factory()->create(['owner_id' => $owner->id]);

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'car_id' => $car->id,
            'status' => 'approved',
        ]);

        BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'accepted',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'አውቶ',
                'experience_years' => 5,
                'location' => 'Addis Ababa',
                'gender' => 'Male',
                'daily_rate' => 500,
                'license_file' => UploadedFile::fake()->image('new-license.jpg'),
            ]);

        $response->assertRedirect(route('driver.profile'));
        $response->assertSessionHas('toast.type', 'error');

        $profile->refresh();
        $this->assertEquals('/storage/licenses/old.jpg', $profile->license_file_path);
    }

    public function test_driver_with_active_assignment_can_update_non_license_fields()
    {
        $driver = User::factory()->create(['role' => 'driver']);
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $profile = DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'experience_years' => 5,
            'location' => 'Addis Ababa',
            'daily_rate' => 500,
            'verification_status' => 'approved',
        ]);

        $car = Car::factory()->create(['owner_id' => $owner->id]);

        $booking = Booking::factory()->create([
            'customer_id' => $customer->id,
            'car_id' => $car->id,
            'status' => 'approved',
        ]);

        BookingDriver::create([
            'booking_id' => $booking->id,
            'driver_id' => $driver->id,
            'assigned_by' => $owner->id,
            'assigned_at' => now(),
            'status' => 'accepted',
        ]);

        $response = $this
            ->actingAs($driver)
            ->post(route('driver.profile.update'), [
                'license_number' => 'DL-123456',
                'license_type' => 'አውቶ',
                'experience_years' => 7,
                'location' => 'Bahir Dar',
                'gender' => 'Male',
                'daily_rate' => 600,
                'telebirr_phone' => '0912345678',
                'cbe_account' => '1000123456789',
            ]);

        $response->assertRedirect(route('driver.profile'));
        $response->assertSessionHas('toast.type', 'success');

        $profile->refresh();
        $this->assertEquals('approved', $profile->verification_status);
        $this->assertEquals(7, $profile->experience_years);
        $this->assertEquals('Bahir Dar', $profile->location);
        $this->assertEquals(600, $profile->daily_rate);
        $this->assertEquals('0912345678', $profile->telebirr_phone);
        $this->assertEquals('1000123456789', $profile->cbe_account);
    }

    public function test_admin_can_approve_driver_profile()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $driver = User::factory()->create(['role' => 'driver']);

        $profile = DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.users.verify-driver', $driver));

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'success');

        $profile->refresh();
        $this->assertEquals('approved', $profile->verification_status);
    }

    public function test_admin_can_reject_driver_profile()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $driver = User::factory()->create(['role' => 'driver']);

        $profile = DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.users.reject-driver', $driver));

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'success');

        $profile->refresh();
        $this->assertEquals('rejected', $profile->verification_status);
    }

    public function test_driver_assignments_page_shows_correct_profile_status()
    {
        $driver = User::factory()->create(['role' => 'driver']);

        $profile = DriverProfile::factory()->create([
            'user_id' => $driver->id,
            'license_number' => 'DL-123456',
            'license_type' => 'አውቶ',
            'experience_years' => 5,
            'location' => 'Addis Ababa',
            'gender' => 'Male',
            'daily_rate' => 500,
            'license_file_path' => '/storage/license.jpg',
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($driver)
            ->get(route('driver.assignments.index'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->has('profileComplete')
                ->has('profileApproved')
                ->has('profileStatus')
                ->where('profileComplete', true)
                ->where('profileApproved', false)
                ->where('profileStatus', 'pending');
        });
    }
}

