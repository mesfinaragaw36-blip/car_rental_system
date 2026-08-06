<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['booking_id']);
            $table->dropUnique(['booking_id']);
            $table->index('booking_id');
            $table->foreign('booking_id')
                ->references('id')
                ->on('bookings')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['booking_id']);
            $table->dropIndex(['booking_id']);
            $table->unique('booking_id');
            $table->foreign('booking_id')
                ->references('id')
                ->on('bookings')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }
};
