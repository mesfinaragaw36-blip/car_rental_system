<?php

namespace Database\Seeders;

use App\Http\Controllers\Admin\RoleController;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Collect all permission keys from the controller's definition
        $allPermissions = collect(RoleController::AVAILABLE_PERMISSIONS)
            ->flatMap(fn ($group) => array_keys($group['items']))
            ->values()
            ->all();

        Role::updateOrCreate(
            ['name' => 'Admin'],
            ['permissions' => $allPermissions],
        );

        User::updateOrCreate(
            ['email' => 'admin@carrental.com'],
            [
                'name' => 'System Administrator',
                'phone' => '0911000000',
                'address' => 'Addis Ababa',
                'role' => 'admin',
                'status' => 'active',
                'password' => Hash::make('passwordd'),
            ]
        );
    }
}
