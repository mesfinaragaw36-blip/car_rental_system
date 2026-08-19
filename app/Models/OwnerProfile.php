<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OwnerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'owner_type',
        'business_name',
        'organization_type',
        'organization_type_other',
        'tin_number',
        'address',
        'national_id',
        'national_id_front_file_path',
        'national_id_back_file_path',
        'trade_license_number',
        'business_license_file_path',
        'vehicle_ownership_certificate_file_path',
        'verification_status',
        'verified_at',
        'profile_completed',
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
