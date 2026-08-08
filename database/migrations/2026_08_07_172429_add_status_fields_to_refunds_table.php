<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('reason');
            $table->timestamp('processed_at')->nullable()->after('status');
            $table->foreignId('processed_by')
                ->nullable()
                ->after('processed_at')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->dropForeign(['processed_by']);
            $table->dropColumn([
                'status',
                'processed_at',
                'processed_by',
            ]);
        });
    }
};
