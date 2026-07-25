<?php

use App\Http\Controllers\Admin\CarImageController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\VehicleDocumentController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboard;
use App\Http\Controllers\Driver\DashboardController as DriverDashboard;
use App\Http\Controllers\Owner\DashboardController as OwnerDashboard;
use App\Http\Controllers\Owner\VehicleController as OwnerVehicle;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        $role = auth()->user()->role;

        return match ($role) {
            'admin' => redirect()->route('admin.dashboard'),
            'owner' => redirect()->route('owner.dashboard'),
            'driver' => redirect()->route('driver.dashboard'),
            default => redirect()->route('customer.dashboard'),
        };
    }

    return Inertia::render('Welcome');
})->name('home');

// Admin routes
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');
        Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles');
        Route::post('/vehicles/{car}/approve', [VehicleController::class, 'approve'])->name('vehicles.approve');
        Route::post('/vehicles/{car}/reject', [VehicleController::class, 'reject'])->name('vehicles.reject');
        Route::post('/vehicles/{car}/documents/approve', [VehicleController::class, 'approveDocument'])->name('vehicles.documents.approve');
        Route::post('/vehicles/{car}/documents/reject', [VehicleController::class, 'rejectDocument'])->name('vehicles.documents.reject');
        Route::get('/vehicle-images', [CarImageController::class, 'index'])->name('vehicle-images');
        Route::get('/vehicle-documents', [VehicleDocumentController::class, 'index'])->name('vehicle-documents');
        Route::post('/vehicle-documents', [VehicleDocumentController::class, 'store'])->name('vehicle-documents.store');
    });

// Owner routes
Route::middleware(['auth', 'role:owner'])
    ->prefix('owner')
    ->name('owner.')
    ->group(function () {
        Route::get('/dashboard', [OwnerDashboard::class, 'index'])->name('dashboard');
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
    });

// Driver routes
Route::middleware(['auth', 'role:driver'])
    ->prefix('driver')
    ->name('driver.')
    ->group(function () {
        Route::get('/dashboard', [DriverDashboard::class, 'index'])->name('dashboard');
    });

require __DIR__.'/settings.php';
