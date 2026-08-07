<?php

namespace Tests\Feature\Owner;

use App\Models\Car;
use App\Models\Location;
use App\Models\User;
use App\Models\VehicleDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class VehicleUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_upload_vehicle_with_photos_and_documents()
    {
        Storage::fake('public');

        $owner = User::factory()->create(['role' => 'owner']);

        $location = Location::create([
            'name' => 'Main Branch',
            'address' => '123 Main Street',
            'city' => 'Metro City',
        ]);

        $photoOne = UploadedFile::fake()->image('photo-one.jpg');
        $photoTwo = UploadedFile::fake()->image('photo-two.jpg');
        $registrationDocument = UploadedFile::fake()->create('registration.pdf', 100, 'application/pdf');
        $ownershipDocument = UploadedFile::fake()->create('ownership.pdf', 120, 'application/pdf');

        $response = $this
            ->actingAs($owner)
            ->post(route('vehicles.store'), [
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2024,
                'plate_number' => 'ABC123',
                'category' => 'Sedan',
                'color' => 'White',
                'fuel_type' => 'Petrol',
                'transmission' => 'Automatic',
                'engine_size' => '1.8L',
                'mileage' => 15000,
                'seats' => 4,
                'daily_price' => 120.00,
                'description' => 'Comfortable and clean.',
                'photos' => [$photoOne, $photoTwo],
                'primary_photo_index' => 0,
                'ownership_document' => $ownershipDocument,
                'ownership_expiry' => '2027-12-31',
            ]);

        $response->assertRedirect(route('vehicles.index'));

        $this->assertDatabaseHas('cars', [
            'owner_id' => $owner->id,
            'plate_number' => 'ABC123',
            'approval_status' => 'pending',
        ]);

        $car = Car::where('plate_number', 'ABC123')->first();
        $this->assertNotNull($car);

        Storage::disk('public')->assertExists('car-photos/'.$photoOne->hashName());
        Storage::disk('public')->assertExists('car-photos/'.$photoTwo->hashName());
        Storage::disk('public')->assertExists('vehicle_documents/'.$ownershipDocument->hashName());

        $this->assertDatabaseHas('car_images', [
            'car_id' => $car->id,
            'is_primary' => true,
        ]);

        $this->assertDatabaseHas('vehicle_documents', [
            'car_id' => $car->id,
            'document_type' => 'Ownership',
            'verification_status' => 'pending',
        ]);
    }

    public function test_admin_can_approve_vehicle_document()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);

        $car = Car::create([
            'owner_id' => $owner->id,
            'brand' => 'Honda',
            'model' => 'Civic',
            'year' => 2025,
            'plate_number' => 'XYZ789',
            'category' => 'Sedan',
            'color' => 'Blue',
            'fuel_type' => 'Petrol',
            'transmission' => 'Automatic',
            'engine_size' => '2.0L',
            'mileage' => 10000,
            'seats' => 5,
            'daily_price' => 150.00,
            'description' => 'Well maintained.',
            'approval_status' => 'pending',
            'availability_status' => 'available',
        ]);

        $document = VehicleDocument::create([
            'car_id' => $car->id,
            'document_type' => 'Registration',
            'document_path' => 'vehicle-documents/registration.pdf',
            'expiry_date' => '2027-12-31',
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.vehicles.documents.approve', ['car' => $car]), [
                'document_id' => $document->id,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('vehicle_documents', [
            'id' => $document->id,
            'verification_status' => 'approved',
        ]);
    }
}
