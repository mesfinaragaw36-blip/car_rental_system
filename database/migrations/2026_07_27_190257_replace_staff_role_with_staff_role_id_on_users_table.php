<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('staff_role');
            $table->foreignId('staff_role_id')->nullable()->after('role')->constrained('roles');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['staff_role_id']);
            $table->dropColumn('staff_role_id');
            $table->enum('staff_role', ['car_verifier', 'owner_verifier', 'driver_verifier', 'support'])->nullable()->after('role');
        });
    }
};
