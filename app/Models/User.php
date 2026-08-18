<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'staff_role_id',
        'branch_id',
        'status',
        'address',
        'profile_photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function ownerProfile(): HasOne
    {
        return $this->hasOne(OwnerProfile::class);
    }

    public function driverProfile(): HasOne
    {
        return $this->hasOne(DriverProfile::class);
    }

    /**
     * Scope to fetch users recognized as drivers.
     */
    public function scopeDrivers($query)
    {
        return $query->where('role', 'driver');
    }

    public function staffRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'staff_role_id');
    }

    /**
     * Whether the user holds the given permission.
     *
     * Full admins and non-staff roles are not restricted by permissions.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->role !== 'admin') {
            return true;
        }

        if ($this->staff_role_id === null) {
            return true;
        }

        return in_array($permission, $this->staffRole?->permissions ?? [], true);
    }

    /**
     * Whether the user can act as a driver (real driver role or staff
     * granted the driver access permission).
     */
    public function hasDriverPermission(): bool
    {
        if ($this->role === 'driver') {
            return true;
        }

        if ($this->role !== 'admin') {
            return false;
        }

        return in_array('driver.access', $this->staffRole?->permissions ?? [], true);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'branch_id');
    }

    public function cars(): HasMany
    {
        return $this->hasMany(Car::class, 'owner_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function ownerBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'owner_id');
    }

    public function driverAssignments(): HasMany
    {
        return $this->hasMany(BookingDriver::class, 'driver_id');
    }

    public function customerIdentity(): HasOne
    {
        return $this->hasOne(CustomerIdentity::class);
    }
    public function refundAccount(): HasOne
    {
    return $this->hasOne(RefundAccount::class);
    }
    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function reviewsWritten(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function notifyNow(string $title, string $message, string $type = 'system', ?string $relatedType = null, ?int $relatedId = null): Notification
    {
        return $this->notifications()->create([
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'related_type' => $relatedType,
            'related_id' => $relatedId,
        ]);
    }

    public function averageRating(): Attribute
    {
        return Attribute::get(fn () => round($this->reviews()->avg('rating') ?? 0, 1));
    }

    public function reviewCount(): Attribute
    {
        return Attribute::get(fn () => $this->reviews()->count());
    }
}
