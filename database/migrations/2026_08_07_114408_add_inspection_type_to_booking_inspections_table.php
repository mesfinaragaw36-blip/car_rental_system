<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_inspections', function (Blueprint $table) {
            $table->enum('inspection_type', [
                'pre_pickup',
                'return',
            ])->default('pre_pickup')->after('booking_id');
        });
    }

    public function down(): void
    {
        Schema::table('booking_inspections', function (Blueprint $table) {
            $table->dropColumn('inspection_type');
        });
    }
};
