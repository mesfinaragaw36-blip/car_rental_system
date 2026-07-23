<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverProfile extends Model
{
    protected $fillable = [
        'user_id',
        'license_number',
        'experience_years',
        'availability',
        'verification_status',
    ];

    // The user who owns this driver profile
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
