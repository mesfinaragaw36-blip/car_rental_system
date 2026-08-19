<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('owner_profiles', function (Blueprint $table) {
            $table->enum('organization_type', [
                'private_limited_company',
                'share_company',
                'sole_proprietorship',
                'partnership',
                'cooperative',
                'government_organization',
                'ngo_non_profit',
                'other',
            ])->nullable()->after('owner_type');
            $table->string('tin_number', 10)->nullable()->after('organization_type');
            $table->text('address')->nullable()->after('tin_number');
            $table->string('business_license_file_path')->nullable()->after('trade_license_number');
            $table->string('vehicle_ownership_certificate_file_path')->nullable()->after('business_license_file_path');
            $table->boolean('profile_completed')->default(false)->after('verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('owner_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'organization_type',
                'tin_number',
                'address',
                'business_license_file_path',
                'vehicle_ownership_certificate_file_path',
                'profile_completed',
            ]);
        });
    }
};
