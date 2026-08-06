<?php

namespace App\Models;

use Database\Factories\CarAvailablePeriodFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarAvailablePeriod extends Model
{
    /** @use HasFactory<CarAvailablePeriodFactory> */
    use HasFactory;

    protected $fillable = [
        'car_id',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
