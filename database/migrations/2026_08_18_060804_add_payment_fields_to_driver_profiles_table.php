<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->string('telebirr_phone', 20)->nullable()->after('location');
            $table->string('cbe_account', 50)->nullable()->after('telebirr_phone');
        });
    }

    public function down(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->dropColumn(['telebirr_phone', 'cbe_account']);
        });
    }
};
