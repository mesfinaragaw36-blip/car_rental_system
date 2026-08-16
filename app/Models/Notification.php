<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'related_type',
        'related_id',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'related_id' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function related(): MorphTo
    {
        return $this->morphTo();
    }

    public function isRead(): Attribute
    {
        return Attribute::get(fn () => $this->read_at !== null);
    }

    public function url(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->related_type || ! $this->related_id) {
                return null;
            }

            return match ($this->related_type) {
                Booking::class => route('bookings.show', $this->related_id),
                OwnerPayout::class => route('admin.transactions.index'),
                BookingDriver::class => route('assignments.index'),
                CarTypeRequest::class => route('car-type-requests.show', $this->related_id),
                default => null,
            };
        });
    }
}
