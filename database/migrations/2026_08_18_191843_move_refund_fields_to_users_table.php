<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('refund_method', 10)->nullable()->after('address');
            $table->string('cbe_account_number', 50)->nullable()->after('refund_method');
            $table->string('cbe_account_holder_name')->nullable()->after('cbe_account_number');
            $table->string('telebirr_number', 20)->nullable()->after('cbe_account_holder_name');
            $table->string('telebirr_account_holder_name')->nullable()->after('telebirr_number');
        });

        // Migrate existing data
        $accounts = DB::table('refund_accounts')->get();
        foreach ($accounts as $account) {
            DB::table('users')->where('id', $account->user_id)->update([
                'refund_method' => $account->refund_method,
                'cbe_account_number' => $account->cbe_account_number,
                'cbe_account_holder_name' => $account->cbe_account_holder_name,
                'telebirr_number' => $account->telebirr_number,
                'telebirr_account_holder_name' => $account->telebirr_account_holder_name,
            ]);
        }

        Schema::dropIfExists('refund_accounts');
    }

    public function down(): void
    {
        Schema::create('refund_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('refund_method', ['cbe', 'telebirr'])->nullable();
            $table->string('cbe_account_number')->nullable();
            $table->string('cbe_account_holder_name')->nullable();
            $table->string('telebirr_number')->nullable();
            $table->string('telebirr_account_holder_name')->nullable();
            $table->timestamps();
        });

        $users = DB::table('users')->whereNotNull('refund_method')->get();
        foreach ($users as $user) {
            DB::table('refund_accounts')->insert([
                'user_id' => $user->id,
                'refund_method' => $user->refund_method,
                'cbe_account_number' => $user->cbe_account_number,
                'cbe_account_holder_name' => $user->cbe_account_holder_name,
                'telebirr_number' => $user->telebirr_number,
                'telebirr_account_holder_name' => $user->telebirr_account_holder_name,
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'refund_method',
                'cbe_account_number',
                'cbe_account_holder_name',
                'telebirr_number',
                'telebirr_account_holder_name',
            ]);
        });
    }
};
