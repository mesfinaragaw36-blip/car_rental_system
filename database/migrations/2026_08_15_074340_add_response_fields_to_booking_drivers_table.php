<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_drivers', function (Blueprint $table) {
            $table->timestamp('response_deadline')
                ->nullable()
                ->after('assigned_at');

            $table->timestamp('responded_at')
                ->nullable()
                ->after('response_deadline');

            $table->text('rejection_reason')
                ->nullable()
                ->after('responded_at');
        });
    }

    public function down(): void
    {
        Schema::table('booking_drivers', function (Blueprint $table) {
            $table->dropColumn([
                'response_deadline',
                'responded_at',
                'rejection_reason',
            ]);
        });
    }
};
