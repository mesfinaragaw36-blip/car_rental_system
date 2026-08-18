<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('refund_accounts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')
            ->unique()
            ->constrained('users')
            ->cascadeOnDelete();
        $table->enum('refund_method', ['cbe', 'telebirr'])->nullable();
        $table->string('cbe_account_number')->nullable();
        $table->string('cbe_account_holder_name')->nullable();
        $table->string('telebirr_number')->nullable();
        $table->string('telebirr_account_holder_name')->nullable();
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('refund_accounts');
    }
};