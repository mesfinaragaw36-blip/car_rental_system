<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pickupDate = fake()->dateTimeBetween('now', '+30 days');
        $returnDate = fake()->dateTimeBetween($pickupDate, '+60 days');

        return [
            'customer_id' => User::factory()->create(['role' => 'customer']),
            'owner_id' => User::factory()->create(['role' => 'owner']),
            'car_id' => Car::factory(),
            'pickup_date' => $pickupDate->format('Y-m-d'),
            'return_date' => $returnDate->format('Y-m-d'),
            'pickup_location' => fake()->randomElement(['Addis Ababa', 'Bahir Dar', 'Gondar', 'Mekelle']),
            'return_location' => fake()->randomElement(['Addis Ababa', 'Bahir Dar', 'Gondar', 'Mekelle']),
            'need_driver' => fake()->boolean(70),
            'total_price' => fake()->randomFloat(2, 500, 5000),
            'deposit_amount' => fake()->randomFloat(2, 100, 1000),
            'status' => 'pending',
            'payment_status' => 'pending',
            'deposit_status' => 'pending',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    public function withDriver(): static
    {
        return $this->state(fn (array $attributes) => [
            'need_driver' => true,
        ]);
    }

    public function withoutDriver(): static
    {
        return $this->state(fn (array $attributes) => [
            'need_driver' => false,
        ]);
    }
}

