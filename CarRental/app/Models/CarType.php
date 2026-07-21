<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarType extends Model
{
    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    public function models(): HasMany
    {
        return $this->hasMany(CarModel::class);
    }
}