<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notify_now_creates_a_notification_for_the_user(): void
    {
        $user = User::factory()->create();

        $user->notifyNow(
            'Booking received',
            'A customer requested your car.',
            'booking',
            'App\Models\Booking',
            42
        );

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'booking',
            'title' => 'Booking received',
            'related_id' => 42,
            'read_at' => null,
        ]);
    }

    public function test_user_can_view_their_notifications_page(): void
    {
        $user = User::factory()->create();
        $user->notifyNow('Hello', 'This is a message.', 'system');

        $response = $this->actingAs($user)->get('/notifications');

        $response->assertOk();
        $response->assertSee('Hello');
        $response->assertSee('This is a message.');
    }

    public function test_user_can_mark_a_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = $user->notifyNow('Hello', 'This is a message.', 'system');

        $response = $this->actingAs($user)->post(
            route('notifications.read', ['notification' => $notification->id])
        );

        $response->assertRedirect();
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $user->notifyNow('First', 'Message one.', 'system');
        $user->notifyNow('Second', 'Message two.', 'system');

        $response = $this->actingAs($user)->post(route('notifications.read-all'));

        $response->assertRedirect();
        $this->assertSame(0, $user->notifications()->whereNull('read_at')->count());
    }

    public function test_user_cannot_mark_another_users_notification_as_read(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $notification = $owner->notifyNow('Private', 'Not for you.', 'system');

        $response = $this->actingAs($other)->post(
            route('notifications.read', ['notification' => $notification->id])
        );

        $response->assertStatus(403);
        $this->assertNull($notification->fresh()->read_at);
    }
}
