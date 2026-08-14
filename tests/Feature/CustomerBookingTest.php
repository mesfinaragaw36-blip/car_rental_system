<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CustomerIdentity;
use App\Models\Location;
use App\Models\OwnerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_book_a_vehicle_with_valid_dates()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        CustomerIdentity::create([
            'user_id' => $customer->id,
            'national_id_number' => '123456789012',
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        OwnerProfile::create([
            'user_id' => $owner->id,
            'business_name' => 'Test Rentals',
            'national_id' => 'OWNER-ID-001',
            'verification_status' => 'approved',
        ]);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
        ]);

        $this->actingAs($customer);

        $branch = Location::create(['name' => 'Airport Branch', 'address' => 'Airport Road', 'city' => 'Addis Ababa']);

        $response = $this->post(route('cars.book', $car), [
            'pickup_date' => now()->addDays(2)->toDateString(),
            'return_date' => now()->addDays(4)->toDateString(),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'need_driver' => true,
        ]);

        $response->assertRedirect(route('bookings.index'));
        $this->assertDatabaseHas('bookings', [
            'customer_id' => $customer->id,
            'car_id' => $car->id,
            'pickup_location' => $branch->name.', '.$branch->city,
            'return_location' => $branch->name.', '.$branch->city,
            'need_driver' => true,
            'total_price' => 200.00,
            'deposit_amount' => 500.00,
            'status' => 'confirmed',
        ]);
    }

    public function test_customer_with_unapproved_identity_cannot_pay_deposit()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        OwnerProfile::create([
            'user_id' => $owner->id,
            'business_name' => 'Test Rentals',
            'national_id' => 'OWNER-ID-001',
            'verification_status' => 'approved',
        ]);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $branch = Location::create(['name' => 'Airport Branch', 'address' => 'Airport Road', 'city' => 'Addis Ababa']);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(2),
            'return_date' => now()->addDays(4),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'pickup_location' => 'Airport Branch, Addis Ababa',
            'return_location' => 'Airport Branch, Addis Ababa',
            'need_driver' => false,
            'total_price' => 200.00,
            'deposit_amount' => 500.00,
            'status' => 'confirmed',
        ]);

        CustomerIdentity::create([
            'user_id' => $customer->id,
            'national_id_number' => '123456789012',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($customer);

        $this->get(route('payments.create', $booking))
            ->assertRedirect();
        $this->get(route('payments.create', $booking))
            ->assertSessionHas('toast', ['type' => 'error', 'message' => 'Your national ID is awaiting admin approval. You can pay the deposit once your identity has been verified.']);
    }

    public function test_customer_with_approved_identity_can_view_deposit_payment()
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        OwnerProfile::create([
            'user_id' => $owner->id,
            'business_name' => 'Test Rentals',
            'national_id' => 'OWNER-ID-001',
            'verification_status' => 'approved',
        ]);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $branch = Location::create(['name' => 'Airport Branch', 'address' => 'Airport Road', 'city' => 'Addis Ababa']);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(2),
            'return_date' => now()->addDays(4),
            'pickup_branch_id' => $branch->id,
            'return_branch_id' => $branch->id,
            'pickup_location' => 'Airport Branch, Addis Ababa',
            'return_location' => 'Airport Branch, Addis Ababa',
            'need_driver' => false,
            'total_price' => 200.00,
            'deposit_amount' => 500.00,
            'status' => 'confirmed',
        ]);

        CustomerIdentity::create([
            'user_id' => $customer->id,
            'national_id_number' => '123456789012',
            'verification_status' => 'approved',
            'verified_at' => now(),
        ]);

        $this->actingAs($customer);

        $this->get(route('payments.create', $booking))
            ->assertOk();
    }
}
