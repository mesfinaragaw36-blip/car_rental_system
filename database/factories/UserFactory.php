<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->unique()->numerify('09########'),
            'role' => 'customer',
            'status' => 'active',
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function staffAdmin(): static
    {
        return $this->state(function (array $attributes) {
            $role = Role::create([
                'name' => 'Staff Role '.fake()->unique()->word(),
                'permissions' => [],
            ]);

            return [
                'role' => 'admin',
                'staff_role_id' => $role->id,
            ];
        });
    }

    public function driver(): static
    {
        return $this->state(function (array $attributes) {
            $role = Role::create([
                'name' => 'Driver Role '.fake()->unique()->word(),
                'permissions' => ['driver.access'],
            ]);

            return [
                'role' => 'admin',
                'staff_role_id' => $role->id,
            ];
        });
    }

    public function withPermissions(array $permissions): static
    {
        return $this->afterCreating(function (User $user) use ($permissions) {
            if ($user->staff_role_id !== null) {
                $user->staffRole->update(['permissions' => $permissions]);
            }
        });
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static {}
}
