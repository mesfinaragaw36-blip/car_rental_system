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
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('pickup_branch_id')
                ->nullable()
                ->after('return_location')
                ->constrained('locations')
                ->nullOnDelete();

            $table->foreignId('return_branch_id')
                ->nullable()
                ->after('pickup_branch_id')
                ->constrained('locations')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pickup_branch_id');
            $table->dropConstrainedForeignId('return_branch_id');
        });
    }
};
