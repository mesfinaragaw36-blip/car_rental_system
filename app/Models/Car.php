<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Car extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'brand',
        'model',
        'year',
        'plate_number',
        'category',
        'car_type_name_id',
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
        'location_id',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'mileage' => 'integer',
            'seats' => 'integer',
            'daily_price' => 'decimal:2',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function carTypeName(): BelongsTo
    {
        return $this->belongsTo(CarTypeName::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(CarImage::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
    public function location()
{
    return $this->belongsTo(Location::class);
}
}
