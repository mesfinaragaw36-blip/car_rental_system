<?php

namespace Tests\Feature\Admin;

use App\Models\Car;
use App\Models\CarType;
use App\Models\CarTypeRequest;
use App\Models\Notification;
use App\Models\OwnerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarTypeRequestFlowTest extends TestCase
{
    use RefreshDatabase;

    private function owner(): User
    {
        $owner = User::factory()->create(['role' => 'owner']);

        OwnerProfile::create([
            'user_id' => $owner->id,
            'business_name' => 'Test Rentals',
            'national_id' => 'OWNER-ID-001',
            'verification_status' => 'approved',
        ]);

        return $owner;
    }

    public function test_owner_can_request_an_unregistered_configuration(): void
    {
        $owner = $this->owner();

        $this->actingAs($owner)
            ->post(route('car-type-requests.store'), [
                'brand' => 'Tesla',
                'model' => 'Model 3',
                'year' => '2024',
                'category' => 'Sedan',
                'fuel_type' => 'Electric',
                'transmission' => 'Automatic',
                'engine_size' => 'N/A',
                'seats' => 5,
                'note' => 'Please add this model.',
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('car_type_requests', [
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'status' => 'pending',
        ]);
    }

    public function test_owner_cannot_submit_a_duplicate_pending_request(): void
    {
        $owner = $this->owner();

        CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'status' => 'pending',
        ]);

        $this->actingAs($owner)
            ->post(route('car-type-requests.store'), [
                'brand' => 'Tesla',
                'model' => 'Model 3',
                'year' => '2024',
                'category' => 'Sedan',
            ])
            ->assertSessionHas('toast.type', 'error');

        $this->assertSame(1, CarTypeRequest::count());
    }

    public function test_admin_can_approve_a_pending_request_and_create_a_configuration(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = $this->owner();

        $request = CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'category' => 'Sedan',
            'fuel_type' => 'Electric',
            'transmission' => 'Automatic',
            'engine_size' => 'N/A',
            'seats' => 5,
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.requests.approve', $request))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('car_types', [
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'fuel_types' => json_encode(['Electric']),
            'transmissions' => json_encode(['Automatic']),
        ]);

        $request->refresh();
        $this->assertSame('approved', $request->status);
        $this->assertSame($admin->id, $request->reviewed_by);
        $this->assertNotNull($request->reviewed_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'configuration_approved',
            'related_type' => CarTypeRequest::class,
            'related_id' => $request->id,
        ]);
    }

    public function test_admin_approving_a_request_with_a_plate_creates_and_approves_the_owners_car(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = $this->owner();

        $request = CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'category' => 'Sedan',
            'color' => 'White',
            'fuel_type' => 'Electric',
            'transmission' => 'Automatic',
            'engine_size' => 'N/A',
            'seats' => 5,
            'plate_number' => 'TESLA24',
            'daily_price' => 5000,
            'mileage' => 10000,
            'photos' => ['car-photos/test.jpg'],
            'primary_photo_index' => 0,
            'document_path' => 'vehicle_documents/doc.jpg',
            'availability_status' => 'available',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.requests.approve', $request))
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $this->assertDatabaseHas('cars', [
            'owner_id' => $owner->id,
            'plate_number' => 'TESLA24',
            'approval_status' => 'approved',
        ]);

        $car = Car::where('plate_number', 'TESLA24')->first();

        $this->assertSame(1, $car->images()->count());
        $this->assertTrue($car->images()->first()->is_primary);
        $this->assertSame('approved', $car->documents()->first()->verification_status);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'configuration_approved',
            'related_id' => $request->id,
        ]);
    }

    public function test_admin_can_reject_a_pending_request(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = $this->owner();

        $request = CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.requests.reject', $request), [
                'admin_note' => 'Out of our supported makes.',
            ])
            ->assertRedirect()
            ->assertSessionHas('toast.type', 'success');

        $request->refresh();
        $this->assertSame('rejected', $request->status);
        $this->assertSame('Out of our supported makes.', $request->admin_note);

        $this->assertDatabaseMissing('car_types', ['brand' => 'Tesla', 'model' => 'Model 3']);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'configuration_rejected',
            'related_type' => CarTypeRequest::class,
            'related_id' => $request->id,
        ]);
    }

    public function test_admin_must_provide_a_reason_when_rejecting(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = $this->owner();

        $request = CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->from(route('admin.vehicles'))
            ->post(route('admin.car-types.configurations.requests.reject', $request), [])
            ->assertSessionHasErrors('admin_note');

        $request->refresh();
        $this->assertSame('pending', $request->status);
        $this->assertSame(0, Notification::count());
    }

    public function test_admin_approving_a_request_that_already_exists_rejects_it_instead(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = $this->owner();

        CarType::create([
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'categories' => ['Sedan'],
            'fuel_types' => ['Electric'],
            'transmissions' => ['Automatic'],
        ]);

        $request = CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.car-types.configurations.requests.approve', $request))
            ->assertSessionHas('toast.type', 'error');

        $request->refresh();
        $this->assertSame('rejected', $request->status);
        $this->assertSame(1, CarType::count());
    }

    public function test_admin_configurations_page_includes_pending_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = $this->owner();

        CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'category' => 'Sedan',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.car-types.configurations'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/car-types/configurations')
                ->has('requests', 1)
                ->where('requests.0.brand', 'Tesla')
                ->where('requests.0.model', 'Model 3'));
    }

    public function test_owner_can_view_their_own_request_status_page(): void
    {
        $owner = $this->owner();

        $request = CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'status' => 'rejected',
            'admin_note' => 'Out of our supported makes.',
        ]);

        $this->actingAs($owner)
            ->get(route('car-type-requests.show', $request))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('car-type-request-status')
                ->where('request.status', 'rejected')
                ->where('request.admin_note', 'Out of our supported makes.'));
    }

    public function test_owner_cannot_view_another_owners_request(): void
    {
        $owner = $this->owner();
        $other = $this->owner();

        $request = CarTypeRequest::create([
            'requested_by' => $other->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'status' => 'pending',
        ]);

        $this->actingAs($owner)
            ->get(route('car-type-requests.show', $request))
            ->assertForbidden();
    }

    public function test_admin_vehicles_page_includes_pending_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = $this->owner();

        CarTypeRequest::create([
            'requested_by' => $owner->id,
            'brand' => 'Tesla',
            'model' => 'Model 3',
            'year' => '2024',
            'category' => 'Sedan',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.vehicles'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/vehicles')
                ->has('requests', 1)
                ->where('requests.0.brand', 'Tesla')
                ->where('requests.0.requester', $owner->name));
    }
}
