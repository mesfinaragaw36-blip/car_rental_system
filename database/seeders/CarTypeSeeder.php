<?php

namespace Database\Seeders;

use App\Models\CarType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CarTypeSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultColors = [
            'Sedan' => ['White', 'Silver', 'Black', 'Grey'],
            'SUV' => ['White', 'Black', 'Grey', 'Silver'],
            'Hatchback' => ['White', 'Red', 'Blue', 'Black'],
            'Pickup' => ['White', 'Silver', 'Grey'],
            'Van' => ['White', 'Silver'],
            'Truck' => ['White', 'Blue'],
            'Coupe' => ['Black', 'Red', 'White'],
            'Convertible' => ['Black', 'White', 'Red'],
        ];

        $templates = [
            // Sedans
            ['Sedan', 'Toyota', 'Corolla', 2022, ['Petrol'], ['Manual', 'Automatic'], ['1.8L'], [5]],
            ['Sedan', 'Toyota', 'Camry', 2023, ['Petrol'], ['Automatic'], ['2.5L'], [5]],
            ['Sedan', 'Hyundai', 'Elantra', 2022, ['Petrol'], ['Automatic'], ['2.0L'], [5]],
            ['Sedan', 'Honda', 'Civic', 2021, ['Petrol'], ['Manual'], ['1.8L'], [5]],
            ['Sedan', 'Kia', 'Rio', 2020, ['Petrol'], ['Manual'], ['1.4L'], [5]],
            ['Sedan', 'Hyundai', 'Accent', 2021, ['Petrol'], ['Manual'], ['1.4L'], [5]],
            ['Sedan', 'Nissan', 'Sunny', 2022, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['Sedan', 'Changan', 'Alsvin', 2023, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['Sedan', 'JAC', 'J4', 2021, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['Sedan', 'Geely', 'Emgrand', 2022, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['Sedan', 'MG', '5', 2023, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            // SUVs
            ['SUV', 'Toyota', 'Land Cruiser', 2023, ['Diesel'], ['Automatic'], ['4.5L'], [7]],
            ['SUV', 'Toyota', 'Land Cruiser Prado', 2022, ['Diesel'], ['Automatic'], ['4.0L'], [7]],
            ['SUV', 'Toyota', 'Fortuner', 2021, ['Diesel'], ['Manual'], ['2.7L'], [7]],
            ['SUV', 'Toyota', 'Harrier', 2022, ['Petrol'], ['Automatic'], ['2.0L'], [5]],
            ['SUV', 'Toyota', 'RAV4', 2023, ['Petrol'], ['Automatic'], ['2.0L'], [5]],
            ['SUV', 'Mitsubishi', 'Pajero', 2020, ['Diesel'], ['Manual'], ['3.2L'], [7]],
            ['SUV', 'Kia', 'Sportage', 2022, ['Petrol'], ['Automatic'], ['2.0L'], [5]],
            ['SUV', 'Hyundai', 'Tucson', 2023, ['Petrol'], ['Automatic'], ['2.0L'], [5]],
            ['SUV', 'Nissan', 'Patrol', 2022, ['Petrol'], ['Manual'], ['4.8L'], [7]],
            ['SUV', 'Land Rover', 'Defender', 2023, ['Diesel'], ['Manual'], ['2.4L'], [5]],
            ['SUV', 'Ford', 'Everest', 2021, ['Diesel'], ['Manual'], ['3.2L'], [7]],
            ['SUV', 'Haval', 'Jolion', 2023, ['Petrol'], ['Automatic'], ['1.5L'], [5]],
            ['SUV', 'Haval', 'H6', 2023, ['Petrol'], ['Automatic'], ['2.0L'], [5]],
            ['SUV', 'Wuling', 'Almaz', 2022, ['Petrol'], ['Automatic'], ['1.5L'], [5]],
            ['SUV', 'Changan', 'CS35', 2021, ['Petrol'], ['Manual'], ['1.6L'], [5]],
            ['SUV', 'Geely', 'Coolray', 2023, ['Petrol'], ['Automatic'], ['1.5L'], [5]],
            ['SUV', 'MG', 'ZS', 2022, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['SUV', 'BYD', 'Atto 3', 2023, ['Electric'], ['Automatic'], null, [5]],
            // Hatchbacks
            ['Hatchback', 'Toyota', 'Vitz', 2019, ['Petrol'], ['Manual'], ['1.0L'], [5]],
            ['Hatchback', 'Toyota', 'Ractis', 2018, ['Petrol'], ['Automatic'], ['1.3L'], [5]],
            ['Hatchback', 'Toyota', 'Passo', 2018, ['Petrol'], ['Automatic'], ['1.0L'], [4]],
            ['Hatchback', 'Toyota', 'Yaris', 2021, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['Hatchback', 'Suzuki', 'Swift', 2021, ['Petrol'], ['Manual'], ['1.2L'], [5]],
            ['Hatchback', 'Suzuki', 'Celerio', 2020, ['Petrol'], ['Manual'], ['1.0L'], [4]],
            ['Hatchback', 'Kia', 'Picanto', 2020, ['Petrol'], ['Manual'], ['1.0L'], [4]],
            ['Hatchback', 'Hyundai', 'i10', 2020, ['Petrol'], ['Manual'], ['1.1L'], [4]],
            ['Hatchback', 'Hyundai', 'Getz', 2015, ['Petrol'], ['Manual'], ['1.3L'], [5]],
            ['Hatchback', 'BYD', 'Dolphin', 2023, ['Electric'], ['Automatic'], null, [5]],
            // Pickups
            ['Pickup', 'Toyota', 'Hilux', 2023, ['Diesel'], ['Manual'], ['2.4L'], [5]],
            ['Pickup', 'Toyota', 'Land Cruiser Pickup', 2022, ['Diesel'], ['Manual'], ['4.2L'], [5]],
            ['Pickup', 'Mitsubishi', 'L200', 2021, ['Diesel'], ['Manual'], ['2.5L'], [5]],
            ['Pickup', 'Ford', 'Ranger', 2022, ['Diesel'], ['Manual'], ['2.2L'], [5]],
            ['Pickup', 'Isuzu', 'D-Max', 2021, ['Diesel'], ['Manual'], ['2.5L'], [5]],
            ['Pickup', 'JAC', 'T6', 2020, ['Diesel'], ['Manual'], ['2.0L'], [5]],
            // Vans
            ['Van', 'Toyota', 'Hiace', 2022, ['Diesel'], ['Manual'], ['2.5L'], [12]],
            ['Van', 'Toyota', 'Probox', 2020, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['Van', 'Toyota', 'Corolla Fielder', 2021, ['Petrol'], ['Manual'], ['1.5L'], [5]],
            ['Van', 'Hyundai', 'H-1', 2020, ['Diesel'], ['Manual'], ['2.5L'], [9]],
            ['Van', 'Hyundai', 'Grand Starex', 2021, ['Diesel'], ['Manual'], ['2.5L'], [12]],
            ['Van', 'Wuling', 'Confero', 2020, ['Petrol'], ['Manual'], ['1.5L'], [8]],
            ['Van', 'Wuling', 'Cortez', 2021, ['Petrol'], ['Manual'], ['1.5L'], [7]],
            // Trucks
            ['Truck', 'Isuzu', 'NPR', 2021, ['Diesel'], ['Manual'], ['4.2L'], [2]],
            ['Truck', 'Fuso', 'Canter', 2021, ['Diesel'], ['Manual'], ['3.0L'], [2]],
            ['Truck', 'Hyundai', 'HD65', 2020, ['Diesel'], ['Manual'], ['3.9L'], [2]],
            ['Truck', 'Wuling', 'Formo', 2020, ['Petrol'], ['Manual'], ['1.2L'], [2]],
            // Coupe / Convertible
            ['Coupe', 'Toyota', 'GT86', 2021, ['Petrol'], ['Manual'], ['2.0L'], [4]],
            ['Convertible', 'BMW', '4 Series', 2022, ['Petrol'], ['Automatic'], ['2.0L'], [4]],
        ];

        foreach ($templates as [$category, $brand, $model, $year, $fuelTypes, $transmissions, $engineSizes, $seats]) {
            CarType::updateOrCreate(
                ['brand' => $brand, 'model' => $model, 'year' => $year],
                [
                    'categories' => [$category],
                    'fuel_types' => $fuelTypes,
                    'transmissions' => $transmissions,
                    'engine_sizes' => $engineSizes,
                    'seats' => $seats,
                    'colors' => $defaultColors[$category] ?? ['White', 'Black'],
                    'is_active' => true,
                ]
            );
        }
    }
}
