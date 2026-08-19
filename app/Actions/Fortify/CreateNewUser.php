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
            'owner_type' => ['required_if:role,owner', 'string', Rule::in(['individual', 'organization'])],
            'name' => ['required_unless:owner_type,organization', 'string', 'max:255'],
            'business_name' => ['required_if:owner_type,organization', 'string', 'max:255'],
            'trade_license_number' => ['required_if:owner_type,organization', 'string', 'max:100'],
            'password' => $this->passwordRules(),
        ])->validate();

        // For organization owners, use business_name as name
        $name = ($input['role'] === 'owner' && ($input['owner_type'] ?? '') === 'organization')
            ? $input['business_name']
            : $input['name'];

        $user = User::create([
            'name' => $name,
            'email' => $input['email'],
            'phone' => $input['phone'],
            'role' => $input['role'],
            'status' => 'active',
            'password' => $input['password'],
        ]);

        if ($user->role === 'driver') {
            DriverProfile::create([
                'user_id' => $user->id,
                'license_number' => 'PENDING',
                'verification_status' => 'pending',
            ]);
        }

        if ($user->role === 'owner') {
            $ownerType = $input['owner_type'] ?? 'individual';

            $user->ownerProfile()->create([
                'owner_type' => $ownerType,
                'business_name' => $ownerType === 'organization' ? $input['business_name'] : null,
                'national_id' => 'PENDING',
                'trade_license_number' => $ownerType === 'organization' ? $input['trade_license_number'] : null,
                'verification_status' => 'pending',
            ]);
        }

        return $user;
    }
}
