<?php

use App\Http\Controllers\Admin\CarImageController;
use App\Http\Controllers\Admin\CarTypeController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VehicleController as AdminVehicleController;
use App\Http\Controllers\Admin\VehicleDocumentController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingDisputeController;
use App\Http\Controllers\BrowseCarController;
use App\Http\Controllers\CarTypeRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverBookingController;
use App\Http\Controllers\DriverProfileController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\VehicleController;
use App\Models\Booking;
use App\Models\Car;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $user = auth()->user();

    if ($user && in_array($user->role, ['owner', 'admin'], true)) {
        return redirect()->route('dashboard');
    }

    $cars = Car::with(['images'])
        ->where('approval_status', 'approved')
        ->where('availability_status', 'available')
        ->whereHas('availablePeriods', fn ($q) => $q->whereDate('end_date', '>=', now()->toDateString()))
        ->latest()
        ->take(6)
        ->get()
        ->map(function (Car $car) {
            $hasActiveBooking = $car->bookings()
                ->whereNotIn('status', Booking::INACTIVE_STATUSES)
                ->whereDate('return_date', '>=', now()->toDateString())
                ->exists();

            return [
                'id' => $car->id,
                'brand' => $car->brand,
                'model' => $car->model,
                'year' => $car->year,
                'daily_price' => $car->daily_price,
                'fuel_type' => $car->fuel_type,
                'transmission' => $car->transmission,
                'category' => $car->category,
                'color' => $car->color,
                'average_rating' => round($car->reviews()->avg('rating') ?? 0, 1),
                'review_count' => $car->reviews()->count(),
                'is_currently_booked' => $hasActiveBooking,
                'images' => $car->images->map(fn ($image) => [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'is_primary' => $image->is_primary,
                ]),
            ];
        });

    return Inertia::render('Welcome', ['cars' => $cars]);
})->name('home');

// =========================================================
// Browse Cars - Public Access
// =========================================================

Route::get('/browse-cars', [BrowseCarController::class, 'index'])
    ->name('cars.index');

Route::get('/cars/{car}', [BrowseCarController::class, 'show'])
    ->name('cars.show');

Route::middleware(['auth'])->group(function () {

    // =========================================================
    // Dashboard
    // =========================================================

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // =========================================================
    // Bookings
    // =========================================================

    Route::get('/bookings', [BookingController::class, 'index'])
        ->name('bookings.index');

    Route::get('/bookings/{booking}', [BookingController::class, 'show'])
        ->name('bookings.show');

    Route::post('/bookings/{booking}/approve', [BookingController::class, 'approve'])
        ->name('bookings.approve')
        ->middleware('staff_permission');

    Route::post('/bookings/{booking}/reject', [BookingController::class, 'reject'])
        ->name('bookings.reject')
        ->middleware('staff_permission');

    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])
        ->name('bookings.cancel');

    Route::post('/bookings/{booking}/assign-driver', [BookingController::class, 'assignDriver'])
        ->name('bookings.assign-driver');

    Route::post('/bookings/{booking}/owner-no-show', [BookingDisputeController::class, 'store'])
        ->name('bookings.owner-no-show');

    Route::post('/bookings/{booking}/reviews', [ReviewController::class, 'store'])
        ->name('bookings.reviews.store');

    Route::put('/bookings/{booking}/reviews/{review}', [ReviewController::class, 'update'])
        ->name('bookings.reviews.update');

    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])
        ->name('reviews.destroy');

    Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete'])
        ->name('bookings.complete')
        ->middleware('staff_permission');

    // =========================================================
    // Payments
    // =========================================================

    Route::get('/payments', [PaymentController::class, 'index'])
        ->name('payments.index');

    Route::get('/bookings/{booking}/payment', [PaymentController::class, 'create'])
        ->name('payments.create');

    Route::post('/bookings/{booking}/payment', [PaymentController::class, 'store'])
        ->name('payments.store');

    Route::get('/bookings/{booking}/payment/pickup', [PaymentController::class, 'createPickup'])
        ->name('payments.pickup-create');

    Route::post('/bookings/{booking}/payment/pickup', [PaymentController::class, 'storePickup'])
        ->name('payments.pickup-store');

    Route::get('/bookings/{booking}/payment/extra-charge', [PaymentController::class, 'createExtraCharge'])
        ->name('payments.extra-charge-create');

    Route::post('/bookings/{booking}/payment/extra-charge', [PaymentController::class, 'storeExtraCharge'])
        ->name('payments.extra-charge-store');

    Route::get('/payments/{payment}/receipt', [PaymentController::class, 'receipt'])
        ->name('payments.receipt');

    Route::post('/payments/{payment}/confirm', [PaymentController::class, 'confirm'])
        ->name('payments.confirm')
        ->middleware(['role:admin', 'staff_permission']);

    // =========================================================
    // Notifications
    // =========================================================

    Route::get('/notifications', [NotificationController::class, 'index'])
        ->name('notifications.index');

    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])
        ->name('notifications.read-all');

    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])
        ->name('notifications.read');

    // =========================================================
    // Vehicles - Owner Management
    // =========================================================

    Route::get('/vehicles', [VehicleController::class, 'index'])
        ->name('vehicles.index');

    Route::get('/vehicles/create', [VehicleController::class, 'create'])
        ->name('vehicles.create');

    Route::post('/vehicles', [VehicleController::class, 'store'])
        ->name('vehicles.store');

    Route::get('/vehicles/{car}/edit', [VehicleController::class, 'edit'])
        ->name('vehicles.edit');

    Route::put('/vehicles/{car}', [VehicleController::class, 'update'])
        ->name('vehicles.update');

    Route::put('/vehicles/{car}/images/{image}/primary', [VehicleController::class, 'setPrimaryImage'])
        ->name('vehicles.images.primary');

    Route::delete('/vehicles/{car}', [VehicleController::class, 'destroy'])
        ->name('vehicles.destroy');

    Route::delete('/vehicles/{car}/images/{image}', [VehicleController::class, 'deleteImage'])
        ->name('vehicles.images.delete');

    Route::delete('/vehicles/{car}/documents/{document}', [VehicleController::class, 'destroyDocument'])
        ->name('vehicles.documents.destroy');

    Route::post('/vehicles/{car}/toggle-availability', [VehicleController::class, 'toggleAvailability'])
        ->name('vehicles.toggle-availability');

    Route::post('/vehicles/{car}/available-periods', [VehicleController::class, 'storeAvailablePeriod'])
        ->name('vehicles.available-periods.store');

    Route::delete('/vehicles/{car}/available-periods/{availablePeriod}', [VehicleController::class, 'destroyAvailablePeriod'])
        ->name('vehicles.available-periods.destroy');

    // =========================================================
    // Car Type Requests (owners request unregistered configs)
    // =========================================================

    Route::post('/car-type-requests', [CarTypeRequestController::class, 'store'])
        ->name('car-type-requests.store');

    Route::get('/car-type-requests/{carTypeRequest}', [CarTypeRequestController::class, 'show'])
        ->name('car-type-requests.show');

    // =========================================================
    // Car Booking - Requires Authentication
    // =========================================================

    Route::post('/cars/{car}/book', [BrowseCarController::class, 'book'])
        ->name('cars.book');

    // =========================================================
    // Driver Routes
    // =========================================================

    Route::middleware('staff_permission')->group(function () {

        // Driver assignments
        // =========================================================
        // Driver Routes
        // =========================================================

        Route::middleware(['role:driver'])->group(function () {

            // Driver profile must always be accessible.
            // Incomplete drivers are redirected here by
            // EnsureDriverProfileComplete.
            Route::get('/driver/profile', [DriverProfileController::class, 'show'])
                ->name('driver.profile');

            Route::post('/driver/profile', [DriverProfileController::class, 'update'])
                ->name('driver.profile.update');

            // Driver dashboard / working features
            Route::middleware('driver.profile.complete')->group(function () {

                Route::get('/driver/assignments', [DriverBookingController::class, 'index'])
                    ->name('driver.assignments.index');

                Route::post('/driver/assignments/{assignment}/accept', [DriverBookingController::class, 'accept'])
                    ->name('driver.assignments.accept');

                Route::post('/driver/assignments/{assignment}/reject', [DriverBookingController::class, 'reject'])
                    ->name('driver.assignments.reject');

                Route::get('/driver/trip-history', [DriverBookingController::class, 'history'])
                    ->name('driver.trip-history');

                Route::get('/driver/payments', [DriverBookingController::class, 'payments'])
                    ->name('driver.payments');
            });
        });

        // =========================================================
        // Inspection Staff Routes
        // =========================================================

        Route::middleware(['role:admin', 'staff_permission'])->group(function () {

            Route::get('/inspections', [InspectionController::class, 'index'])
                ->name('inspections.index');

            Route::post('/inspections/{booking}/delivery', [InspectionController::class, 'confirmDelivery'])
                ->name('inspections.delivery');

            Route::post('/inspections/{booking}/conduct', [InspectionController::class, 'conduct'])
                ->name('inspections.conduct');

            Route::post('/inspections/{booking}/handover', [InspectionController::class, 'handover'])
                ->name('inspections.handover');

            Route::post('/inspections/{booking}/returned', [InspectionController::class, 'markReturned'])
                ->name('inspections.returned');

            Route::post('/inspections/{booking}/return-arrival', [InspectionController::class, 'confirmReturnArrival'])
                ->name('inspections.return-arrival');

            Route::post('/inspections/{booking}/return-not-arrived', [InspectionController::class, 'markReturnNotArrived'])
                ->name('inspections.return-not-arrived');

            Route::post('/inspections/{booking}/complete', [InspectionController::class, 'complete'])
                ->name('inspections.complete');
        });

        // =========================================================
        // Booking Disputes - Admin
        // =========================================================

        Route::middleware(['role:admin', 'staff_permission'])->group(function () {

            Route::get('/disputes', [BookingDisputeController::class, 'index'])
                ->name('disputes.index');

            Route::post('/disputes/{dispute}/approve', [BookingDisputeController::class, 'approve'])
                ->name('disputes.approve');

            Route::post('/disputes/{dispute}/reject', [BookingDisputeController::class, 'reject'])
                ->name('disputes.reject');
        });

        // =========================================================
        // Admin Routes
        // =========================================================

        Route::middleware(['role:admin', 'staff_permission'])
            ->prefix('admin')
            ->name('admin.')
            ->group(function () {

                // -------------------------------------------------
                // Users
                // -------------------------------------------------

                Route::get('/users', [UserController::class, 'index'])
                    ->name('users.index');

                Route::get('/users/create', [UserController::class, 'create'])
                    ->name('users.create');

                Route::post('/users', [UserController::class, 'store'])
                    ->name('users.store');

                Route::get('/users/trashed', [UserController::class, 'trashed'])
                    ->name('users.trashed');

                Route::get('/users/{user}', [UserController::class, 'show'])
                    ->name('users.show');

                Route::get('/users/{user}/edit', [UserController::class, 'edit'])
                    ->name('users.edit');

                Route::put('/users/{user}', [UserController::class, 'update'])
                    ->name('users.update');

                Route::delete('/users/{user}', [UserController::class, 'destroy'])
                    ->name('users.destroy');

                Route::post('/users/{id}/restore', [UserController::class, 'restore'])
                    ->name('users.restore');

                Route::post('/users/{user}/suspend', [UserController::class, 'suspend'])
                    ->name('users.suspend');

                Route::post('/users/{user}/activate', [UserController::class, 'activate'])
                    ->name('users.activate');

                Route::post('/users/{user}/verify-owner', [UserController::class, 'verifyOwner'])
                    ->name('users.verify-owner');

                Route::post('/users/{user}/reject-owner', [UserController::class, 'rejectOwner'])
                    ->name('users.reject-owner');

                Route::post('/users/{user}/verify-driver', [UserController::class, 'verifyDriver'])
                    ->name('users.verify-driver');

                Route::post('/users/{user}/reject-driver', [UserController::class, 'rejectDriver'])
                    ->name('users.reject-driver');

                Route::post('/users/{user}/verify-customer-identity', [UserController::class, 'verifyCustomerIdentity'])
                    ->name('users.verify-customer-identity');

                Route::post('/users/{user}/reject-customer-identity', [UserController::class, 'rejectCustomerIdentity'])
                    ->name('users.reject-customer-identity');

                Route::post('/users/{user}/verify-customer', [UserController::class, 'verifyCustomer'])
                    ->name('users.verify-customer');

                Route::post('/users/{user}/reject-customer', [UserController::class, 'rejectCustomer'])
                    ->name('users.reject-customer');

                // -------------------------------------------------
                // Vehicles
                // -------------------------------------------------

                Route::get('/vehicles', [AdminVehicleController::class, 'index'])
                    ->name('vehicles');

                Route::get('/vehicles/create', [AdminVehicleController::class, 'create'])
                    ->name('vehicles.create');

                Route::post('/vehicles', [AdminVehicleController::class, 'store'])
                    ->name('vehicles.store');

                Route::get('/vehicles/{car}', [AdminVehicleController::class, 'show'])
                    ->name('vehicles.show');

                Route::post('/vehicles/{car}/approve', [AdminVehicleController::class, 'approve'])
                    ->name('vehicles.approve');

                Route::post('/vehicles/{car}/reject', [AdminVehicleController::class, 'reject'])
                    ->name('vehicles.reject');

                Route::post('/vehicles/{car}/toggle-status', [AdminVehicleController::class, 'toggleStatus'])
                    ->name('vehicles.toggle-status');

                Route::post('/vehicles/{car}/documents/approve', [AdminVehicleController::class, 'approveDocument'])
                    ->name('vehicles.documents.approve');

                Route::post('/vehicles/{car}/documents/reject', [AdminVehicleController::class, 'rejectDocument'])
                    ->name('vehicles.documents.reject');

                Route::delete('/vehicles/{car}', [AdminVehicleController::class, 'destroy'])
                    ->name('vehicles.destroy');

                Route::get('/vehicle-images', [CarImageController::class, 'index'])
                    ->name('vehicle-images');

                Route::get('/vehicle-documents', [VehicleDocumentController::class, 'index'])
                    ->name('vehicle-documents');

                Route::post('/vehicle-documents', [VehicleDocumentController::class, 'store'])
                    ->name('vehicle-documents.store');

                // -------------------------------------------------
                // Drivers
                // -------------------------------------------------

                Route::get('/drivers', [DriverController::class, 'index'])
                    ->name('drivers.index');

                Route::post('/drivers/{driver}/suspend', [DriverController::class, 'suspend'])
                    ->name('drivers.suspend');

                Route::post('/drivers/{driver}/activate', [DriverController::class, 'activate'])
                    ->name('drivers.activate');

                // -------------------------------------------------
                // Driver Assignments - Admin
                // -------------------------------------------------

                Route::get('/driver/assignments', [DriverBookingController::class, 'adminIndex'])
                    ->name('driver.assignments.index');

                // -------------------------------------------------
                // Transactions
                // -------------------------------------------------

                Route::get('/transactions', [TransactionController::class, 'index'])
                    ->name('transactions.index');

                Route::post('/transactions/refunds/{refund}/process', [TransactionController::class, 'processRefund'])
                    ->name('transactions.refunds.process');

                Route::post('/transactions/owner-payouts/{payout}/mark-paid', [TransactionController::class, 'markOwnerPaid'])
                    ->name('transactions.owner-payouts.mark-paid');

                Route::post('/transactions/driver-payouts/{assignment}/mark-paid', [TransactionController::class, 'markDriverPaid'])
                    ->name('transactions.driver-payouts.mark-paid');

                Route::post('/transactions/payments/{payment}/mark-cash-paid', [TransactionController::class, 'markCashPaid'])
                    ->name('transactions.payments.mark-cash-paid');

                // -------------------------------------------------
                // Reports
                // -------------------------------------------------

                Route::get('/reports', [ReportController::class, 'index'])
                    ->name('reports.index');
                Route::get('/reports/pdf', [ReportController::class, 'exportPdf'])
                     ->name('admin.reports.pdf');
                Route::get('/reports/csv', [ReportController::class, 'exportCsv'])
                    ->name('admin.reports.csv');
                // -------------------------------------------------
                // Staff
                // -------------------------------------------------

                Route::get('/staff', [StaffController::class, 'index'])
                    ->name('staff.index');

                Route::get('/staff/create', [StaffController::class, 'create'])
                    ->name('staff.create');

                Route::post('/staff', [StaffController::class, 'store'])
                    ->name('staff.store');

                Route::get('/staff/{staff}', [StaffController::class, 'show'])
                    ->name('staff.show');

                Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])
                    ->name('staff.destroy');

                Route::post('/staff/{staff}/suspend', [StaffController::class, 'suspend'])
                    ->name('staff.suspend');

                Route::post('/staff/{staff}/activate', [StaffController::class, 'activate'])
                    ->name('staff.activate');

                // -------------------------------------------------
                // Roles
                // -------------------------------------------------

                Route::get('/roles', [RoleController::class, 'index'])
                    ->name('roles.index');

                Route::get('/roles/create', [RoleController::class, 'create'])
                    ->name('roles.create');

                Route::post('/roles', [RoleController::class, 'store'])
                    ->name('roles.store');

                Route::get('/roles/{role}', [RoleController::class, 'show'])
                    ->name('roles.show');

                Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])
                    ->name('roles.edit');

                Route::put('/roles/{role}', [RoleController::class, 'update'])
                    ->name('roles.update');

                Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
                    ->name('roles.destroy');

                // -------------------------------------------------
                // Car Types
                // -------------------------------------------------

                Route::get('/car-types/configurations', [CarTypeController::class, 'index'])
                    ->name('car-types.configurations');

                Route::post('/car-types/configurations', [CarTypeController::class, 'store'])
                    ->name('car-types.configurations.store');

                Route::put('/car-types/configurations/{carType}', [CarTypeController::class, 'update'])
                    ->name('car-types.configurations.update');

                Route::delete('/car-types/configurations/{carType}', [CarTypeController::class, 'destroy'])
                    ->name('car-types.configurations.destroy');

                Route::patch('/car-types/configurations/{carType}/toggle', [CarTypeController::class, 'toggleActive'])
                    ->name('car-types.configurations.toggle');

                Route::post('/car-types/configurations/requests/{carTypeRequest}/approve', [CarTypeController::class, 'approveRequest'])
                    ->name('car-types.configurations.requests.approve');

                Route::post('/car-types/configurations/requests/{carTypeRequest}/reject', [CarTypeController::class, 'rejectRequest'])
                    ->name('car-types.configurations.requests.reject');

                // -------------------------------------------------
                // Locations
                // -------------------------------------------------

                Route::resource('locations', LocationController::class)
                    ->except(['show']);

                // -------------------------------------------------
                // Reviews
                // -------------------------------------------------

                Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])
                    ->name('reviews.destroy');
            });
    });

    require __DIR__.'/settings.php';
});
