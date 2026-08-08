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
        Schema::create('booking_inspection_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_inspection_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('checklist_item');

            $table->string('photo_path');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_inspection_photos');
    }
};
