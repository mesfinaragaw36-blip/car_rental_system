<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_identities', function (Blueprint $table) {
            $table->string('verification_status')->default('pending')->after('national_id_number');
            $table->foreignId('verified_by')->nullable()->after('verification_status')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verified_by');
        });

        // Identities created before the approval flow are considered verified.
        DB::table('customer_identities')->update([
            'verification_status' => 'approved',
        ]);
    }

    public function down(): void
    {
        Schema::table('customer_identities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_by');
            $table->dropColumn(['verification_status', 'verified_at']);
        });
    }
};
