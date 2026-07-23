<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CarImage;
use Inertia\Inertia;

class CarImageController extends Controller
{
    public function index()
    {
        $images = CarImage::with('car')->latest()->get();

        return Inertia::render('admin/vehicle-images', [
            'images' => $images,
        ]);
    }
}
