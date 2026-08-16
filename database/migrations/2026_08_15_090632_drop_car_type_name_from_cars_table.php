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
        if (Schema::hasColumn('cars', 'car_type_name_id')) {
            Schema::table('cars', function (Blueprint $table) {
                $table->dropForeign(['car_type_name_id']);
                $table->dropColumn('car_type_name_id');
            });
        }

        Schema::dropIfExists('car_type_names');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->foreignId('car_type_name_id')->nullable()->after('plate_number')->constrained('car_type_names')->nullOnDelete();
        });
    }
};
