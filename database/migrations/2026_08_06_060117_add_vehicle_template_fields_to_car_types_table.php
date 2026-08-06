<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('car_types', function (Blueprint $table) {
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->foreignId('car_type_name_id')
                ->nullable()
                ->after('model')
                ->constrained()
                ->nullOnDelete();
            $table->enum('fuel_type', ['Petrol', 'Diesel', 'Hybrid', 'Electric']);
            $table->enum('transmission', ['Manual', 'Automatic', 'Semi']);
            $table->string('engine_size', 50)->nullable();
            $table->integer('seats')->nullable();
            $table->boolean('is_active')->default(true);

            $table->unique(['brand', 'model']);
        });
    }

    public function down(): void
    {
        Schema::table('car_types', function (Blueprint $table) {
            $table->dropUnique(['brand', 'model']);
            $table->dropForeign(['car_type_name_id']);
            $table->dropColumn([
                'brand',
                'model',
                'car_type_name_id',
                'fuel_type',
                'transmission',
                'engine_size',
                'seats',
                'is_active',
            ]);
        });
    }
};
