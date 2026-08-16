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
            $table->string('fuel_type', 50)->change();
            $table->string('transmission', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->enum('fuel_type', ['Petrol', 'Diesel', 'Hybrid', 'Electric'])->change();
            $table->enum('transmission', ['Manual', 'Automatic', 'Semi'])->change();
        });
    }
};
