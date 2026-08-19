<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_register_as_individual(): void
    {
        $response = $this->post('/register', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '0912345678',
            'role' => 'owner',
            'owner_type' => 'individual',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/');

        $user = User::where('email', 'john@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('owner', $user->role);

        $this->assertNotNull($user->ownerProfile);
        $this->assertEquals('individual', $user->ownerProfile->owner_type);
        $this->assertNull($user->ownerProfile->business_name);
        $this->assertNull($user->ownerProfile->trade_license_number);
    }

    public function test_owner_can_register_as_organization(): void
    {
        $response = $this->post('/register', [
            'email' => 'jane@example.com',
            'phone' => '0923456789',
            'role' => 'owner',
            'owner_type' => 'organization',
            'business_name' => 'ABC Company Ltd.',
            'trade_license_number' => 'TL-123456789',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/');

        $user = User::where('email', 'jane@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('owner', $user->role);
        $this->assertEquals('ABC Company Ltd.', $user->name); // Organization uses business_name as name

        $this->assertNotNull($user->ownerProfile);
        $this->assertEquals('organization', $user->ownerProfile->owner_type);
        $this->assertEquals('ABC Company Ltd.', $user->ownerProfile->business_name);
        $this->assertEquals('TL-123456789', $user->ownerProfile->trade_license_number);
    }

    public function test_organization_owner_requires_business_name(): void
    {
        $response = $this->post('/register', [
            'email' => 'test@example.com',
            'phone' => '0934567890',
            'role' => 'owner',
            'owner_type' => 'organization',
            'trade_license_number' => 'TL-987654321',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('business_name');
    }

    public function test_organization_owner_requires_trade_license_number(): void
    {
        $response = $this->post('/register', [
            'email' => 'test@example.com',
            'phone' => '0934567890',
            'role' => 'owner',
            'owner_type' => 'organization',
            'business_name' => 'Test Company',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('trade_license_number');
    }

    public function test_owner_type_is_required_when_role_is_owner(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '0934567890',
            'role' => 'owner',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('owner_type');
    }

    public function test_customer_can_register_without_owner_type(): void
    {
        $response = $this->post('/register', [
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'phone' => '0945678901',
            'role' => 'customer',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/');

        $user = User::where('email', 'customer@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('customer', $user->role);
        $this->assertNull($user->ownerProfile);
    }
}
