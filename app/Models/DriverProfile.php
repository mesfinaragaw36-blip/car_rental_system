<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverProfile extends Model
{
    protected $fillable = [
        'user_id',
        'gender',
        'license_number',
        'license_type',
        'experience_years',
        'daily_rate',
        'location',
        'proficient_language',
        'telebirr_phone',
        'cbe_account',
        'availability',
        'verification_status',
        'license_file_path',
        'national_id_file_path',
    ];

    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'daily_rate' => 'decimal:2',
            'proficient_language' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
