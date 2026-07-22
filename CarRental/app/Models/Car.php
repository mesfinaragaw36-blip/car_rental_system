<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Car extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'owner_id',
        'brand',
        'model',
        'year',
        'plate_number',
        'category',
        'color',
        'fuel_type',
        'transmission',
        'engine_size',
        'mileage',
        'seats',
        'daily_price',
        'description',
        'approval_status',
        'availability_status',
    ];

    // The owner (user with role=owner) who listed this car
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // All images uploaded for this car
    public function images(): HasMany
    {
        return $this->hasMany(CarImage::class);
    }

    // All verification documents attached to this car
    public function documents(): HasMany
    {
        return $this->hasMany(VehicleDocument::class);
    }

    // All bookings made for this car
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
