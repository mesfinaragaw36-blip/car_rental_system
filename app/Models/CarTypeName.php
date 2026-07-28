<?php

namespace App\Models;

use Database\Factories\CarTypeNameFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarTypeName extends Model
{
    /** @use HasFactory<CarTypeNameFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function cars(): HasMany
    {
        return $this->hasMany(Car::class);
    }
}
