<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CarImage;
use App\Models\CarType;
use App\Models\CarTypeName;
use App\Models\VehicleDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Car::with(['owner', 'images'])->latest();

        if ($request->filled('status')) {
            $query->where('approval_status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($q) => $q->where('brand', 'like', "%{$search}%")
                ->orWhere('model', 'like', "%{$search}%")
                ->orWhere('plate_number', 'like', "%{$search}%")
                ->orWhereHas('owner', fn ($q2) => $q2->where('name', 'like', "%{$search}%")));
        }

        $vehicles = $query->paginate(15)->withQueryString();

        return Inertia::render('admin/vehicles', [
            'vehicles' => $vehicles,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/vehicle-create', [
            'carTypeNames' => CarTypeName::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'carTypes' => CarType::where('is_active', true)->with('carTypeName:id,name')->orderBy('brand')->orderBy('model')->get(),
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
            'approval_status' => 'approved',
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
                'verification_status' => 'approved',
            ]);
        }

        return redirect()->route('admin.vehicles')->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle added and approved.',
        ]);
    }

    public function toggleStatus(Car $car): RedirectResponse
    {
        if ($car->availability_status !== 'inactive') {
            // Deactivating: block if there are active bookings
            if ($car->bookings()->whereNotIn('status', Booking::INACTIVE_STATUSES)->exists()) {
                return back()->with('toast', [
                    'type' => 'error',
                    'message' => 'Cannot deactivate a vehicle with active bookings.',
                ]);
            }

            $car->update(['availability_status' => 'inactive']);

            return back()->with('toast', [
                'type' => 'success',
                'message' => "{$car->brand} {$car->model} has been deactivated.",
            ]);
        }

        // Reactivating
        $car->update(['availability_status' => 'available']);

        return back()->with('toast', [
            'type' => 'success',
            'message' => "{$car->brand} {$car->model} has been reactivated.",
        ]);
    }

    public function destroy(Car $car): RedirectResponse
    {
        if ($car->bookings()->whereNotIn('status', Booking::INACTIVE_STATUSES)->exists()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete a vehicle that has active bookings.',
            ]);
        }

        $car->delete();

        return redirect()->route('admin.vehicles')->with('toast', [
            'type' => 'success',
            'message' => 'Vehicle deleted.',
        ]);
    }

    public function show(Car $car)
    {
        $car->load(['owner', 'images', 'documents']);

        $reviews = $car->reviews()->with('reviewer')->latest()->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'reviewer' => ['id' => $r->reviewer->id, 'name' => $r->reviewer->name],
                'rating' => $r->rating,
                'review_text' => $r->review_text,
                'created_at' => $r->created_at->toDateTimeString(),
            ];
        })->toArray();

        return Inertia::render('admin/vehicle-details', [
            'vehicle' => array_merge($car->toArray(), ['reviews' => $reviews]),
        ]);
    }

    public function approve(Car $car)
    {
        $car->update([
            'approval_status' => 'approved',
            'rejection_reason' => null,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$car->brand} {$car->model} approved.",
        ]);

        return redirect()->back();
    }

    public function reject(Request $request, Car $car)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $car->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        Inertia::flash('toast', [
            'type' => 'error',
            'message' => "{$car->brand} {$car->model} rejected.",
        ]);

        return redirect()->back();
    }

    public function approveDocument(Request $request, Car $car)
    {
        $request->validate([
            'document_id' => 'required|integer|exists:vehicle_documents,id',
        ]);

        $document = $car->documents()->findOrFail($request->input('document_id'));
        $document->update(['verification_status' => 'approved', 'rejection_reason' => null]);

        return redirect()->back();
    }

    public function rejectDocument(Request $request, Car $car)
    {
        $validated = $request->validate([
            'document_id' => 'required|integer|exists:vehicle_documents,id',
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $document = $car->documents()->findOrFail($validated['document_id']);
        $document->update([
            'verification_status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return redirect()->back();
    }
}
