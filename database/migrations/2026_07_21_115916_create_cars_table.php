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
       Schema::create('cars', function (Blueprint $table) {

    $table->id();

    $table->foreignId('branch_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->foreignId('car_type_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->foreignId('brand_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->foreignId('car_model_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->foreignId('car_code_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->string('plate_number')->unique();

    $table->string('color')->nullable();

    $table->year('manufacture_year')->nullable();

    $table->boolean('status')->default(true);

    $table->timestamps();

});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
