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
        Schema::table('car_type_requests', function (Blueprint $table) {
            $table->string('color', 50)->nullable()->after('category');
            $table->string('plate_number', 50)->nullable()->after('transmission');
            $table->decimal('daily_price', 10, 2)->nullable()->after('seats');
            $table->integer('mileage')->nullable()->after('daily_price');
            $table->text('description')->nullable()->after('mileage');
            $table->string('availability_status', 20)->nullable()->default('available')->after('description');
            $table->json('photos')->nullable()->after('note');
            $table->string('document_path')->nullable()->after('photos');
            $table->unsignedInteger('primary_photo_index')->nullable()->default(0)->after('document_path');
            $table->date('ownership_expiry')->nullable()->after('primary_photo_index');
            $table->json('available_periods')->nullable()->after('ownership_expiry');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_type_requests', function (Blueprint $table) {
            $table->dropColumn([
                'color',
                'plate_number',
                'daily_price',
                'mileage',
                'description',
                'availability_status',
                'photos',
                'document_path',
                'primary_photo_index',
                'ownership_expiry',
                'available_periods',
            ]);
        });
    }
};
