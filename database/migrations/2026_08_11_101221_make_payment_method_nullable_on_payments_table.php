<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payments MODIFY payment_method ENUM('Cash', 'Bank Transfer', 'Telebirr', 'CBE Birr') NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payments MODIFY payment_method ENUM('Cash', 'Bank Transfer', 'Telebirr', 'CBE Birr') NOT NULL");
    }
};