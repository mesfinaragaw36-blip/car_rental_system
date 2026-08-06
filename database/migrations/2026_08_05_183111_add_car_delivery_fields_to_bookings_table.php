<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('car_delivery_status', ['pending', 'arrived', 'failed'])->default('pending')->after('status');
            $table->timestamp('car_delivery_confirmed_at')->nullable()->after('car_delivery_status');
            $table->unsignedBigInteger('car_delivery_confirmed_by')->nullable()->after('car_delivery_confirmed_at');
            $table->timestamp('car_delivery_escalated_at')->nullable()->after('car_delivery_confirmed_by');

            $table->foreign('car_delivery_confirmed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['car_delivery_confirmed_by']);
            $table->dropColumn(['car_delivery_status', 'car_delivery_confirmed_at', 'car_delivery_confirmed_by', 'car_delivery_escalated_at']);
        });
    }
};
