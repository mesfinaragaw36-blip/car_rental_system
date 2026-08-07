<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'customer_id',
        'owner_id',
        'car_id',
        'pickup_date',
        'return_date',
        'pickup_location',
        'return_location',
        'picked_up_at',
        'returned_at',
        'need_driver',
        'total_price',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'pickup_date' => 'datetime',
            'return_date' => 'datetime',
            'picked_up_at' => 'datetime',
            'returned_at' => 'datetime',
            'need_driver' => 'boolean',
            'total_price' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    public function driverAssignment(): HasOne
    {
        return $this->hasOne(BookingDriver::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    // Pre-pickup inspection
    public function inspection(): HasOne
    {
        return $this->hasOne(BookingInspection::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}