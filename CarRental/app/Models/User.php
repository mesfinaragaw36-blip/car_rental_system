<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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

    // The owner's extended business/verification profile
    public function ownerProfile(): HasOne
    {
        return $this->hasOne(OwnerProfile::class);
    }

    // The driver's license and availability profile
    public function driverProfile(): HasOne
    {
        return $this->hasOne(DriverProfile::class);
    }

    // Cars listed by this user as an owner
    public function cars(): HasMany
    {
        return $this->hasMany(Car::class, 'owner_id');
    }

    // Bookings made by this user as a customer
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    // Bookings received by this user as an owner
    public function ownerBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'owner_id');
    }

    // Bookings where this user is assigned as a driver
    public function driverAssignments(): HasMany
    {
        return $this->hasMany(BookingDriver::class, 'driver_id');
    }
}
