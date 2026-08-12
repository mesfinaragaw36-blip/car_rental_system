<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerIdentity extends Model
{
    protected $fillable = [
        'user_id',
        'national_id_number',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}