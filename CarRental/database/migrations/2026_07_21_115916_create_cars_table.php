<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('brand');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->string('plate_number')->unique();
            $table->string('category');
            $table->string('color');
            $table->string('fuel_type');
            $table->string('transmission');
            $table->string('engine_size');
            $table->unsignedInteger('mileage')->default(0);
            $table->unsignedTinyInteger('seats');
            $table->decimal('daily_price', 10, 2);
            $table->text('description')->nullable();
            $table->string('approval_status')->default('pending');
            $table->string('availability_status')->default('available');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
