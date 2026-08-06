<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['pickup', 'return']);
            $table->enum('status', ['pending', 'approved', 'issues_found'])->default('pending');
            $table->foreignId('conducted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('conducted_at')->nullable();
            $table->integer('mileage_reading')->nullable();
            $table->unsignedTinyInteger('fuel_level')->nullable();
            $table->json('damages')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['booking_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspections');
    }
};
