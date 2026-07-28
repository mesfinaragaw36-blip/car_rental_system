<?php

namespace Database\Seeders;

use App\Models\CarTypeName;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CarTypeNameSeeder extends Seeder
{
    public function run(): void
    {
        $names = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Truck', 'Coupe', 'Convertible'];

        foreach ($names as $i => $name) {
            CarTypeName::updateOrCreate(
                ['name' => $name],
                [
                    'slug' => Str::slug($name),
                    'is_active' => true,
                    'sort_order' => $i + 1,
                ]
            );
        }
    }
}
