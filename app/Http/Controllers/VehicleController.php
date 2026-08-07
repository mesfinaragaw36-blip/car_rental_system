<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CarImage;
use App\Models\CarType;
use App\Models\CarTypeName;
use App\Models\Location;
use App\Models\VehicleDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $query = Car::with(['images', 'carTypeName', 'availablePeriods']);

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
                'available_periods' => $car->availablePeriods
                    ->filter(fn (CarAvailablePeriod $period) => $period->end_date->toDateString() >= now()->toDateString())
                    ->sortBy('start_date')
                    ->values()
                    ->map(fn (CarAvailablePeriod $period) => [
                        'id' => $period->id,
                        'start_date' => $period->start_date->toDateString(),
                        'end_date' => $period->end_date->toDateString(),
                    ])
                    ->all(),
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
            'carTypes' => CarType::where('is_active', true)->with('carTypeName:id,name')->orderBy('brand')->orderBy('model')->get(),
            'locations' => Location::orderBy('name')->get(['id', 'name']),
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
            'transmission' => 'required|in:Manual,Automatic, Semi',
            'car_type_name_id' => 'nullable|exists:car_type_names,id',
            'daily_price' => 'required|numeric|min:0',
            'availability_status' => 'nullable|in:available,maintenance',
            'engine_size' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'seats' => 'nullable|integer|min:1|max:10',
            'description' => 'nullable|string',
            'available_periods' => 'nullable|array',
            'available_periods.*.start_date' => ['required_with:available_periods', 'date'],
            'available_periods.*.end_date' => ['required_with:available_periods', 'date', 'after_or_equal:available_periods.*.start_date'],
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
            'availability_status' => $validated['availability_status'] ?? 'available',
        ]);

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->toDateString(),
            'end_date' => now()->addYear()->toDateString(),
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

        $car->load(['images', 'documents', 'carTypeName', 'reviews.reviewer', 'availablePeriods']);

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
                'available_periods' => $car->availablePeriods
                    ->sortBy('start_date')
                    ->values()
                    ->map(fn (CarAvailablePeriod $period) => [
                        'id' => $period->id,
                        'start_date' => $period->start_date->toDateString(),
                        'end_date' => $period->end_date->toDateString(),
                    ]),
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
            'transmission' => 'required|in:Manual,Automatic,Semi',
            'car_type_name_id' => 'nullable|exists:car_type_names,id',
            'daily_price' => 'required|numeric|min:0',
            'availability_status' => 'nullable|in:available,maintenance',
            'engine_size' => 'nullable|string|max:50',
            'mileage' => 'nullable|integer|min:0',
            'seats' => 'nullable|integer|min:1|max:10',
            'description' => 'nullable|string',
            'available_periods' => 'nullable|array',
            'available_periods.*.start_date' => ['required_with:available_periods', 'date'],
            'available_periods.*.end_date' => ['required_with:available_periods', 'date', 'after_or_equal:available_periods.*.start_date'],
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:10240',

            'ownership_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:10240',
            'ownership_expiry' => 'nullable|date|after:today',

        ]);
        // If the owner edits the vehicle, it must be reviewed again
        if ($user->role !== 'admin') {
            $validated['approval_status'] = 'pending';
        }

        $car->update($validated);

        $car->availablePeriods()->delete();

        foreach ($validated['available_periods'] ?? [] as $period) {
            CarAvailablePeriod::create([
                'car_id' => $car->id,
                'start_date' => $period['start_date'],
                'end_date' => $period['end_date'],
            ]);
        }

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('car-photos', 'public');

                CarImage::create([
                    'car_id' => $car->id,
                    'image_path' => $path,
                    'is_primary' => $car->images()->count() === 0,
                ]);
            }
        }
        if ($request->hasFile('ownership_document')) {
            $oldDocument = $car->documents()
                ->where('document_type', 'Ownership')
                ->latest()
                ->first();

            if ($oldDocument) {
                if (Storage::disk('public')->exists($oldDocument->document_path)) {
                    Storage::disk('public')->delete($oldDocument->document_path);
                }

                $oldDocument->delete();
            }

            $path = $request->file('ownership_document')
                ->store('vehicle_documents', 'public');

            VehicleDocument::create([
                'car_id' => $car->id,
                'document_type' => 'Ownership',
                'document_path' => $path,
                'expiry_date' => $validated['ownership_expiry'] ?? null,
                'verification_status' => 'pending',
            ]);
        }

        return redirect()->route('vehicles.index')->with('toast', ['type' => 'success', 'message' => 'Vehicle updated successfully!']);
    }

    public function deleteImage(Car $car, CarImage $image): RedirectResponse
    {
        $user = auth()->user();

        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($image->car_id !== $car->id) {
            abort(404);
        }

        // Delete the physical file
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }

        $wasPrimary = $image->is_primary;

        $image->delete();

        // If the deleted image was primary, make another image primary
        if ($wasPrimary) {
            $nextImage = $car->images()->first();

            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle photo deleted.',
        ]);
    }

    public function setPrimaryImage(Car $car, CarImage $image): RedirectResponse
    {
        $user = auth()->user();

        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($image->car_id !== $car->id) {
            abort(404);
        }

        // Remove primary status from all other photos
        $car->images()->update(['is_primary' => false]);

        // Make selected image primary
        $image->update(['is_primary' => true]);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Primary photo updated.',
        ]);
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

    public function destroyDocument(Car $car, VehicleDocument $document): RedirectResponse
    {
        $user = auth()->user();

        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($document->car_id !== $car->id) {
            abort(404);
        }

        if ($document->document_path && Storage::disk('public')->exists($document->document_path)) {
            Storage::disk('public')->delete($document->document_path);
        }

        $document->delete();

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Document deleted successfully.',
        ]);
    }

    public function toggleAvailability(Car $car): RedirectResponse
    {
        $user = auth()->user();
        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($car->availability_status === 'available') {
            $car->update(['availability_status' => 'maintenance']);

            return back()->with('toast', ['type' => 'success', 'message' => 'Vehicle paused. It is no longer bookable.']);
        }

        if ($car->availability_status === 'maintenance') {
            $car->update(['availability_status' => 'available']);

            return back()->with('toast', ['type' => 'success', 'message' => 'Vehicle resumed and is bookable again.']);
        }

        return back()->with('toast', ['type' => 'error', 'message' => 'Only available or paused vehicles can be toggled.']);
    }

    public function storeAvailablePeriod(Request $request, Car $car): RedirectResponse
    {
        $user = auth()->user();
        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($car->bookings()->whereNotIn('status', ['cancelled', 'rejected'])->exists()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Cannot modify available dates once the car has bookings.']);
        }

        $validated = $request->validate([
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $hasOverlap = $car->availablePeriods()
            ->whereDate('start_date', '<=', $validated['end_date'])
            ->whereDate('end_date', '>=', $validated['start_date'])
            ->exists();

        if ($hasOverlap) {
            return back()->with('toast', ['type' => 'error', 'message' => 'This date range overlaps with an existing available period.']);
        }

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Available date range added.']);
    }

    public function destroyAvailablePeriod(Car $car, CarAvailablePeriod $availablePeriod): RedirectResponse
    {
        $user = auth()->user();
        if ($car->owner_id !== $user->id && $user->role !== 'admin') {
            abort(403);
        }

        if ($car->bookings()->whereNotIn('status', ['cancelled', 'rejected'])->exists()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Cannot modify available dates once the car has bookings.']);
        }
        if ($availablePeriod->car_id !== $car->id) {
            abort(404);
        }
        $availablePeriod->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Available date range removed.']);
    }
}
