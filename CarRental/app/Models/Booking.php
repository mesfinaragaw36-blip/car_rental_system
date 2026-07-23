<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'need_driver',
        'total_price',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'pickup_date' => 'date',
            'return_date' => 'date',
            'need_driver' => 'boolean',
            'total_price' => 'decimal:2',
        ];
    }

    // The customer (user with role=customer) who made this booking
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    // The owner (user with role=owner) who received this booking
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // The car that was booked
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    // The optional driver assignment for this booking
    public function bookingDriver(): HasOne
    {
        return $this->hasOne(BookingDriver::class);
    }

    // The payment record for this booking
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
