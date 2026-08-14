<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerIdentity extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id',
        'national_id_number',
        'verification_status',
        'verified_by',
        'national_id_front_path',
        'national_id_back_path',
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

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isApproved(): bool
    {
        return $this->verification_status === self::STATUS_APPROVED;
    }

    public function isPending(): bool
    {
        return $this->verification_status === self::STATUS_PENDING;
    }

    public function isRejected(): bool
    {
        return $this->verification_status === self::STATUS_REJECTED;
    }
}
