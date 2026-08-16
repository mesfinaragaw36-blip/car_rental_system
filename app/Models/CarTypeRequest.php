<?php

namespace App\Models;

use Database\Factories\CarTypeRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarTypeRequest extends Model
{
    /** @use HasFactory<CarTypeRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'requested_by',
        'brand',
        'model',
        'year',
        'category',
        'color',
        'fuel_type',
        'transmission',
        'engine_size',
        'seats',
        'plate_number',
        'daily_price',
        'mileage',
        'description',
        'availability_status',
        'note',
        'photos',
        'document_path',
        'primary_photo_index',
        'ownership_expiry',
        'available_periods',
        'status',
        'admin_note',
        'reviewed_by',
        'reviewed_at',
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    protected function casts(): array
    {
        return [
            'seats' => 'integer',
            'daily_price' => 'decimal:2',
            'mileage' => 'integer',
            'photos' => 'array',
            'primary_photo_index' => 'integer',
            'ownership_expiry' => 'date',
            'available_periods' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }
}
