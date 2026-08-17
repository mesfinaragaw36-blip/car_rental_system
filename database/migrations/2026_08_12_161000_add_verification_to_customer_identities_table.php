<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_identities', function (Blueprint $table) {
            $table->foreignId('verified_by')
                ->nullable()
                ->after('verification_status')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('customer_identities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_by');
        });
    }
};