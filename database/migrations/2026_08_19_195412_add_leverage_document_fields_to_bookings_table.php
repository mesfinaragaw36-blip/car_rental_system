<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('leverage_document_type')->nullable()->after('security_deposit_paid_at')->comment('check, property_document, other');
            $table->string('leverage_document_path')->nullable();
            $table->string('leverage_document_name')->nullable();
            $table->text('leverage_document_description')->nullable();
            $table->string('leverage_document_status')->nullable()->default('held')->comment('held, released, pending_charges');
            $table->timestamp('leverage_document_released_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'leverage_document_type',
                'leverage_document_path',
                'leverage_document_name',
                'leverage_document_description',
                'leverage_document_status',
                'leverage_document_released_at',
            ]);
        });
    }
};
