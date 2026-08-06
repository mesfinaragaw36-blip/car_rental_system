<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Inspection;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inspection>
 */
class InspectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => function () {
                $owner = User::factory()->create(['role' => 'owner']);
                $customer = User::factory()->create(['role' => 'customer']);
                $car = Car::factory()->create([
                    'owner_id' => $owner->id,
                    'approval_status' => 'approved',
                    'availability_status' => 'available',
                    'daily_price' => 100.00,
                ]);

                return Booking::create([
                    'customer_id' => $customer->id,
                    'owner_id' => $owner->id,
                    'car_id' => $car->id,
                    'pickup_date' => now()->addDays(3)->toDateString(),
                    'return_date' => now()->addDays(6)->toDateString(),
                    'pickup_location' => 'Airport',
                    'return_location' => 'Hotel',
                    'need_driver' => false,
                    'total_price' => 300.00,
                    'deposit_amount' => 500.00,
                    'status' => Booking::STATUS_DEPOSIT_PAID,
                ]);
            },
            'type' => $this->faker->randomElement([Inspection::TYPE_PICKUP, Inspection::TYPE_RETURN]),
            'status' => Inspection::STATUS_APPROVED,
            'conducted_by' => User::factory(),
            'conducted_at' => now(),
            'mileage_reading' => $this->faker->numberBetween(10000, 100000),
            'fuel_level' => $this->faker->numberBetween(20, 100),
            'damages' => null,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
