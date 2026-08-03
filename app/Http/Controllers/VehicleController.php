<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CarImage;
use App\Models\CarTypeName;
use App\Models\VehicleDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $query = Car::with(['images', 'carTypeName']);

        if ($user->role !== 'admin') {
            $query->where('owner_id', $user->id);
        }

        $vehicles = $query->get()->map(function (Car $car) {
            $latestReview = $car->reviews()->with('reviewer')->latest()->first();

            return array_merge($car->toArray(), [
                'average_rating' => round($car->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $car->reviews()->count(),
                'latest_review' => $latestReview ? [
                    'reviewer' => ['id' => $latestReview->reviewer->id, 'name' => $latestReview->reviewer->name],
                    'rating' => $latestReview->rating,
                    'review_text' => $latestReview->review_text,
                    'created_at' => $latestReview->created_at->toDateTimeString(),
                ] : null,
            ]);
        });

        return Inertia::render('vehicles', [
            'role' => $user->role,
            'vehicles' => $vehicles,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('create-vehicle', [
            'carTypeNames' => CarTypeName::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
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
            'car_type_name_id' => 'nullable|exists:car_type_names,id',
            'daily_price' => 'required|numeric|min:0',
            'engine_size' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'seats' => 'nullable|integer|min:1|max:10',
            'description' => 'nullable|string',
            'photos' => 'nullable',
            'photos.*' => 'image|max:10240',
            'primary_photo_index' => 'nullable|integer|min:0',
            'ownership_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:10240',
            'ownership_expiry' => 'nullable|date|after:today',
        ], [
            'photos.*.image' => 'Each photo must be a valid image (JPEG, PNG, GIF, or WebP).',
            'photos.*.max' => 'Each photo must be smaller than 10MB.',
            'ownership_document.max' => 'The ownership document must be smaller than 10MB.',
            'ownership_document.mimes' => 'The ownership document must be a JPEG, PNG, GIF, WebP, or PDF file.',
        ]);

        $car = Car::create([
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'plate_number' => $validated['plate_number'],
            'category' => $validated['category'],
            'car_type_name_id' => $validated['car_type_name_id'] ?? null,
            'color' => $validated['color'],
            'fuel_type' => $validated['fuel_type'],
            'transmission' => $validated['transmission'],
            'daily_price' => $validated['daily_price'],
            'engine_size' => $validated['engine_size'] ?? null,
            'mileage' => $validated['mileage'] ?? null,
            'seats' => $validated['seats'] ?? null,
            'description' => $validated['description'] ?? null,
            'owner_id' => auth()->id(),
            'approval_status' => 'pending',
            'availability_status' => 'available',
        ]);

        if ($request->hasFile('photos')) {
            $primaryIndex = $validated['primary_photo_index'] ?? 0;
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('car-photos', 'public');
                CarImage::create(['car_id' => $car->id, 'image_path' => $path, 'is_primary' => $index === $primaryIndex]);
            }
        }

        if ($request->hasFile('ownership_document')) {
            $path = $request->file('ownership_document')->store('vehicle_documents', 'public');
            VehicleDocument::create([
                'car_id' => $car->id,
                'document_type' => 'Ownership',
                'document_path' => $path,
                'expiry_date' => ! empty($validated['ownership_expiry']) ? $validated['ownership_expiry'] : null,
                'verification_status' => 'pending',
            ]);
        }

        return redirect()->route('vehicles.index')->with('toast', ['type' => 'success', 'message' => 'Vehicle submitted for approval.']);
    }

    public function edit(Car $car): Response
    {
        $user = auth()->user();
        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $car->load(['images', 'documents', 'carTypeName', 'reviews.reviewer']);

        $recentReviews = $car->reviews()->with('reviewer')->latest()->take(5)->get()->map(function ($review) {
            return [
                'id' => $review->id,
                'reviewer' => ['id' => $review->reviewer->id, 'name' => $review->reviewer->name],
                'rating' => $review->rating,
                'review_text' => $review->review_text,
                'created_at' => $review->created_at->toDateTimeString(),
            ];
        })->toArray();

        return Inertia::render('edit-vehicle', [
            'vehicle' => array_merge($car->toArray(), [
                'average_rating' => round($car->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $car->reviews()->count(),
                'recent_reviews' => $recentReviews,
            ]),
            'carTypeNames' => CarTypeName::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Car $car): RedirectResponse
    {
        $user = auth()->user();
        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        $validated = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'plate_number' => 'required|string|max:50|unique:cars,plate_number,'.$car->id,
            'category' => 'required|string|max:100',
            'color' => 'required|string|max:50',
            'fuel_type' => 'required|in:Petrol,Diesel,Hybrid,Electric',
            'transmission' => 'required|in:Manual,Automatic',
            'car_type_name_id' => 'nullable|exists:car_type_names,id',
            'daily_price' => 'required|numeric|min:0',
            'engine_size' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'seats' => 'nullable|integer|min:1|max:10',
            'description' => 'nullable|string',
        ]);

        $car->update($validated);

        return redirect()->route('vehicles.index')->with('toast', ['type' => 'success', 'message' => 'Vehicle updated successfully!']);
    }

    public function destroy(Car $car): RedirectResponse
    {
        $user = auth()->user();
        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }
        $car->delete();

        return redirect()->back()->with('toast', ['type' => 'success', 'message' => 'Vehicle deleted.']);
    }
}
