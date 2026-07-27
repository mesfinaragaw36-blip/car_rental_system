<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\DriverProfile;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'role' => ['required', 'string', Rule::in(['customer', 'owner', 'driver'])],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'role' => $input['role'],
            'status' => 'active',
            'password' => $input['password'],
        ]);

        if ($input['role'] === 'driver') {
            DriverProfile::create([
                'user_id' => $user->id,
                'license_number' => 'PENDING',
                'experience_years' => 0,
                'availability' => 'available',
                'verification_status' => 'pending',
            ]);
        }

        return $user;
    }
}
