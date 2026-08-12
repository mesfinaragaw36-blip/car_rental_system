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
        Schema::table('inspections', function (Blueprint $table) {
            $table->boolean('id_verified')->nullable()->after('notes');
            $table->foreignId('id_verified_by')->nullable()->after('id_verified')->constrained('users')->nullOnDelete();
            $table->timestamp('id_verified_at')->nullable()->after('id_verified_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspections', function (Blueprint $table) {
            $table->dropForeign(['id_verified_by']);
            $table->dropColumn(['id_verified', 'id_verified_by', 'id_verified_at']);
        });
    }
};
