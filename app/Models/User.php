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

    public function staffRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'staff_role_id');
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

    // NEW: Inspections performed by this inspector
    public function inspections(): HasMany
    {
        return $this->hasMany(BookingInspection::class, 'inspector_id');
    }

    public function reviews(): MorphMany
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function reviewsWritten(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewer_id');
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