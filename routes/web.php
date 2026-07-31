<?php

use App\Http\Controllers\Admin\CarImageController;
use App\Http\Controllers\Admin\CarTypeNameController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VehicleController as AdminVehicleController;
use App\Http\Controllers\Admin\VehicleDocumentController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BrowseCarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverBookingController;
use App\Http\Controllers\DriverProfileController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::post('/bookings/{booking}/approve', [BookingController::class, 'approve'])->name('bookings.approve');
    Route::post('/bookings/{booking}/reject', [BookingController::class, 'reject'])->name('bookings.reject');
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
    Route::post('/bookings/{booking}/assign-driver', [BookingController::class, 'assignDriver'])->name('bookings.assign-driver');
    Route::post('/bookings/{booking}/picked-up', [BookingController::class, 'markPickedUp'])->name('bookings.picked-up');
    Route::post('/bookings/{booking}/returned', [BookingController::class, 'markReturned'])->name('bookings.returned');
    Route::post('/bookings/{booking}/completed', [BookingController::class, 'markCompleted'])->name('bookings.completed');

    // Payments
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/bookings/{booking}/payment', [PaymentController::class, 'create'])->name('payments.create');
    Route::post('/bookings/{booking}/payment', [PaymentController::class, 'store'])->name('payments.store');

    // Vehicles (owner management)
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
    Route::get('/vehicles/create', [VehicleController::class, 'create'])->name('vehicles.create');
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store');
    Route::get('/vehicles/{car}/edit', [VehicleController::class, 'edit'])->name('vehicles.edit');
    Route::put('/vehicles/{car}', [VehicleController::class, 'update'])->name('vehicles.update');
    Route::delete('/vehicles/{car}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');

    // Browse cars
    Route::get('/browse-cars', [BrowseCarController::class, 'index'])->name('cars.index');
    Route::get('/cars/{car}', [BrowseCarController::class, 'show'])->name('cars.show');
    Route::post('/cars/{car}/book', [BrowseCarController::class, 'book'])->name('cars.book');

    // Assignments
    Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::post('/assignments/{assignment}/accept', [AssignmentController::class, 'accept'])->name('assignments.accept');
    Route::post('/assignments/{assignment}/reject', [AssignmentController::class, 'reject'])->name('assignments.reject');
    Route::post('/assignments/{assignment}/complete', [AssignmentController::class, 'complete'])->name('assignments.complete');
    Route::post('/assignments/{assignment}/approve-claim', [AssignmentController::class, 'approveClaim'])->name('assignments.approve-claim');
    Route::post('/assignments/{assignment}/reject-claim', [AssignmentController::class, 'rejectClaim'])->name('assignments.reject-claim');

    // Driver features
    Route::get('/driver/profile', [DriverProfileController::class, 'show'])->name('driver.profile');
    Route::post('/driver/profile', [DriverProfileController::class, 'update'])->name('driver.profile.update');
    Route::post('/driver/toggle-availability', [DriverProfileController::class, 'toggleAvailability'])->name('driver.toggle-availability');
    Route::get('/driver/available-bookings', [DriverBookingController::class, 'available'])->name('driver.available-bookings');
    Route::post('/driver/claim/{booking}', [DriverBookingController::class, 'claim'])->name('driver.claim');
    Route::get('/driver/trip-history', [DriverBookingController::class, 'history'])->name('driver.trip-history');

    // Admin-only routes
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/vehicles', [AdminVehicleController::class, 'index'])->name('vehicles');
        Route::get('/vehicles/{car}', [AdminVehicleController::class, 'show'])->name('vehicles.show');
        Route::post('/vehicles/{car}/approve', [AdminVehicleController::class, 'approve'])->name('vehicles.approve');
        Route::post('/vehicles/{car}/reject', [AdminVehicleController::class, 'reject'])->name('vehicles.reject');
        Route::post('/vehicles/{car}/documents/approve', [AdminVehicleController::class, 'approveDocument'])->name('vehicles.documents.approve');
        Route::post('/vehicles/{car}/documents/reject', [AdminVehicleController::class, 'rejectDocument'])->name('vehicles.documents.reject');
        Route::get('/vehicle-images', [CarImageController::class, 'index'])->name('vehicle-images');
        Route::get('/vehicle-documents', [VehicleDocumentController::class, 'index'])->name('vehicle-documents');
        Route::post('/vehicle-documents', [VehicleDocumentController::class, 'store'])->name('vehicle-documents.store');

        Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
        Route::post('/drivers/{driver}/suspend', [DriverController::class, 'suspend'])->name('drivers.suspend');
        Route::post('/drivers/{driver}/activate', [DriverController::class, 'activate'])->name('drivers.activate');

        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/users/trashed', [UserController::class, 'trashed'])->name('users.trashed');
        Route::post('/users/{id}/restore', [UserController::class, 'restore'])->name('users.restore');
        Route::post('/users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        Route::post('/users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');
        Route::post('/users/{user}/verify-owner', [UserController::class, 'verifyOwner'])->name('users.verify-owner');
        Route::post('/users/{user}/reject-owner', [UserController::class, 'rejectOwner'])->name('users.reject-owner');
        Route::post('/users/{user}/verify-driver', [UserController::class, 'verifyDriver'])->name('users.verify-driver');
        Route::post('/users/{user}/reject-driver', [UserController::class, 'rejectDriver'])->name('users.reject-driver');

        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::get('/staff/create', [StaffController::class, 'create'])->name('staff.create');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::get('/staff/{staff}', [StaffController::class, 'show'])->name('staff.show');
        Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');
        Route::post('/staff/{staff}/suspend', [StaffController::class, 'suspend'])->name('staff.suspend');
        Route::post('/staff/{staff}/activate', [StaffController::class, 'activate'])->name('staff.activate');

        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::get('/roles/{role}', [RoleController::class, 'show'])->name('roles.show');
        Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

        Route::get('/car-types/type-names', [CarTypeNameController::class, 'index'])->name('car-types.type-names');
        Route::post('/car-types/type-names', [CarTypeNameController::class, 'store'])->name('car-types.type-names.store');
        Route::put('/car-types/type-names/{carTypeName}', [CarTypeNameController::class, 'update'])->name('car-types.type-names.update');
        Route::delete('/car-types/type-names/{carTypeName}', [CarTypeNameController::class, 'destroy'])->name('car-types.type-names.destroy');
    });
});

require __DIR__.'/settings.php';
