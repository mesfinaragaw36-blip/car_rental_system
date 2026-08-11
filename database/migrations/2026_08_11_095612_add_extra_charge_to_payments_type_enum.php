<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE payments MODIFY type ENUM('booking_deposit', 'balance', 'security_deposit', 'extra_charge') NOT NULL DEFAULT 'balance'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE payments MODIFY type ENUM('booking_deposit', 'balance', 'security_deposit') NOT NULL DEFAULT 'balance'");
        }
    }
};
