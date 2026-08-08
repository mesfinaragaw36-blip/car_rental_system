<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('return_arrival_status', ['pending', 'arrived'])->default('pending')->after('status');
            $table->timestamp('return_arrival_confirmed_at')->nullable()->after('return_arrival_status');
            $table->unsignedBigInteger('return_arrival_confirmed_by')->nullable()->after('return_arrival_confirmed_at');

            $table->foreign('return_arrival_confirmed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['return_arrival_confirmed_by']);
            $table->dropColumn(['return_arrival_status', 'return_arrival_confirmed_at', 'return_arrival_confirmed_by']);
        });
    }
};
