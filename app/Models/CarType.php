<?php

namespace App\Models;

use Database\Factories\CarTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarType extends Model
{
    /** @use HasFactory<CarTypeFactory> */
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'year',
        'categories',
        'fuel_types',
        'transmissions',
        'engine_sizes',
        'seats',
        'colors',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'fuel_types' => 'array',
            'transmissions' => 'array',
            'engine_sizes' => 'array',
            'seats' => 'array',
            'colors' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Determine whether the given model year falls within this configuration's
     * year value, which may be a single year ("2022") or a range ("2002-2010").
     */
    public function matchesYear(int|string $year): bool
    {
        $value = trim((string) $this->year);

        if (str_contains($value, '-')) {
            [$start, $end] = array_map('intval', explode('-', $value, 2));

            return (int) $year >= $start && (int) $year <= $end;
        }

        return (int) $value === (int) $year;
    }
}
