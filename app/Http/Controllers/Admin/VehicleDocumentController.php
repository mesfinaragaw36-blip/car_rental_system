<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VehicleDocument;
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
}
