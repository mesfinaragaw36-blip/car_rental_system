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
        Schema::table('car_types', function (Blueprint $table) {
            $table->json('year_range')->nullable()->after('model');
            $table->dropForeign(['car_type_name_id']);
            $table->dropColumn('car_type_name_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_types', function (Blueprint $table) {
            $table->dropColumn('year_range');
            $table->foreignId('car_type_name_id')
                ->nullable()
                ->after('model')
                ->constrained()
                ->nullOnDelete();
        });
    }
};
