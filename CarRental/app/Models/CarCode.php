<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarCode extends Model
{
    protected $fillable = [
        'car_model_id',
        'code',
        'description',
        'status',
    ];

    public function carModel(): BelongsTo
    {
        return $this->belongsTo(CarModel::class);
    }
    public function cars(): HasMany
{
    return $this->hasMany(Car::class);
}
}