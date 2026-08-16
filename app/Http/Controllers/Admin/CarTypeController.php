<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CarImage;
use App\Models\CarType;
use App\Models\CarTypeRequest;
use App\Models\Notification;
use App\Models\VehicleDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CarTypeController extends Controller
{
    public function index(): Response
    {
        $configurations = CarType::orderBy('brand')
            ->orderBy('model')
            ->paginate(12);

        $cars = Car::select(['brand', 'model', 'year'])->get();

        $configurations->getCollection()->transform(function (CarType $carType) use ($cars) {
            $carType->cars_count = $cars->filter(
                fn (Car $car) => $car->brand === $carType->brand
                    && $car->model === $carType->model
                    && $carType->matchesYear($car->year),
            )->count();

            return $carType;
        });

        $pendingRequests = CarTypeRequest::with('requester')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('admin/car-types/configurations', [
            'items' => $configurations->items(),
            'pagination' => [
                'current_page' => $configurations->currentPage(),
                'last_page' => $configurations->lastPage(),
                'per_page' => $configurations->perPage(),
                'total' => $configurations->total(),
                'prev_page' => $configurations->previousPageUrl() ? $configurations->currentPage() - 1 : null,
                'next_page' => $configurations->nextPageUrl() ? $configurations->currentPage() + 1 : null,
            ],
            'requests' => $pendingRequests->map(fn (CarTypeRequest $request) => [
                'id' => $request->id,
                'brand' => $request->brand,
                'model' => $request->model,
                'year' => $request->year,
                'category' => $request->category,
                'fuel_type' => $request->fuel_type,
                'transmission' => $request->transmission,
                'engine_size' => $request->engine_size,
                'seats' => $request->seats,
                'note' => $request->note,
                'requested_by' => $request->requester?->name ?? 'Unknown',
                'created_at' => $request->created_at?->toDateTimeString(),
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        $exists = CarType::where('brand', $validated['brand'])
            ->where('model', $validated['model'])
            ->where('year', $validated['year'])
            ->exists();

        if ($exists) {
            return back()->with('toast', ['type' => 'error', 'message' => 'A configuration for this brand, model, and year already exists.']);
        }

        CarType::create($validated);

        return redirect()->route('admin.car-types.configurations')->with('toast', ['type' => 'success', 'message' => 'Vehicle configuration created.']);
    }

    public function update(Request $request, CarType $carType): RedirectResponse
    {
        $validated = $this->validated($request);

        $exists = CarType::where('brand', $validated['brand'])
            ->where('model', $validated['model'])
            ->where('year', $validated['year'])
            ->where('id', '!=', $carType->id)
            ->exists();

        if ($exists) {
            return back()->with('toast', ['type' => 'error', 'message' => 'A configuration for this brand, model, and year already exists.']);
        }

        $carType->update($validated);

        return redirect()->route('admin.car-types.configurations')->with('toast', ['type' => 'success', 'message' => 'Vehicle configuration updated.']);
    }

    public function toggleActive(CarType $carType): RedirectResponse
    {
        $carType->update(['is_active' => ! $carType->is_active]);

        $status = $carType->is_active ? 'activated' : 'deactivated';

        return back()->with('toast', ['type' => 'success', 'message' => "Vehicle configuration {$status}."]);
    }

    public function approveRequest(Request $request, CarTypeRequest $carTypeRequest): RedirectResponse
    {
        if ($carTypeRequest->status !== 'pending') {
            return back()->with('toast', ['type' => 'error', 'message' => 'This request has already been reviewed.']);
        }

        $exists = CarType::where('brand', $carTypeRequest->brand)
            ->where('model', $carTypeRequest->model)
            ->where('year', $carTypeRequest->year)
            ->exists();

        if ($exists) {
            $carTypeRequest->update([
                'status' => 'rejected',
                'admin_note' => 'A configuration for this vehicle already exists.',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            $this->notify($carTypeRequest, 'configuration_rejected', 'A configuration for this vehicle already exists.');

            return back()->with('toast', ['type' => 'error', 'message' => 'A matching configuration already exists, so the request was rejected.']);
        }

        CarType::create([
            'brand' => $carTypeRequest->brand,
            'model' => $carTypeRequest->model,
            'year' => $carTypeRequest->year,
            'categories' => [$carTypeRequest->category ?? 'Other'],
            'fuel_types' => [$carTypeRequest->fuel_type ?? 'Petrol'],
            'transmissions' => [$carTypeRequest->transmission ?? 'Manual'],
            'engine_sizes' => $carTypeRequest->engine_size !== null ? [$carTypeRequest->engine_size] : null,
            'seats' => $carTypeRequest->seats !== null ? [$carTypeRequest->seats] : null,
            'colors' => $carTypeRequest->color !== null ? [$carTypeRequest->color] : null,
            'is_active' => true,
        ]);

        $carWasCreated = false;

        if ($carTypeRequest->plate_number !== null) {
            $car = Car::create([
                'brand' => $carTypeRequest->brand,
                'model' => $carTypeRequest->model,
                'year' => (int) $carTypeRequest->year,
                'plate_number' => $carTypeRequest->plate_number,
                'category' => $carTypeRequest->category ?? 'Other',
                'color' => $carTypeRequest->color ?? 'White',
                'fuel_type' => $carTypeRequest->fuel_type ?? 'Petrol',
                'transmission' => $carTypeRequest->transmission ?? 'Manual',
                'engine_size' => $carTypeRequest->engine_size,
                'mileage' => $carTypeRequest->mileage,
                'seats' => $carTypeRequest->seats,
                'daily_price' => $carTypeRequest->daily_price,
                'description' => $carTypeRequest->description,
                'owner_id' => $carTypeRequest->requested_by,
                'approval_status' => 'approved',
                'availability_status' => $carTypeRequest->availability_status ?? 'available',
            ]);

            if (! empty($carTypeRequest->available_periods)) {
                foreach ($carTypeRequest->available_periods as $period) {
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

            foreach ($carTypeRequest->photos ?? [] as $index => $path) {
                CarImage::create([
                    'car_id' => $car->id,
                    'image_path' => $path,
                    'is_primary' => $index === ($carTypeRequest->primary_photo_index ?? 0),
                ]);
            }

            if ($carTypeRequest->document_path !== null) {
                VehicleDocument::create([
                    'car_id' => $car->id,
                    'document_type' => 'Ownership',
                    'document_path' => $carTypeRequest->document_path,
                    'expiry_date' => $carTypeRequest->ownership_expiry,
                    'verification_status' => 'approved',
                ]);
            }

            $carWasCreated = true;
        }

        $carTypeRequest->update([
            'status' => 'approved',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        $message = "Your requested configuration \"{$carTypeRequest->brand} {$carTypeRequest->model} ({$carTypeRequest->year})\" was created.";

        if ($carWasCreated) {
            $message .= ' Your vehicle has been approved and is now live on the site.';
        } else {
            $message .= ' You can now add your vehicle using this configuration.';
        }

        $this->notify($carTypeRequest, 'configuration_approved', $message);

        return back()->with('toast', ['type' => 'success', 'message' => 'Configuration created and request approved.']);
    }

    public function rejectRequest(Request $request, CarTypeRequest $carTypeRequest): RedirectResponse
    {
        if ($carTypeRequest->status !== 'pending') {
            return back()->with('toast', ['type' => 'error', 'message' => 'This request has already been reviewed.']);
        }

        $validated = $request->validate([
            'admin_note' => 'required|string|max:1000',
        ]);

        $carTypeRequest->update([
            'status' => 'rejected',
            'admin_note' => $validated['admin_note'],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        $this->notify($carTypeRequest, 'configuration_rejected', $validated['admin_note']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Request rejected.']);
    }

    private function notify(CarTypeRequest $carTypeRequest, string $type, string $message): void
    {
        $approved = $type === 'configuration_approved';

        Notification::create([
            'user_id' => $carTypeRequest->requested_by,
            'type' => $type,
            'title' => $approved
                ? 'Configuration request approved'
                : 'Configuration request rejected',
            'message' => $approved
                ? $message
                : "Your request for \"{$carTypeRequest->brand} {$carTypeRequest->model} ({$carTypeRequest->year})\" was rejected. Reason: {$message}",
            'related_type' => CarTypeRequest::class,
            'related_id' => $carTypeRequest->id,
        ]);
    }

    public function destroy(CarType $carType): RedirectResponse
    {
        $carType->delete();

        return redirect()->route('admin.car-types.configurations')->with('toast', ['type' => 'success', 'message' => 'Vehicle configuration deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year_start' => ['required', 'regex:/^\d{4}$/'],
            'year_end' => ['nullable', 'regex:/^\d{4}$/', 'gte:year_start'],
            'categories' => 'required|array|min:1',
            'categories.*' => 'required|string|max:100',
            'fuel_types' => 'required|array|min:1',
            'fuel_types.*' => 'required|string|max:50',
            'transmissions' => 'required|array|min:1',
            'transmissions.*' => 'required|string|max:50',
            'engine_sizes' => 'required|array|min:1',
            'engine_sizes.*' => 'required|string|max:50',
            'seats' => 'nullable|array',
            'seats.*' => 'integer|min:1|max:60',
            'colors' => 'required|array|min:1',
            'colors.*' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        $year = $data['year_start'];

        if (($data['year_end'] ?? null) !== null && $data['year_end'] !== $data['year_start']) {
            $year = $data['year_start'].'-'.$data['year_end'];
        }

        unset($data['year_start'], $data['year_end']);
        $data['year'] = $year;

        $data['categories'] = $this->uniqueValues($data['categories']);
        $data['fuel_types'] = $this->uniqueValues($data['fuel_types']);
        $data['transmissions'] = $this->uniqueValues($data['transmissions']);
        $data['engine_sizes'] = $this->uniqueValues($data['engine_sizes']);
        $data['colors'] = $this->uniqueValues($data['colors']);

        if (isset($data['seats'])) {
            $data['seats'] = array_values(array_unique(array_map('intval', $data['seats'])));
        }

        return $data;
    }

    /**
     * @param  array<int, string>  $values
     * @return array<int, string>
     */
    private function uniqueValues(array $values): array
    {
        $trimmed = array_map(fn (string $value): string => trim($value), $values);

        return array_values(array_unique(array_filter($trimmed, fn (string $value): bool => $value !== '')));
    }
}
