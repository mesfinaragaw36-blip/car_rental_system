<?php

namespace Database\Factories;

use App\Models\CarType;
use App\Models\CarTypeName;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CarType>
 */
class CarTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'brand' => fake()->randomElement(['Toyota', 'Hyundai', 'Kia', 'Honda', 'Mitsubishi']),
            'model' => fake()->word(),
            'car_type_name_id' => CarTypeName::factory(),
            'fuel_type' => fake()->randomElement(['Petrol', 'Diesel', 'Hybrid', 'Electric']),
            'transmission' => fake()->randomElement(['Manual', 'Automatic', 'Semi']),
            'engine_size' => fake()->optional()->randomElement(['1.5L', '1.8L', '2.0L', '2.4L', '2.8L', '3.0L']),
            'seats' => fake()->optional()->numberBetween(2, 9),
            'is_active' => true,
        ];
    }
}
