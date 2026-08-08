<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingInspectionPhoto extends Model
{
    protected $fillable = [
        'booking_inspection_id',
        'checklist_item',
        'photo_path',
    ];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(BookingInspection::class);
    }
}
