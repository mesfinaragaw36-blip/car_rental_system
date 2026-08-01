<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReviewSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_submit_review_for_car_after_completed_booking(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(5)->toDateString(),
            'return_date' => now()->subDays(2)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($customer)
            ->post(route('bookings.reviews.store', $booking), [
                'reviewable_type' => 'car',
                'reviewable_id' => $car->id,
                'rating' => 5,
                'review_text' => 'Great ride.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('reviews', [
            'booking_id' => $booking->id,
            'reviewer_id' => $customer->id,
            'reviewable_type' => Car::class,
            'reviewable_id' => $car->id,
            'rating' => 5,
            'review_text' => 'Great ride.',
        ]);
    }

    public function test_owner_can_submit_review_for_customer_after_completed_booking(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(5)->toDateString(),
            'return_date' => now()->subDays(2)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($owner)
            ->post(route('bookings.reviews.store', $booking), [
                'reviewable_type' => 'user',
                'reviewable_id' => $customer->id,
                'rating' => 4,
                'review_text' => 'Customer was punctual and easy to work with.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('reviews', [
            'booking_id' => $booking->id,
            'reviewer_id' => $owner->id,
            'reviewable_type' => User::class,
            'reviewable_id' => $customer->id,
            'rating' => 4,
            'review_text' => 'Customer was punctual and easy to work with.',
        ]);
    }

    public function test_admin_can_view_reviews_on_booking_details_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'owner']);

        $car = Car::factory()->create([
            'owner_id' => $owner->id,
            'approval_status' => 'approved',
            'availability_status' => 'available',
            'daily_price' => 100.00,
        ]);

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(5)->toDateString(),
            'return_date' => now()->subDays(2)->toDateString(),
            'pickup_location' => 'Airport',
            'return_location' => 'Hotel',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'completed',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'reviewer_id' => $owner->id,
            'reviewable_type' => User::class,
            'reviewable_id' => $customer->id,
            'rating' => 4,
            'review_text' => 'Customer was punctual and easy to work with.',
        ]);

        $response = $this->actingAs($admin)->get(route('bookings.show', $booking));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('booking.reviews.0.target', $customer->name)
            ->where('booking.reviews.0.reviewer.name', $owner->name)
            ->where('booking.reviews.0.rating', 4)
            ->where('booking.reviews.0.review_text', 'Customer was punctual and easy to work with.')
        );
    }
}
