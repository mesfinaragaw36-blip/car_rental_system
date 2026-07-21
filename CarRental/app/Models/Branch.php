<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $fillable = [
        'name',
        'location',
        'phone',
        'email',
        'status',
    ];
    public function cars(): HasMany
{
    return $this->hasMany(Car::class);
}
}

