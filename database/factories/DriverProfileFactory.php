<?php

namespace Database\Factories;

use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DriverProfile>
 */
class DriverProfileFactory extends Factory
{
    protected $model = DriverProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => 'driver']),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'license_number' => 'DL-'.fake()->unique()->numerify('######'),
            'license_type' => fake()->randomElement(['አውቶ', 'ህዝብ', 'ደረቅ ጭነት', 'ፈሳሽ ጭነት', 'ግንባታ መሣሪያዎች / ኮንስትራክሽን']),
            'experience_years' => fake()->numberBetween(0, 30),
            'daily_rate' => fake()->randomFloat(2, 300, 1500),
            'location' => fake()->randomElement(['Addis Ababa', 'Bahir Dar', 'Gondar', 'Mekelle', 'Hawassa']),
            'telebirr_phone' => fake()->optional()->numerify('09########'),
            'cbe_account' => fake()->optional()->numerify('1000#########'),
            'verification_status' => 'pending',
            'license_file_path' => '/storage/driver-licenses/'.fake()->uuid().'.jpg',
            'national_id_file_path' => fake()->optional()->passthrough('/storage/national-ids/'.fake()->uuid().'.jpg'),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'approved',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'pending',
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'rejected',
        ]);
    }
}

