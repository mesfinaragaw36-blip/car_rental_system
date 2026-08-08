<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('booking_drivers', function (Blueprint $table) {
            $table->decimal('earnings', 10, 2)->nullable()->after('status');
            $table->string('payout_status')->default('pending')->after('earnings');
            $table->timestamp('paid_at')->nullable()->after('payout_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_drivers', function (Blueprint $table) {
            $table->dropColumn([
                'earnings',
                'payout_status',
                'paid_at',
            ]);
        });
    }
};
