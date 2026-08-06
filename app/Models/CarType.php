<?php

namespace App\Models;

use Database\Factories\CarTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarType extends Model
{
    /** @use HasFactory<CarTypeFactory> */
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'car_type_name_id',
        'fuel_type',
        'transmission',
        'engine_size',
        'seats',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'seats' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function carTypeName(): BelongsTo
    {
        return $this->belongsTo(CarTypeName::class);
    }
}
