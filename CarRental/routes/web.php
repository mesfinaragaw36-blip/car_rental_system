<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OwnerProfileController;
use App\Http\Controllers\DriverProfileController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\CarImageController;
use App\Http\Controllers\VehicleDocumentController;
use App\Http\Controllers\OwnerVehicleController;

Route::inertia('/', 'Welcome')->name('home');

Route::inertia('/cars', 'Cars')->name('cars');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::inertia('/dashboard', 'Dashboard')->name('dashboard');


    // Customer Profile
    Route::get('/customer/profile', [CustomerProfileController::class, 'show'])
        ->name('customer.profile');

    Route::put('/customer/profile', [CustomerProfileController::class, 'update'])
        ->name('customer.profile.update');


    // Owner Profile
    Route::get('/owner/profile', [OwnerProfileController::class, 'show'])
        ->name('owner.profile');

    Route::put('/owner/profile', [OwnerProfileController::class, 'update'])
        ->name('owner.profile.update');


    // Driver Profile
    Route::get('/driver/profile', [DriverProfileController::class, 'show'])
        ->name('driver.profile');

    Route::put('/driver/profile', [DriverProfileController::class, 'update'])
        ->name('driver.profile.update');


    // Vehicles
    Route::get('/vehicles', [VehicleController::class, 'index'])
        ->name('vehicles.index');


    // Owner Vehicles
    Route::get('/owner/vehicles', [OwnerVehicleController::class, 'index'])
        ->name('owner.vehicles');

    Route::get('/owner/vehicles/create', [OwnerVehicleController::class, 'create'])
        ->name('owner.vehicles.create');

    Route::post('/owner/vehicles', [OwnerVehicleController::class, 'store'])
        ->name('owner.vehicles.store');


    // Vehicle Images
    Route::get('/vehicle-images', [CarImageController::class, 'index'])
        ->name('vehicle-images.index');


    // Vehicle Documents
    Route::get('/vehicle-documents', [VehicleDocumentController::class, 'index'])
        ->name('vehicle-documents.index');

});

require __DIR__.'/settings.php';
