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
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->integer('year');
            $table->string('plate_number', 50)->unique();
            $table->string('category', 100);
            $table->string('color', 50);
            $table->enum('fuel_type', ['Petrol', 'Diesel', 'Hybrid', 'Electric']);
            $table->enum('transmission', ['Manual', 'Automatic']);
            $table->string('engine_size', 50);
            $table->integer('mileage');
            $table->integer('seats');
            $table->decimal('daily_price', 10, 2);
            $table->text('description')->nullable();
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->enum('availability_status', ['available', 'booked', 'maintenance', 'inactive'])->default('available');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
