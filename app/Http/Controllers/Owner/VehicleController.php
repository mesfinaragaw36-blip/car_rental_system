<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\VehicleDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Car::where('owner_id', auth()->id())->get();

        return Inertia::render('owner/vehicles', [
            'vehicles' => $vehicles,
        ]);
    }

    public function create()
    {
        return Inertia::render('owner/create-vehicle');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'plate_number' => 'required|string|max:50|unique:cars',
            'category' => 'required|string|max:100',
            'color' => 'required|string|max:50',
            'fuel_type' => 'required|in:Petrol,Diesel,Hybrid,Electric',
            'transmission' => 'required|in:Manual,Automatic',
            'daily_price' => 'required|numeric|min:0',
            'engine_size' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'seats' => 'nullable|integer|min:1|max:10',
            'description' => 'nullable|string',
            'photos' => 'nullable',
            'photos.*' => 'image|max:10240',
            'primary_photo_index' => 'nullable|integer|min:0',
            'registration_document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'registration_expiry' => 'nullable|date',
            'ownership_document' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'ownership_expiry' => 'nullable|date',
        ]);

        $car = Car::create([
            ...$validated,
            'owner_id' => auth()->id(),
            'approval_status' => 'pending',
            'availability_status' => 'available',
        ]);

        $primaryPhotoIndex = $validated['primary_photo_index'] ?? 0;

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('car-photos', 'public');

                CarImage::create([
                    'car_id' => $car->id,
                    'image_path' => $path,
                    'is_primary' => (int) $index === (int) $primaryPhotoIndex,
                ]);
            }
        }

        if ($request->hasFile('registration_document')) {
            $path = $request->file('registration_document')->store('vehicle-documents', 'public');

            VehicleDocument::create([
                'car_id' => $car->id,
                'document_type' => 'Registration',
                'document_path' => $path,
                'expiry_date' => $validated['registration_expiry'] ?? null,
                'verification_status' => 'pending',
            ]);
        }

        if ($request->hasFile('ownership_document')) {
            $path = $request->file('ownership_document')->store('vehicle-documents', 'public');

            VehicleDocument::create([
                'car_id' => $car->id,
                'document_type' => 'Ownership',
                'document_path' => $path,
                'expiry_date' => $validated['ownership_expiry'] ?? null,
                'verification_status' => 'pending',
            ]);
        }

        return redirect()->route('owner.vehicles');
    }
}
