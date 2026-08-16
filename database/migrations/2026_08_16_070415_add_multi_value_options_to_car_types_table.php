<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('car_types', function (Blueprint $table) {
            $table->json('categories')->nullable()->after('year');
            $table->json('fuel_types')->nullable()->after('categories');
            $table->json('transmissions')->nullable()->after('fuel_types');
            $table->json('engine_sizes')->nullable()->after('transmissions');
            $table->json('colors')->nullable()->after('engine_sizes');
            $table->renameColumn('seats', 'legacy_seats');
            $table->json('seats')->nullable()->after('colors');
        });

        foreach (DB::table('car_types')->get() as $row) {
            DB::table('car_types')->where('id', $row->id)->update([
                'categories' => json_encode([$row->category]),
                'fuel_types' => json_encode([$row->fuel_type]),
                'transmissions' => json_encode([$row->transmission]),
                'engine_sizes' => $row->engine_size !== null ? json_encode([$row->engine_size]) : null,
                'seats' => $row->legacy_seats !== null ? json_encode([(int) $row->legacy_seats]) : null,
            ]);
        }

        Schema::table('car_types', function (Blueprint $table) {
            $table->dropColumn(['category', 'fuel_type', 'transmission', 'engine_size', 'legacy_seats']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('car_types', function (Blueprint $table) {
            $table->string('category', 100)->nullable();
            $table->string('fuel_type', 50)->nullable();
            $table->string('transmission', 50)->nullable();
            $table->string('engine_size', 50)->nullable();
            $table->renameColumn('seats', 'seats_json');
            $table->integer('seats')->nullable();
        });

        foreach (DB::table('car_types')->get() as $row) {
            $categories = json_decode($row->categories ?? '[]', true) ?: [];
            $fuelTypes = json_decode($row->fuel_types ?? '[]', true) ?: [];
            $transmissions = json_decode($row->transmissions ?? '[]', true) ?: [];
            $engineSizes = json_decode($row->engine_sizes ?? '[]', true) ?: [];
            $seats = json_decode($row->seats_json ?? '[]', true) ?: [];

            DB::table('car_types')->where('id', $row->id)->update([
                'category' => $categories[0] ?? null,
                'fuel_type' => $fuelTypes[0] ?? null,
                'transmission' => $transmissions[0] ?? null,
                'engine_size' => $engineSizes[0] ?? null,
                'seats' => isset($seats[0]) ? (int) $seats[0] : null,
            ]);
        }

        Schema::table('car_types', function (Blueprint $table) {
            $table->dropColumn(['categories', 'fuel_types', 'transmissions', 'engine_sizes', 'colors', 'seats_json']);
        });
    }
};
