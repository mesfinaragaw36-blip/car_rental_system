<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OwnerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'national_id',
        'national_id_front_file_path',
        'national_id_back_file_path',
        'trade_license_number',
        'verification_status',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
