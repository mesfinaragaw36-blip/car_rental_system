<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleDocumentController extends Controller
{
    public function index()
    {
        $documents = VehicleDocument::with('car')->latest()->get();

        return Inertia::render('admin/vehicle-documents', [
            'documents' => $documents,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'document_type' => 'required|in:Registration,Ownership',
            'document' => 'required|file|mimes:jpeg,png,jpg,gif,webp,pdf|max:10240',
            'expiry_date' => 'nullable|date|after:today',
        ]);


        $path = $request->file('document')
            ->store('vehicle_documents', 'public');


        VehicleDocument::create([
            'car_id' => $validated['car_id'],
            'document_type' => $validated['document_type'],
            'document_path' => $path,
            'expiry_date' => $validated['expiry_date'] ?? null,
            'verification_status' => 'pending',
        ]);


        return back()->with('success', 'Document uploaded successfully');
    }
}