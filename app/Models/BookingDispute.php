<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingDispute extends Model
{
    protected $fillable = [
    'booking_id',
    'customer_id',
    'owner_id',
    'type',
    'description',
    'status',
];


    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}