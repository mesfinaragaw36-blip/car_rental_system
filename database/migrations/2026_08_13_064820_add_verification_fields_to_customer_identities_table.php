<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_identities', function (Blueprint $table) {
            $table->string('national_id_front_path')->nullable()->after('national_id_number');
            $table->string('national_id_back_path')->nullable()->after('national_id_front_path');
        });
    }

    public function down(): void
    {
        Schema::table('customer_identities', function (Blueprint $table) {
            $table->dropColumn(['national_id_front_path', 'national_id_back_path']);
        });
    }
};
