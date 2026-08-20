<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE owner_profiles MODIFY COLUMN verification_status ENUM('incomplete','pending','approved','rejected') NOT NULL DEFAULT 'incomplete'");

        // Move existing pending profiles that were never submitted to 'incomplete'
        DB::table('owner_profiles')
            ->where('verification_status', 'pending')
            ->where('profile_completed', false)
            ->update(['verification_status' => 'incomplete']);
    }

    public function down(): void
    {
        DB::table('owner_profiles')
            ->where('verification_status', 'incomplete')
            ->update(['verification_status' => 'pending']);

        DB::statement("ALTER TABLE owner_profiles MODIFY COLUMN verification_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
    }
};
