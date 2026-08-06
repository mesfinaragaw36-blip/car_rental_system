<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\CarAvailablePeriod;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CarAvailablePeriod>
 */
class CarAvailablePeriodFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('+1 week', '+2 weeks')->format('Y-m-d');

        return [
            'car_id' => Car::factory(),
            'start_date' => $start,
            'end_date' => Carbon::parse($start)->addDays(30)->format('Y-m-d'),
        ];
    }
}
