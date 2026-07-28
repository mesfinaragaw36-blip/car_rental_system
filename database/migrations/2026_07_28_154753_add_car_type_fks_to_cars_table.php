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
        Schema::table('cars', function (Blueprint $table) {
            $table->foreignId('car_type_name_id')->nullable()->after('plate_number')->constrained()->nullOnDelete();
            $table->foreignId('fuel_type_id')->nullable()->after('fuel_type')->constrained()->nullOnDelete();
            $table->foreignId('transmission_id')->nullable()->after('transmission')->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropForeign(['car_type_name_id']);
            $table->dropColumn('car_type_name_id');
            $table->dropForeign(['fuel_type_id']);
            $table->dropColumn('fuel_type_id');
            $table->dropForeign(['transmission_id']);
            $table->dropColumn('transmission_id');
        });
    }
};
