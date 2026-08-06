<?php

namespace Database\Factories;

use App\Models\CarTypeName;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CarTypeName>
 */
class CarTypeNameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement(['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Truck', 'Coupe', 'Convertible']);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
