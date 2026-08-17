<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CarImage;
use App\Models\CarType;
use App\Models\CarTypeRequest;
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
        $query = Car::with(['images', 'availablePeriods']);

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
            'ownerVerificationStatus' => $user->role === 'owner'
                ? ($user->ownerProfile?->verification_status ?? 'pending')
                : null,
        ]);
    }

    public function create(): Response|RedirectResponse
    {
        $user = auth()->user();

        if (
            $user->role === 'owner' &&
            $user->ownerProfile?->verification_status !== 'approved'
        ) {
            return redirect()
                ->route('profile.edit')
                ->with('toast', [
                    'type' => 'error',
                    'message' => 'Please verify your owner profile before adding a vehicle.',
                ]);
        }

        $rejectedRequest = CarTypeRequest::where('requested_by', $user->id)
            ->where('status', 'rejected')
            ->latest()
            ->first();

        return Inertia::render('create-vehicle', [
            'carTypes' => CarType::where('is_active', true)
                ->orderBy('brand')
                ->orderBy('model')
                ->get(),
            'locations' => Location::orderBy('name')->get(['id', 'name']),
            'rejectedRequest' => $rejectedRequest ? [
                'brand' => $rejectedRequest->brand,
                'model' => $rejectedRequest->model,
                'year' => $rejectedRequest->year,
                'admin_note' => $rejectedRequest->admin_note,
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (
            $user->role === 'owner' &&
            $user->ownerProfile?->verification_status !== 'approved'
        ) {
            return redirect()
                ->route('profile.edit')
                ->with('toast', [
                    'type' => 'error',
                    'message' => 'Please verify your owner profile before adding a vehicle.',
                ]);
        }

        $validated = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'plate_number' => 'required|string|max:50|unique:cars',
            'category' => 'required|string|max:100',
            'color' => 'required|string|max:50',
            'fuel_type' => 'required|string|max:50',
            'transmission' => 'required|string|max:50',
            'daily_price' => 'required|numeric|min:0',
            'availability_status' => 'nullable|in:available,maintenance',
            'engine_size' => 'required|string|max:50',
            'mileage' => 'required|integer|min:0',
            'seats' => 'required|integer|min:1|max:10',
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

        $isAdmin = $user->role === 'admin';

        $template = $isAdmin
            ? null
            : CarType::where('is_active', true)
                ->where('brand', $validated['brand'])
                ->where('model', $validated['model'])
                ->get()
                ->first(fn (CarType $carType) => $carType->matchesYear($validated['year']));

        if (! $isAdmin && $template === null) {
            $exists = CarTypeRequest::where('requested_by', auth()->id())
                ->where('brand', $validated['brand'])
                ->where('model', $validated['model'])
                ->where('year', $validated['year'])
                ->where('status', 'pending')
                ->exists();

            if ($exists) {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'You already have a pending request for this configuration.',
                ]);
            }

            $photos = [];

            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $photos[] = $photo->store('car-photos', 'public');
                }
            }

            $documentPath = null;

            if ($request->hasFile('ownership_document')) {
                $documentPath = $request->file('ownership_document')
                    ->store('vehicle_documents', 'public');
            }

            CarTypeRequest::create([
                'requested_by' => auth()->id(),
                'brand' => $validated['brand'],
                'model' => $validated['model'],
                'year' => $validated['year'],
                'category' => $validated['category'],
                'color' => $validated['color'],
                'fuel_type' => $validated['fuel_type'],
                'transmission' => $validated['transmission'],
                'engine_size' => $validated['engine_size'] ?? null,
                'seats' => $validated['seats'] ?? null,
                'plate_number' => $validated['plate_number'],
                'daily_price' => $validated['daily_price'],
                'mileage' => $validated['mileage'] ?? null,
                'description' => $validated['description'] ?? null,
                'availability_status' => $validated['availability_status'] ?? 'available',
                'photos' => $photos,
                'document_path' => $documentPath,
                'primary_photo_index' => $validated['primary_photo_index'] ?? 0,
                'ownership_expiry' => $validated['ownership_expiry'] ?? null,
                'available_periods' => $validated['available_periods'] ?? [],
                'status' => 'pending',
            ]);

            return redirect()->route('vehicles.index')->with('toast', [
                'type' => 'success',
                'message' => 'Your vehicle was submitted as a configuration request. An admin will review it and create the configuration.',
            ]);
        }

        $car = Car::create([
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'plate_number' => $validated['plate_number'],
            'category' => $validated['category'],
            'color' => $validated['color'],
            'fuel_type' => $validated['fuel_type'],
            'transmission' => $validated['transmission'],
            'daily_price' => $validated['daily_price'],
            'engine_size' => $validated['engine_size'] ?? null,
            'mileage' => $validated['mileage'] ?? null,
            'seats' => $validated['seats'] ?? null,
            'description' => $validated['description'] ?? null,
            'owner_id' => auth()->id(),
            'approval_status' => $isAdmin ? 'approved' : 'pending',
            'availability_status' => $validated['availability_status'] ?? 'available',
        ]);

        if (! empty($validated['available_periods'])) {
            foreach ($validated['available_periods'] as $period) {
                CarAvailablePeriod::create([
                    'car_id' => $car->id,
                    'start_date' => $period['start_date'],
                    'end_date' => $period['end_date'],
                ]);
            }
        } else {
            CarAvailablePeriod::create([
                'car_id' => $car->id,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addYear()->toDateString(),
            ]);
        }
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
                'verification_status' => $isAdmin ? 'approved' : 'pending',
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

        $car->load(['images', 'documents', 'reviews.reviewer', 'availablePeriods']);

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
            'fuel_type' => 'required|string|max:50',
            'transmission' => 'required|string|max:50',
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
        // Only content changes (not available-date ranges or availability status)
        // require the vehicle to be reviewed by an admin again. If the edited
        // content no longer matches an admin configuration, it is submitted as a
        // configuration request instead of being saved.
        if ($user->role !== 'admin' && $this->contentChanged($car, $validated, $request)) {
            $template = CarType::where('is_active', true)
                ->where('brand', $validated['brand'])
                ->where('model', $validated['model'])
                ->get()
                ->first(fn (CarType $carType) => $carType->matchesYear($validated['year']));

            if ($template === null) {
                $exists = CarTypeRequest::where('requested_by', auth()->id())
                    ->where('brand', $validated['brand'])
                    ->where('model', $validated['model'])
                    ->where('year', $validated['year'])
                    ->where('status', 'pending')
                    ->exists();

                if ($exists) {
                    return back()->with('toast', [
                        'type' => 'error',
                        'message' => 'You already have a pending request for this configuration.',
                    ]);
                }

                $photos = [];

                if ($request->hasFile('photos')) {
                    foreach ($request->file('photos') as $photo) {
                        $photos[] = $photo->store('car-photos', 'public');
                    }
                }

                $documentPath = null;

                if ($request->hasFile('ownership_document')) {
                    $documentPath = $request->file('ownership_document')
                        ->store('vehicle_documents', 'public');
                }

                CarTypeRequest::create([
                    'requested_by' => auth()->id(),
                    'brand' => $validated['brand'],
                    'model' => $validated['model'],
                    'year' => $validated['year'],
                    'category' => $validated['category'],
                    'color' => $validated['color'],
                    'fuel_type' => $validated['fuel_type'],
                    'transmission' => $validated['transmission'],
                    'engine_size' => $validated['engine_size'] ?? null,
                    'seats' => $validated['seats'] ?? null,
                    'plate_number' => $validated['plate_number'],
                    'daily_price' => $validated['daily_price'],
                    'mileage' => $validated['mileage'] ?? null,
                    'description' => $validated['description'] ?? null,
                    'availability_status' => $validated['availability_status'] ?? 'available',
                    'photos' => $photos,
                    'document_path' => $documentPath,
                    'primary_photo_index' => $validated['primary_photo_index'] ?? 0,
                    'ownership_expiry' => $validated['ownership_expiry'] ?? null,
                    'available_periods' => $validated['available_periods'] ?? [],
                    'status' => 'pending',
                ]);

                return back()->with('toast', [
                    'type' => 'success',
                    'message' => 'Your changes do not match an existing configuration and were submitted as a configuration request.',
                ]);
            }

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

    /**
     * Determine whether the submitted edit changes substantive vehicle content
     * (as opposed to available date ranges or the availability status).
     *
     * @param  array<string, mixed>  $validated
     */
    private function contentChanged(Car $car, array $validated, Request $request): bool
    {
        $contentFields = [
            'brand',
            'model',
            'year',
            'plate_number',
            'category',
            'color',
            'fuel_type',
            'transmission',
            'daily_price',
            'engine_size',
            'mileage',
            'seats',
            'description',
        ];

        foreach ($contentFields as $field) {
            $current = $car->getRawOriginal($field);
            $incoming = $validated[$field] ?? null;

            if ($this->valueChanged($current, $incoming)) {
                return true;
            }
        }

        return $request->hasFile('photos') || $request->hasFile('ownership_document');
    }

    private function valueChanged(mixed $current, mixed $incoming): bool
    {
        $current = $current === '' ? null : $current;
        $incoming = $incoming === '' ? null : $incoming;

        if ($current === null || $incoming === null) {
            return $current !== $incoming;
        }

        if (is_numeric($current) && is_numeric($incoming)) {
            return (float) $current != (float) $incoming;
        }

        return (string) $current !== (string) $incoming;
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

        if ($car->bookings()->whereNotIn('status', Booking::INACTIVE_STATUSES)->exists()) {
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

        if ($car->bookings()->whereNotIn('status', Booking::INACTIVE_STATUSES)->exists()) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Cannot modify available dates once the car has bookings.']);
        }
        if ($availablePeriod->car_id !== $car->id) {
            abort(404);
        }
        $availablePeriod->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Available date range removed.']);
    }
}
