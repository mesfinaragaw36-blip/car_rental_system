<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('security_deposit_amount', 10, 2)->nullable()->after('deposit_hold_until');
            $table->timestamp('balance_paid_at')->nullable()->after('security_deposit_amount');
            $table->timestamp('security_deposit_paid_at')->nullable()->after('balance_paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['security_deposit_amount', 'balance_paid_at', 'security_deposit_paid_at']);
        });
    }
};
