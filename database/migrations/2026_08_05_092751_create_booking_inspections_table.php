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
        Schema::create('booking_inspections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('inspector_id')
                ->constrained('users');

            $table->boolean('outside_ok')->default(false);
            $table->boolean('inside_ok')->default(false);
            $table->boolean('mileage_ok')->default(false);
            $table->boolean('fuel_ok')->default(false);

            $table->text('comments')->nullable();

            $table->enum('status', [
                'pending',
                'approved',
                'failed',
            ])->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_inspections');
    }
};