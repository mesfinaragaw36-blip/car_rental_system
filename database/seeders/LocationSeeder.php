<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = [
            ['name' => 'Bole Branch', 'address' => 'Bole Road, near Bole Medhanialem', 'city' => 'Addis Ababa'],
            ['name' => 'Piassa Branch', 'address' => 'Piassa, Churchill Avenue', 'city' => 'Addis Ababa'],
            ['name' => 'Mexico Branch', 'address' => 'Mexico Square, Kazanchis', 'city' => 'Addis Ababa'],
        ];

        foreach ($branches as $branch) {
            DB::table('locations')->updateOrInsert(
                ['name' => $branch['name']],
                $branch,
            );
        }
    }
}
