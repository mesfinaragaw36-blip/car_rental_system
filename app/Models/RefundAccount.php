<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefundAccount extends Model
{
        protected $fillable = [
        'user_id',
        'refund_method',
        'cbe_account_number',
        'cbe_account_holder_name',
        'telebirr_number',
        'telebirr_account_holder_name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}