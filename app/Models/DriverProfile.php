<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverProfile extends Model
{
    protected $fillable = [
        'user_id',
        'license_number',
        'license_type',
        'experience_years',
        'daily_rate',
        'location',
        'availability',
        'verification_status',
    ];

    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'daily_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
