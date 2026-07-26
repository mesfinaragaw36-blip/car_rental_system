<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Car>
 */
class CarFactory extends Factory
{
    protected $model = Car::class;

    public function definition(): array
    {
        return [
            'owner_id' => User::factory()->state(fn () => ['role' => 'owner']),
            'brand' => fake()->company(),
            'model' => fake()->word(),
            'year' => fake()->numberBetween(2015, 2024),
            'plate_number' => fake()->unique()->bothify('??-####'),
            'category' => 'Sedan',
            'color' => fake()->safeColorName(),
            'fuel_type' => 'Petrol',
            'transmission' => 'Automatic',
            'engine_size' => fake()->randomElement(['1.5L', '2.0L']),
            'mileage' => fake()->numberBetween(10000, 120000),
            'seats' => fake()->numberBetween(4, 7),
            'daily_price' => fake()->randomFloat(2, 500, 2500),
            'description' => fake()->sentence(),
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ];
    }
}
