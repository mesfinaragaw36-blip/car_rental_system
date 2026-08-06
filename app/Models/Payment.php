<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const TYPE_DEPOSIT = 'booking_deposit';

    public const TYPE_BALANCE = 'balance';

    public const TYPE_SECURITY_DEPOSIT = 'security_deposit';

    protected $fillable = [
        'booking_id',
        'type',
        'amount',
        'payment_method',
        'transaction_reference',
        'payment_status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
