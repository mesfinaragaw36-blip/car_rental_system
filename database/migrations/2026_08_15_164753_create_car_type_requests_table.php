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
        Schema::create('car_type_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requested_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->string('year', 50);
            $table->string('category', 100)->nullable();
            $table->string('fuel_type', 50)->nullable();
            $table->string('transmission', 50)->nullable();
            $table->string('engine_size', 50)->nullable();
            $table->integer('seats')->nullable();
            $table->string('note', 1000)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('admin_note', 1000)->nullable();
            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_type_requests');
    }
};
