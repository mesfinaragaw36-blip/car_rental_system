<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingInspection extends Model
{
    protected $fillable = [
        'booking_id',
        'inspection_type',
        'inspector_id',
        'outside_ok',
        'inside_ok',
        'mileage_ok',
        'fuel_ok',
        'comments',
        'status',
    ];

    protected $casts = [
        'outside_ok' => 'boolean',
        'inside_ok' => 'boolean',
        'mileage_ok' => 'boolean',
        'fuel_ok' => 'boolean',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(BookingInspectionPhoto::class);
    }
}
