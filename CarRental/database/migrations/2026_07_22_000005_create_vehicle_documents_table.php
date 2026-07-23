<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')
                ->constrained('cars')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('document_type');
            $table->string('document_path');
            $table->date('expiry_date')->nullable();
            $table->string('verification_status')->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_documents');
    }
};
