<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\OwnerProfileController;
use App\Http\Controllers\DriverProfileController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\CarImageController;
use App\Http\Controllers\VehicleDocumentController;
use App\Http\Controllers\OwnerVehicleController;

Route::inertia('/', 'Welcome')->name('home');

Route::inertia('/cars', 'Cars')->name('cars');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::inertia('/dashboard', 'Dashboard')->name('dashboard');

    Route::get('/owner/profile', [OwnerProfileController::class, 'show'])
        ->name('owner.profile');

        Route::get('/driver/profile', [DriverProfileController::class, 'show'])
    ->name('driver.profile');

    Route::put('/driver/profile', [DriverProfileController::class, 'update'])
    ->name('driver.profile.update');

    Route::get('/vehicles', [VehicleController::class, 'index'])
    ->name('vehicles.index');

    Route::get('/vehicle-images', [CarImageController::class, 'index'])
    ->name('vehicle-images.index');

Route::get('/vehicle-documents', [VehicleDocumentController::class, 'index'])
    ->name('vehicle-documents.index');

    Route::get('/owner/vehicles', [OwnerVehicleController::class, 'index'])
    ->name('owner.vehicles');

    Route::get('/owner/vehicles/create', [OwnerVehicleController::class, 'create'])
    ->name('owner.vehicles.create');

Route::post('/owner/vehicles', [OwnerVehicleController::class, 'store'])
    ->name('owner.vehicles.store');

    Route::get('/owner/profile', [OwnerProfileController::class, 'show'])
        ->name('owner.profile');

    Route::put('/owner/profile', [OwnerProfileController::class, 'update'])
        ->name('owner.profile.update');

});

require __DIR__.'/settings.php';