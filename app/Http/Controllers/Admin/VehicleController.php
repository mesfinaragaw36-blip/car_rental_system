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
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function show(Car $car)
    {
        $car->load(['owner', 'images', 'documents']);

        return Inertia::render('admin/vehicle-details', [
            'vehicle' => $car,
        ]);
    }

    public function approve(Car $car)
    {
        $car->update(['approval_status' => 'approved']);

        return redirect()->back();
    }

    public function reject(Car $car)
    {
        $car->update(['approval_status' => 'rejected']);

        return redirect()->back();
    }

    public function approveDocument(Request $request, Car $car)
    {
        $request->validate([
            'document_id' => 'required|integer|exists:vehicle_documents,id',
        ]);

        $document = $car->documents()->findOrFail($request->input('document_id'));
        $document->update(['verification_status' => 'approved']);

        return redirect()->back();
    }

    public function rejectDocument(Request $request, Car $car)
    {
        $request->validate([
            'document_id' => 'required|integer|exists:vehicle_documents,id',
        ]);

        $document = $car->documents()->findOrFail($request->input('document_id'));
        $document->update(['verification_status' => 'rejected']);

        return redirect()->back();
    }
}