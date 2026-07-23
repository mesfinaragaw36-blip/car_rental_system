<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->foreignId('owner_id')->nullable()->after('id');

            $table->string('brand')->after('owner_id');
            $table->string('model')->after('brand');
            $table->integer('year')->after('model');

            $table->string('category')->nullable();
            $table->string('fuel_type')->nullable();
            $table->string('transmission')->nullable();

            $table->string('engine_size')->nullable();
            $table->integer('mileage')->nullable();
            $table->integer('seats')->nullable();

            $table->decimal('daily_price', 10, 2)->default(0);

            $table->text('description')->nullable();

            $table->string('approval_status')->default('pending');
            $table->string('availability_status')->default('available');
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {

            $columns = [
                'owner_id',
                'brand',
                'model',
                'year',
                'category',
                'fuel_type',
                'transmission',
                'engine_size',
                'mileage',
                'seats',
                'daily_price',
                'description',
                'approval_status',
                'availability_status',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('cars', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};