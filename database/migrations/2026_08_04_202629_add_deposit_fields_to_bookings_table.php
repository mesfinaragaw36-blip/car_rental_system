<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('deposit_amount', 10, 2)->nullable()->after('total_price');
            $table->timestamp('deposit_paid_at')->nullable()->after('deposit_amount');
            $table->timestamp('deposit_hold_until')->nullable()->after('deposit_paid_at');

            $table->enum('status', [
                'pending', 'confirmed', 'approved', 'rejected', 'deposit_paid',
                'paid', 'picked_up', 'returned', 'completed', 'cancelled',
            ])->default('confirmed')->change();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['deposit_amount', 'deposit_paid_at', 'deposit_hold_until']);

            $table->enum('status', [
                'pending', 'approved', 'rejected', 'paid',
                'picked_up', 'returned', 'completed', 'cancelled',
            ])->default('pending')->change();
        });
    }
};
