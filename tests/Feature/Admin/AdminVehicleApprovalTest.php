<?php

namespace Tests\Feature\Admin;

use App\Models\Car;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminVehicleApprovalTest extends TestCase
{
    use RefreshDatabase;

    private function pendingVehicle(): Car
    {
        /** @var Car $car */
        $car = Car::factory()->create(['approval_status' => 'pending']);

        return $car;
    }

    public function test_admin_can_view_vehicle_details_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = $this->pendingVehicle();

        $this
            ->actingAs($admin)
            ->get(route('admin.vehicles.show', $car))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/vehicle-details')
                ->where('vehicle.id', $car->id)
                ->where('vehicle.approval_status', 'pending'));
    }

    public function test_admin_can_approve_a_pending_vehicle(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = $this->pendingVehicle();

        $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.approve', $car))
            ->assertRedirect();

        $this->assertDatabaseHas('cars', [
            'id' => $car->id,
            'approval_status' => 'approved',
        ]);
    }

    public function test_admin_can_reject_a_pending_vehicle_with_reason(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = $this->pendingVehicle();

        $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.reject', $car), [
                'rejection_reason' => 'Incomplete documentation.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('cars', [
            'id' => $car->id,
            'approval_status' => 'rejected',
            'rejection_reason' => 'Incomplete documentation.',
        ]);
    }

    public function test_rejecting_without_a_reason_fails_validation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = $this->pendingVehicle();

        $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.reject', $car))
            ->assertSessionHasErrors('rejection_reason');

        $this->assertDatabaseHas('cars', [
            'id' => $car->id,
            'approval_status' => 'pending',
        ]);
    }

    public function test_approving_clears_a_previous_rejection_reason(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $car = Car::factory()->create([
            'approval_status' => 'rejected',
            'rejection_reason' => 'Previously rejected.',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.approve', $car))
            ->assertRedirect();

        $this->assertDatabaseHas('cars', [
            'id' => $car->id,
            'approval_status' => 'approved',
            'rejection_reason' => null,
        ]);
    }
}
