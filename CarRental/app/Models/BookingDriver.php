<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingDriver extends Model
{
    protected $fillable = [
        'booking_id',
        'driver_id',
        'assigned_by',
        'assigned_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
        ];
    }

    // The booking this driver assignment belongs to
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    // The driver (user with role=driver) assigned to this booking
    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    // The user (admin or owner) who made this assignment
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
