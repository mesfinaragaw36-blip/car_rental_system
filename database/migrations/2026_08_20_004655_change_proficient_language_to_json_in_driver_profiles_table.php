<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->json('proficient_language')->nullable()->change();
        });

        // Migrate existing comma-separated string values to JSON arrays
        DB::table('driver_profiles')
            ->orderBy('id')
            ->whereNotNull('proficient_language')
            ->where('proficient_language', '!=', '')
            ->each(function ($row) {
                $value = $row->proficient_language;
                if (str_starts_with($value, '[')) {
                    return;
                }
                $languages = array_map('trim', explode(',', $value));
                DB::table('driver_profiles')
                    ->where('id', $row->id)
                    ->update(['proficient_language' => json_encode($languages)]);
            });
    }

    public function down(): void
    {
        Schema::table('driver_profiles', function (Blueprint $table) {
            $table->string('proficient_language', 255)->nullable()->change();
        });
    }
};
