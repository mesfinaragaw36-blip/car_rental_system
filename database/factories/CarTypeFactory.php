<?php

namespace Database\Factories;

use App\Models\CarType;
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
            'year' => fake()->numberBetween(2005, 2026),
            'categories' => fake()->randomElements(['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Minivan'], fake()->numberBetween(1, 2)),
            'fuel_types' => fake()->randomElements(['Petrol', 'Diesel', 'Hybrid', 'Electric'], fake()->numberBetween(1, 2)),
            'transmissions' => fake()->randomElements(['Manual', 'Automatic', 'Semi'], fake()->numberBetween(1, 2)),
            'engine_sizes' => fake()->randomElements(['1.5L', '1.8L', '2.0L', '2.4L', '2.8L', '3.0L'], fake()->numberBetween(1, 2)),
            'seats' => fake()->randomElements([4, 5, 7, 9, 12], fake()->numberBetween(1, 2)),
            'colors' => fake()->randomElements(['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue'], fake()->numberBetween(1, 3)),
            'is_active' => true,
        ];
    }
}
