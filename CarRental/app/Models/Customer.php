<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'full_name',
        'phone',
        'email',
        'license_number',
        'license_expiry',
        'address',
        'status',
    ];
}