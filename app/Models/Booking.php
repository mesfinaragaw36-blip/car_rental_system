<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_DEPOSIT_PAID = 'deposit_paid';

    public const STATUS_PAID = 'paid';

    public const STATUS_PICKED_UP = 'picked_up';

    public const STATUS_RETURNED = 'returned';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const CAR_DELIVERY_PENDING = 'pending';

    public const CAR_DELIVERY_ARRIVED = 'arrived';

    public const CAR_DELIVERY_FAILED = 'failed';

    protected $fillable = [
        'customer_id',
        'owner_id',
        'car_id',
        'pickup_date',
        'return_date',
        'pickup_location',
        'return_location',
        'pickup_branch_id',
        'return_branch_id',
        'picked_up_at',
        'returned_at',
        'need_driver',
        'total_price',
        'deposit_amount',
        'deposit_paid_at',
        'deposit_hold_until',
        'security_deposit_amount',
        'balance_paid_at',
        'security_deposit_paid_at',
        'car_delivery_status',
        'car_delivery_confirmed_at',
        'car_delivery_confirmed_by',
        'car_delivery_escalated_at',
        'status',
        'notes',
    ];

    protected $appends = ['payment'];

    protected function casts(): array
    {
        return [
            'pickup_date' => 'datetime',
            'return_date' => 'datetime',
            'picked_up_at' => 'datetime',
            'returned_at' => 'datetime',
            'deposit_paid_at' => 'datetime',
            'deposit_hold_until' => 'datetime',
            'security_deposit_amount' => 'decimal:2',
            'balance_paid_at' => 'datetime',
            'security_deposit_paid_at' => 'datetime',
            'car_delivery_confirmed_at' => 'datetime',
            'car_delivery_confirmed_by' => 'integer',
            'car_delivery_escalated_at' => 'datetime',
            'need_driver' => 'boolean',
            'total_price' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
        ];
    }

    public function depositAmount(): float
    {
        return (float) ($this->deposit_amount ?? max(500.0, round((float) $this->total_price * 0.10, 2)));
    }

    public function securityDepositAmount(): float
    {
        if ($this->security_deposit_amount !== null) {
            return (float) $this->security_deposit_amount;
        }

        $estimatedValue = (float) $this->car?->estimated_value;

        if ($estimatedValue > 0) {
            return max(1000.0, round($estimatedValue * 0.10, 2));
        }

        return max(1000.0, round((float) $this->total_price * 0.20, 2));
    }

    public function balanceAmount(): float
    {
        return max(0.0, round((float) $this->total_price - $this->depositAmount(), 2));
    }

    public function hasPaidBalance(): bool
    {
        return $this->balance_paid_at !== null;
    }

    public function hasPaidSecurityDeposit(): bool
    {
        return $this->security_deposit_paid_at !== null;
    }

    public function isConfirmedAndAwaitingDeposit(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function scheduledInspectionDate(): CarbonInterface
    {
        $leadDays = $this->pickup_date->copy()->startOfDay()->diffInDays(now()->startOfDay());

        if ($leadDays >= 2) {
            return $this->pickup_date->copy()->subDay()->setTime(10, 0);
        }

        return $this->pickup_date->copy()->setTime(8, 0);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    public function pickupBranch(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'pickup_branch_id');
    }

    public function returnBranch(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'return_branch_id');
    }

    public function driverAssignment(): HasOne
    {
        return $this->hasOne(BookingDriver::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function depositPayment(): ?Payment
    {
        return $this->payments->firstWhere('type', Payment::TYPE_DEPOSIT);
    }

    public function hasPaidDeposit(): bool
    {
        return $this->depositPayment() !== null;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function getPaymentAttribute(): ?array
    {
        $deposit = $this->depositPayment();

        return $deposit ? [
            'id' => $deposit->id,
            'payment_method' => $deposit->payment_method,
            'payment_status' => $deposit->payment_status,
            'paid_at' => $deposit->paid_at?->toDateTimeString(),
        ] : null;
    }

    // Pre-pickup inspection
    public function inspection(): HasOne
    {
        return $this->hasOne(BookingInspection::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function ownerPayout(): HasOne
    {
        return $this->hasOne(OwnerPayout::class);
    }

    public function totalPaid(): float
    {
        return $this->depositAmount()
            + ($this->hasPaidBalance() ? $this->balanceAmount() : 0.0)
            + ($this->hasPaidSecurityDeposit() ? $this->securityDepositAmount() : 0.0);
    }

    public function hasInspection(string $type): bool
    {
        return $this->inspections()->where('type', $type)->exists();
    }

    public function hasApprovedInspection(string $type): bool
    {
        return $this->inspections()
            ->where('type', $type)
            ->where('status', Inspection::STATUS_APPROVED)
            ->exists();
    }

    public function carDeliveryDueDate(): CarbonInterface
    {
        return $this->pickup_date->copy()->startOfDay();
    }

    public function hasCarArrived(): bool
    {
        return $this->car_delivery_status === self::CAR_DELIVERY_ARRIVED;
    }

    public function hasCarDeliveryFailed(): bool
    {
        return $this->car_delivery_status === self::CAR_DELIVERY_FAILED;
    }

    public function hasCarDeliveryBeenConfirmed(): bool
    {
        return in_array($this->car_delivery_status, [self::CAR_DELIVERY_ARRIVED, self::CAR_DELIVERY_FAILED], true);
    }
}
