<?php

namespace App\Http\Controllers;

use App\Models\CarImage;
use Inertia\Inertia;

class CarImageController extends Controller
{
    public function index()
    {
        $images = CarImage::all();

        return Inertia::render('VehicleImages', [
            'images' => $images,
        ]);
    }
}