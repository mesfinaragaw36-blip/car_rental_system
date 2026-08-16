<?php

namespace App\Http\Controllers;

use App\Models\CarTypeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CarTypeRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|string|max:50',
            'category' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'fuel_type' => 'nullable|string|max:50',
            'transmission' => 'nullable|string|max:50',
            'engine_size' => 'nullable|string|max:50',
            'seats' => 'nullable|integer|min:1|max:60',
            'plate_number' => 'nullable|string|max:50',
            'daily_price' => 'nullable|numeric|min:0',
            'mileage' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'availability_status' => 'nullable|in:available,maintenance',
            'note' => 'nullable|string|max:1000',
            'photos' => 'nullable',
            'photos.*' => 'image|max:10240',
            'primary_photo_index' => 'nullable|integer|min:0',
            'ownership_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:10240',
            'ownership_expiry' => 'nullable|date|after:today',
            'available_periods' => 'nullable|array',
        ]);

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

        CarTypeRequest::create(array_merge($validated, [
            'requested_by' => auth()->id(),
            'photos' => $photos,
            'document_path' => $documentPath,
            'status' => 'pending',
        ]));

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Your request has been sent. The admin will review it shortly.',
        ]);
    }

    public function show(Request $request, CarTypeRequest $carTypeRequest): Response
    {
        abort_unless(
            $carTypeRequest->requested_by === $request->user()->id
                || $request->user()->role === 'admin',
            403,
        );

        return Inertia::render('car-type-request-status', [
            'request' => [
                'id' => $carTypeRequest->id,
                'brand' => $carTypeRequest->brand,
                'model' => $carTypeRequest->model,
                'year' => $carTypeRequest->year,
                'category' => $carTypeRequest->category,
                'color' => $carTypeRequest->color,
                'fuel_type' => $carTypeRequest->fuel_type,
                'transmission' => $carTypeRequest->transmission,
                'engine_size' => $carTypeRequest->engine_size,
                'seats' => $carTypeRequest->seats,
                'plate_number' => $carTypeRequest->plate_number,
                'daily_price' => $carTypeRequest->daily_price,
                'mileage' => $carTypeRequest->mileage,
                'description' => $carTypeRequest->description,
                'note' => $carTypeRequest->note,
                'photos' => $carTypeRequest->photos ?? [],
                'document_path' => $carTypeRequest->document_path,
                'status' => $carTypeRequest->status,
                'admin_note' => $carTypeRequest->admin_note,
                'created_at' => $carTypeRequest->created_at?->toDateTimeString(),
                'reviewed_at' => $carTypeRequest->reviewed_at?->toDateTimeString(),
            ],
        ]);
    }
}
