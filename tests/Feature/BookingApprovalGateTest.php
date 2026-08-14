<?php

namespace Tests\Feature;

use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CustomerIdentity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingApprovalGateTest extends TestCase
{
    use RefreshDatabase;

    private function approvedCar(User $owner): Car
    {
        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ]);

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDays(30)->toDateString(),
        ]);

        return $car;
    }

    private function customerWithIdentity(string $verificationStatus): User
    {
        $customer = User::factory()->create(['role' => 'customer']);

        CustomerIdentity::create([
            'user_id' => $customer->id,
            'national_id_number' => fake()->numerify('##############'),
            'verification_status' => $verificationStatus,
            'verified_at' => $verificationStatus === 'approved' ? now() : null,
        ]);

        return $customer;
    }

    public function test_browse_cars_exposes_verification_status_for_customers(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->approvedCar($owner);

        $pending = $this->customerWithIdentity('pending');
        $this->actingAs($pending)
            ->get(route('cars.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('role', 'customer')->where('verification_status', 'pending'));

        $approved = $this->customerWithIdentity('approved');
        $this->actingAs($approved)
            ->get(route('cars.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('verification_status', 'approved'));

        $noIdentity = User::factory()->create(['role' => 'customer']);
        $this->actingAs($noIdentity)
            ->get(route('cars.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('verification_status', null));
    }

    public function test_browse_cars_exposes_null_verification_status_for_non_customers(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $this->approvedCar($owner);

        $this->actingAs($owner)
            ->get(route('cars.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('role', 'owner')->where('verification_status', null));
    }

    public function test_car_details_exposes_verification_status_for_customers(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $car = $this->approvedCar($owner);

        $pending = $this->customerWithIdentity('pending');
        $this->actingAs($pending)
            ->get(route('cars.show', $car))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('role', 'customer')->where('verification_status', 'pending'));

        $approved = $this->customerWithIdentity('approved');
        $this->actingAs($approved)
            ->get(route('cars.show', $car))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('verification_status', 'approved'));
    }

    public function test_profile_page_flashes_toast_when_reached_via_booking_gate(): void
    {
        $customer = $this->customerWithIdentity('pending');

        $response = $this->actingAs($customer)
            ->get(route('profile.edit', ['booking_gate' => 'requires_approval']));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('settings/profile'));

        $page = AssertableInertia::fromTestResponse($response)->toArray();

        $this->assertSame([
            'type' => 'error',
            'message' => 'You must be approved before booking a car. Please submit your national ID to complete verification.',
        ], $page['flash']['toast']);
    }

    public function test_profile_page_does_not_flash_toast_without_booking_gate(): void
    {
        $customer = $this->customerWithIdentity('pending');

        $response = $this->actingAs($customer)
            ->get(route('profile.edit'));

        $response
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('settings/profile'));

        $page = AssertableInertia::fromTestResponse($response)->toArray();

        $this->assertArrayNotHasKey('toast', $page['flash'] ?? []);
    }
}
