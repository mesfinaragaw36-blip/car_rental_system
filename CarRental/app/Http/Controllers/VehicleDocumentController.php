<?php

namespace App\Http\Controllers;

use App\Models\VehicleDocument;
use Inertia\Inertia;

class VehicleDocumentController extends Controller
{
    public function index()
    {
        $documents = VehicleDocument::all();

        return Inertia::render('VehicleDocuments', [
            'documents' => $documents,
        ]);
    }
}