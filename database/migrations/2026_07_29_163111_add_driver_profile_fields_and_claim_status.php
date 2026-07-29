<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->string('license_type', 50)->nullable()->after('license_number');
            $table->string('location', 255)->nullable()->after('experience_years');
        });

        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE booking_drivers MODIFY COLUMN status ENUM('claimed','assigned','accepted','rejected','completed') NOT NULL DEFAULT 'assigned'");
        }
    }

    public function down(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->dropColumn(['license_type', 'location']);
        });

        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE booking_drivers MODIFY COLUMN status ENUM('assigned','accepted','rejected','completed') NOT NULL DEFAULT 'assigned'");
        }
    }
};
