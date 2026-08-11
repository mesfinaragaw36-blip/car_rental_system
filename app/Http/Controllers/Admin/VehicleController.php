<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
