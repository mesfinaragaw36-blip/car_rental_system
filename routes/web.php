<?php

use App\Http\Controllers\Admin\CarImageController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\VehicleDocumentController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboard;
use App\Http\Controllers\Customer\ProfileController as CustomerProfile;
use App\Http\Controllers\Driver\DashboardController as DriverDashboard;
use App\Http\Controllers\Driver\ProfileController as DriverProfile;
use App\Http\Controllers\Owner\DashboardController as OwnerDashboard;
use App\Http\Controllers\Owner\ProfileController as OwnerProfile;
use App\Http\Controllers\Owner\VehicleController as OwnerVehicle;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');

// Admin routes
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');
        Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles');
        Route::post('/vehicles/{car}/approve', [VehicleController::class, 'approve'])->name('vehicles.approve');
        Route::post('/vehicles/{car}/reject', [VehicleController::class, 'reject'])->name('vehicles.reject');
        Route::get('/vehicle-images', [CarImageController::class, 'index'])->name('vehicle-images');
        Route::get('/vehicle-documents', [VehicleDocumentController::class, 'index'])->name('vehicle-documents');
    });

// Owner routes
Route::middleware(['auth', 'role:owner'])
    ->prefix('owner')
    ->name('owner.')
    ->group(function () {
        Route::get('/dashboard', [OwnerDashboard::class, 'index'])->name('dashboard');
        Route::get('/profile', [OwnerProfile::class, 'show'])->name('profile');
        Route::put('/profile', [OwnerProfile::class, 'update'])->name('profile.update');
        Route::get('/vehicles', [OwnerVehicle::class, 'index'])->name('vehicles');
        Route::get('/vehicles/create', [OwnerVehicle::class, 'create'])->name('vehicles.create');
        Route::post('/vehicles', [OwnerVehicle::class, 'store'])->name('vehicles.store');
        Route::get('/vehicles/{car}/edit', [OwnerVehicle::class, 'edit'])->name('vehicles.edit');
        Route::put('/vehicles/{car}', [OwnerVehicle::class, 'update'])->name('vehicles.update');
        Route::delete('/vehicles/{car}', [OwnerVehicle::class, 'destroy'])->name('vehicles.destroy');
    });

// Customer routes
Route::middleware(['auth', 'role:customer'])
    ->prefix('customer')
    ->name('customer.')
    ->group(function () {
        Route::get('/dashboard', [CustomerDashboard::class, 'index'])->name('dashboard');
        Route::get('/profile', [CustomerProfile::class, 'show'])->name('profile');
        Route::put('/profile', [CustomerProfile::class, 'update'])->name('profile.update');
    });

// Driver routes
Route::middleware(['auth', 'role:driver'])
    ->prefix('driver')
    ->name('driver.')
    ->group(function () {
        Route::get('/dashboard', [DriverDashboard::class, 'index'])->name('dashboard');
        Route::get('/profile', [DriverProfile::class, 'show'])->name('profile');
        Route::put('/profile', [DriverProfile::class, 'update'])->name('profile.update');
    });

require __DIR__.'/settings.php';
