<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            DriverRoleSeeder::class,
            LocationSeeder::class,
            CarTypeNameSeeder::class,
            CarTypeSeeder::class,
            DemoLateReturnSeeder::class,
        ]);
    }
}
