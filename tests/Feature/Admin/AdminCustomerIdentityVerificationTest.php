<?php

namespace Tests\Feature\Admin;

use App\Models\CustomerIdentity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCustomerIdentityVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_a_customer_identity()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);

        $identity = CustomerIdentity::create([
            'user_id' => $customer->id,
            'national_id_number' => '123456789012',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.users.verify-customer-identity', $customer))
            ->assertRedirect();

        $identity->refresh();
        $this->assertSame('approved', $identity->verification_status);
        $this->assertSame($admin->id, $identity->verified_by);
        $this->assertNotNull($identity->verified_at);
    }

    public function test_admin_can_reject_a_customer_identity()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);

        CustomerIdentity::create([
            'user_id' => $customer->id,
            'national_id_number' => '123456789012',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.users.reject-customer-identity', $customer))
            ->assertRedirect();

        $this->assertDatabaseHas('customer_identities', [
            'user_id' => $customer->id,
            'verification_status' => 'rejected',
        ]);
    }

    public function test_admin_user_details_include_customer_identity()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);

        CustomerIdentity::create([
            'user_id' => $customer->id,
            'national_id_number' => '123456789012',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.show', $customer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/show')
                ->where('user.id', $customer->id)
                ->where('user.customer_identity.national_id_number', '123456789012')
                ->where('user.customer_identity.verification_status', 'pending')
            );
    }
}
