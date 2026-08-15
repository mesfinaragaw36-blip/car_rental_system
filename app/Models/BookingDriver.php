<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingDriver extends Model
{
    protected $fillable = [
        'booking_id',
        'driver_id',
        'assigned_by',
        'assigned_at',
        'response_deadline',
        'responded_at',
        'rejection_reason',
        'status',
        'earnings',
        'payout_status',
        'paid_at',
    ];

    public const STATUS_PENDING = 'pending';

    public const STATUS_ASSIGNED = 'assigned';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_PAID = 'paid';

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'response_deadline' => 'datetime',
            'responded_at' => 'datetime',
            'earnings' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function hasEarnings(): bool
    {
        return (float) $this->earnings > 0;
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}