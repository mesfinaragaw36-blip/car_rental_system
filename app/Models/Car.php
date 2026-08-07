<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Car extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'brand',
        'model',
        'year',
        'plate_number',
        'category',
        'car_type_name_id',
        'color',
        'fuel_type',
        'transmission',
        'engine_size',
        'mileage',
        'seats',
        'daily_price',
        'estimated_value',
        'description',
        'approval_status',
        'availability_status',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'mileage' => 'integer',
            'seats' => 'integer',
            'daily_price' => 'decimal:2',
            'estimated_value' => 'decimal:2',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function carTypeName(): BelongsTo
    {
        return $this->belongsTo(CarTypeName::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(CarImage::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function averageRating(): Attribute
    {
        return Attribute::get(fn () => round($this->reviews()->avg('rating') ?? 0, 1));
    }

    public function reviewCount(): Attribute
    {
        return Attribute::get(fn () => $this->reviews()->count());
    }

    public function availablePeriods(): HasMany
    {
        return $this->hasMany(CarAvailablePeriod::class);
    }

    public function isAvailableFor(CarbonInterface $start, CarbonInterface $end): bool
    {
        return $this->availablePeriods()
            ->whereDate('start_date', '<=', $start)
            ->whereDate('end_date', '>=', $end)
            ->exists();
    }

    public function upcomingAvailablePeriods(): HasMany
    {
        return $this->availablePeriods()->whereDate('end_date', '>=', now()->toDateString())->orderBy('start_date');
    }
}
