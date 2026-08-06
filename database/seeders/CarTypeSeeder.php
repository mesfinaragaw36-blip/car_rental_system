<?php

namespace Database\Seeders;

use App\Models\CarType;
use App\Models\CarTypeName;
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
        $templates = [
            // Sedans
            ['Sedan', 'Toyota', 'Corolla', 'Petrol', 'Manual', '1.8L', 5],
            ['Sedan', 'Toyota', 'Camry', 'Petrol', 'Automatic', '2.5L', 5],
            ['Sedan', 'Hyundai', 'Elantra', 'Petrol', 'Automatic', '2.0L', 5],
            ['Sedan', 'Honda', 'Civic', 'Petrol', 'Manual', '1.8L', 5],
            ['Sedan', 'Kia', 'Rio', 'Petrol', 'Manual', '1.4L', 5],
            ['Sedan', 'Hyundai', 'Accent', 'Petrol', 'Manual', '1.4L', 5],
            ['Sedan', 'Nissan', 'Sunny', 'Petrol', 'Manual', '1.5L', 5],
            ['Sedan', 'Changan', 'Alsvin', 'Petrol', 'Manual', '1.5L', 5],
            ['Sedan', 'JAC', 'J4', 'Petrol', 'Manual', '1.5L', 5],
            ['Sedan', 'Geely', 'Emgrand', 'Petrol', 'Manual', '1.5L', 5],
            ['Sedan', 'MG', '5', 'Petrol', 'Manual', '1.5L', 5],
            // SUVs
            ['SUV', 'Toyota', 'Land Cruiser', 'Diesel', 'Automatic', '4.5L', 7],
            ['SUV', 'Toyota', 'Land Cruiser Prado', 'Diesel', 'Automatic', '4.0L', 7],
            ['SUV', 'Toyota', 'Fortuner', 'Diesel', 'Manual', '2.7L', 7],
            ['SUV', 'Toyota', 'Harrier', 'Petrol', 'Automatic', '2.0L', 5],
            ['SUV', 'Toyota', 'RAV4', 'Petrol', 'Automatic', '2.0L', 5],
            ['SUV', 'Mitsubishi', 'Pajero', 'Diesel', 'Manual', '3.2L', 7],
            ['SUV', 'Kia', 'Sportage', 'Petrol', 'Automatic', '2.0L', 5],
            ['SUV', 'Hyundai', 'Tucson', 'Petrol', 'Automatic', '2.0L', 5],
            ['SUV', 'Nissan', 'Patrol', 'Petrol', 'Manual', '4.8L', 7],
            ['SUV', 'Land Rover', 'Defender', 'Diesel', 'Manual', '2.4L', 5],
            ['SUV', 'Ford', 'Everest', 'Diesel', 'Manual', '3.2L', 7],
            ['SUV', 'Haval', 'Jolion', 'Petrol', 'Automatic', '1.5L', 5],
            ['SUV', 'Haval', 'H6', 'Petrol', 'Automatic', '2.0L', 5],
            ['SUV', 'Wuling', 'Almaz', 'Petrol', 'Automatic', '1.5L', 5],
            ['SUV', 'Changan', 'CS35', 'Petrol', 'Manual', '1.6L', 5],
            ['SUV', 'Geely', 'Coolray', 'Petrol', 'Automatic', '1.5L', 5],
            ['SUV', 'MG', 'ZS', 'Petrol', 'Manual', '1.5L', 5],
            ['SUV', 'BYD', 'Atto 3', 'Electric', 'Automatic', null, 5],
            // Hatchbacks (including the taxi staples)
            ['Hatchback', 'Toyota', 'Vitz', 'Petrol', 'Manual', '1.0L', 5],
            ['Hatchback', 'Toyota', 'Ractis', 'Petrol', 'Automatic', '1.3L', 5],
            ['Hatchback', 'Toyota', 'Passo', 'Petrol', 'Automatic', '1.0L', 4],
            ['Hatchback', 'Toyota', 'Yaris', 'Petrol', 'Manual', '1.5L', 5],
            ['Hatchback', 'Suzuki', 'Swift', 'Petrol', 'Manual', '1.2L', 5],
            ['Hatchback', 'Suzuki', 'Celerio', 'Petrol', 'Manual', '1.0L', 4],
            ['Hatchback', 'Kia', 'Picanto', 'Petrol', 'Manual', '1.0L', 4],
            ['Hatchback', 'Hyundai', 'i10', 'Petrol', 'Manual', '1.1L', 4],
            ['Hatchback', 'Hyundai', 'Getz', 'Petrol', 'Manual', '1.3L', 5],
            ['Hatchback', 'BYD', 'Dolphin', 'Electric', 'Automatic', null, 5],
            // Pickups
            ['Pickup', 'Toyota', 'Hilux', 'Diesel', 'Manual', '2.4L', 5],
            ['Pickup', 'Toyota', 'Land Cruiser Pickup', 'Diesel', 'Manual', '4.2L', 5],
            ['Pickup', 'Mitsubishi', 'L200', 'Diesel', 'Manual', '2.5L', 5],
            ['Pickup', 'Ford', 'Ranger', 'Diesel', 'Manual', '2.2L', 5],
            ['Pickup', 'Isuzu', 'D-Max', 'Diesel', 'Manual', '2.5L', 5],
            ['Pickup', 'JAC', 'T6', 'Diesel', 'Manual', '2.0L', 5],
            // Vans (minibuses and station wagons)
            ['Van', 'Toyota', 'Hiace', 'Diesel', 'Manual', '2.5L', 12],
            ['Van', 'Toyota', 'Probox', 'Petrol', 'Manual', '1.5L', 5],
            ['Van', 'Toyota', 'Corolla Fielder', 'Petrol', 'Manual', '1.5L', 5],
            ['Van', 'Hyundai', 'H-1', 'Diesel', 'Manual', '2.5L', 9],
            ['Van', 'Hyundai', 'Grand Starex', 'Diesel', 'Manual', '2.5L', 12],
            ['Van', 'Wuling', 'Confero', 'Petrol', 'Manual', '1.5L', 8],
            ['Van', 'Wuling', 'Cortez', 'Petrol', 'Manual', '1.5L', 7],
            // Trucks
            ['Truck', 'Isuzu', 'NPR', 'Diesel', 'Manual', '4.2L', 2],
            ['Truck', 'Fuso', 'Canter', 'Diesel', 'Manual', '3.0L', 2],
            ['Truck', 'Hyundai', 'HD65', 'Diesel', 'Manual', '3.9L', 2],
            ['Truck', 'Wuling', 'Formo', 'Petrol', 'Manual', '1.2L', 2],
            // Coupe / Convertible
            ['Coupe', 'Toyota', 'GT86', 'Petrol', 'Manual', '2.0L', 4],
            ['Convertible', 'BMW', '4 Series', 'Petrol', 'Automatic', '2.0L', 4],
        ];

        foreach ($templates as [$category, $brand, $model, $fuelType, $transmission, $engineSize, $seats]) {
            $carTypeName = CarTypeName::where('name', $category)->first();

            CarType::updateOrCreate(
                ['brand' => $brand, 'model' => $model],
                [
                    'car_type_name_id' => $carTypeName?->id,
                    'fuel_type' => $fuelType,
                    'transmission' => $transmission,
                    'engine_size' => $engineSize,
                    'seats' => $seats,
                    'is_active' => true,
                ]
            );
        }
    }
}
