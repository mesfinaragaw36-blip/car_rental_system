<?php

use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\CarImageController;
use App\Http\Controllers\Admin\DriverController as AdminDriverController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\VehicleDocumentController;
use App\Http\Controllers\Customer\BookingController as CustomerBooking;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboard;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Customer\VehicleController as CustomerVehicle;
use App\Http\Controllers\Driver\AssignmentController as DriverAssignment;
use App\Http\Controllers\Driver\DashboardController as DriverDashboard;
use App\Http\Controllers\Owner\BookingController as OwnerBooking;
use App\Http\Controllers\Owner\DashboardController as OwnerDashboard;
use App\Http\Controllers\Owner\PaymentController as OwnerPaymentController;
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
        Route::get('/vehicles/{car}', [VehicleController::class, 'show'])->name('vehicles.show');
        Route::post('/vehicles/{car}/approve', [VehicleController::class, 'approve'])->name('vehicles.approve');
        Route::post('/vehicles/{car}/reject', [VehicleController::class, 'reject'])->name('vehicles.reject');
        Route::post('/vehicles/{car}/documents/approve', [VehicleController::class, 'approveDocument'])->name('vehicles.documents.approve');
        Route::post('/vehicles/{car}/documents/reject', [VehicleController::class, 'rejectDocument'])->name('vehicles.documents.reject');
        Route::get('/vehicle-images', [CarImageController::class, 'index'])->name('vehicle-images');
        Route::get('/vehicle-documents', [VehicleDocumentController::class, 'index'])->name('vehicle-documents');
        Route::post('/vehicle-documents', [VehicleDocumentController::class, 'store'])->name('vehicle-documents.store');
        Route::get('/payments', [AdminPaymentController::class, 'index'])->name('payments.index');

        // Bookings
        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
        Route::post('/bookings/{booking}/cancel', [AdminBookingController::class, 'cancel'])->name('bookings.cancel');

        // Drivers
        Route::get('/drivers', [AdminDriverController::class, 'index'])->name('drivers.index');
        Route::post('/drivers/{driver}/suspend', [AdminDriverController::class, 'suspend'])->name('drivers.suspend');
        Route::post('/drivers/{driver}/activate', [AdminDriverController::class, 'activate'])->name('drivers.activate');

        // User management
        Route::get('/users/trashed', [UserController::class, 'trashed'])->name('users.trashed');
        Route::post('/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        Route::post('/users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');

        // Owner profile verification
        Route::post('/users/{user}/verify-owner', [UserController::class, 'verifyOwner'])->name('users.verify-owner');
        Route::post('/users/{user}/reject-owner', [UserController::class, 'rejectOwner'])->name('users.reject-owner');

        // Driver profile verification
        Route::post('/users/{user}/verify-driver', [UserController::class, 'verifyDriver'])->name('users.verify-driver');
        Route::post('/users/{user}/reject-driver', [UserController::class, 'rejectDriver'])->name('users.reject-driver');

        // Staff management
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('/staff/{staff}', [StaffController::class, 'show'])->name('staff.show');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
        Route::post('/staff/{staff}/suspend', [StaffController::class, 'suspend'])->name('staff.suspend');
        Route::post('/staff/{staff}/activate', [StaffController::class, 'activate'])->name('staff.activate');

        // Roles & Permissions
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::get('/roles/{role}', [RoleController::class, 'show'])->name('roles.show');
        Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
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

        Route::get('/bookings', [OwnerBooking::class, 'index'])->name('bookings.index');
        Route::post('/bookings/{booking}/approve', [OwnerBooking::class, 'approve'])->name('bookings.approve');
        Route::post('/bookings/{booking}/reject', [OwnerBooking::class, 'reject'])->name('bookings.reject');
        Route::post('/bookings/{booking}/assign-driver', [OwnerBooking::class, 'assignDriver'])->name('bookings.assign-driver');

        Route::get('/payments', [OwnerPaymentController::class, 'index'])->name('payments.index');
    });

// Customer routes
Route::middleware(['auth', 'role:customer'])
    ->prefix('customer')
    ->name('customer.')
    ->group(function () {
        Route::get('/dashboard', [CustomerDashboard::class, 'index'])->name('dashboard');
        Route::get('/browse-cars', [CustomerVehicle::class, 'index'])->name('cars.index');
        Route::get('/cars/{car}', [CustomerVehicle::class, 'show'])->name('cars.show');

        Route::post('/cars/{car}/book', [CustomerBooking::class, 'store'])->name('bookings.store');
        Route::get('/bookings', [CustomerBooking::class, 'index'])->name('bookings.index');
        Route::post('/bookings/{booking}/pay', [CustomerBooking::class, 'pay'])->name('bookings.pay');
        Route::get('/bookings/{booking}/payment', [PaymentController::class, 'create'])->name('payments.create');
        Route::post('/bookings/{booking}/payment', [PaymentController::class, 'store'])->name('payments.store');
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    });

// Driver routes
Route::middleware(['auth', 'role:driver'])
    ->prefix('driver')
    ->name('driver.')
    ->group(function () {
        Route::get('/dashboard', [DriverDashboard::class, 'index'])->name('dashboard');
        Route::get('/assignments', [DriverAssignment::class, 'index'])->name('assignments');
        Route::post('/assignments/{assignment}/accept', [DriverAssignment::class, 'accept'])->name('assignments.accept');
        Route::post('/assignments/{assignment}/complete', [DriverAssignment::class, 'complete'])->name('assignments.complete');
    });

require __DIR__.'/settings.php';
