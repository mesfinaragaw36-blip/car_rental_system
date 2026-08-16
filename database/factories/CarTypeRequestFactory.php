<?php

namespace Database\Factories;

use App\Models\CarTypeRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CarTypeRequest>
 */
class CarTypeRequestFactory extends Factory
{
    protected $model = CarTypeRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'requested_by' => User::factory()->state(fn () => ['role' => 'owner']),
            'brand' => fake()->randomElement(['Toyota', 'Hyundai', 'Kia', 'Honda']),
            'model' => fake()->word(),
            'year' => (string) fake()->numberBetween(2005, 2026),
            'category' => fake()->randomElement(['Sedan', 'SUV', 'Hatchback']),
            'fuel_type' => fake()->randomElement(['Petrol', 'Diesel', 'Hybrid', 'Electric']),
            'transmission' => fake()->randomElement(['Manual', 'Automatic', 'Semi']),
            'engine_size' => fake()->optional()->randomElement(['1.5L', '2.0L', '2.5L']),
            'seats' => fake()->optional()->numberBetween(2, 9),
            'status' => 'pending',
        ];
    }
}
