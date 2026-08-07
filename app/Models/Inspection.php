<?php

namespace App\Models;

use Database\Factories\InspectionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inspection extends Model
{
    /** @use HasFactory<InspectionFactory> */
    use HasFactory;

    public const TYPE_PICKUP = 'pickup';

    public const TYPE_RETURN = 'return';

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_ISSUES_FOUND = 'issues_found';

    protected $fillable = [
        'booking_id',
        'type',
        'status',
        'conducted_by',
        'conducted_at',
        'mileage_reading',
        'fuel_level',
        'damages',
        'notes',
        'photos',
    ];

    protected function casts(): array
    {
        return [
            'conducted_at' => 'datetime',
            'fuel_level' => 'integer',
            'damages' => 'array',
            'photos' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function conductedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'conducted_by');
    }
}
