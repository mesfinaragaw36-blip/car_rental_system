<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CarTypeController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\BranchController;

Route::inertia('/', 'Welcome')->name('home');

Route::get('/cartype', [CarTypeController::class, 'index'])
    ->name('cartype.index');

Route::inertia('/cars', 'Cars')->name('cars');
Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::inertia('/dashboard', 'Dashboard')->name('dashboard');

    Route::post('/cartype', [CarTypeController::class, 'store'])
    ->name('cartype.store');

    Route::post('/brands', [BrandController::class, 'store'])
    ->name('brands.store');

    Route::get('/customers', [CustomerController::class, 'index'])
    ->name('customers.index');

    Route::post('/customers', [CustomerController::class, 'store'])
    ->name('customers.store');

    Route::delete('/cartype/{carType}', [CarTypeController::class, 'destroy'])
    ->name('cartype.destroy');

    Route::put('/cartype/{carType}', [CarTypeController::class, 'update'])
    ->name('cartype.update');

    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])
    ->name('customers.destroy');

    Route::get('/branches', [BranchController::class, 'index'])
    ->name('branches.index');

Route::post('/branches', [BranchController::class, 'store'])
    ->name('branches.store');

Route::put('/branches/{branch}', [BranchController::class, 'update'])
    ->name('branches.update');

Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])
    ->name('branches.destroy');
});

require __DIR__.'/settings.php';