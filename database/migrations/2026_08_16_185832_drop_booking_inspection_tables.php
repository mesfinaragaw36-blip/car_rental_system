<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The legacy booking_inspections system was abandoned in favour
     * of the inspections table. These tables were never used by any
     * controller or frontend flow, so they are removed.
     */
    public function up(): void
    {
        Schema::dropIfExists('booking_inspection_photos');
        Schema::dropIfExists('booking_inspections');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('booking_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->enum('inspection_type', ['pre_pickup', 'return'])->default('pre_pickup');
            $table->foreignId('inspector_id')->constrained('users');
            $table->boolean('outside_ok')->default(false);
            $table->boolean('inside_ok')->default(false);
            $table->boolean('mileage_ok')->default(false);
            $table->boolean('fuel_ok')->default(false);
            $table->text('comments')->nullable();
            $table->enum('status', ['pending', 'approved', 'failed'])->default('pending');
            $table->timestamps();
        });

        Schema::create('booking_inspection_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_inspection_id')->constrained()->cascadeOnDelete();
            $table->string('checklist_item');
            $table->string('photo_path');
            $table->timestamps();
        });
    }
};
