<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Inspection;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingInfoHidingTest extends TestCase
{
    use RefreshDatabase;

    private function booking(User $owner, User $customer): Booking
    {
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
            'status' => Booking::STATUS_CONFIRMED,
        ]);
    }

    public function test_owner_does_not_see_customer_information_in_booking_details(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        $this->actingAs($owner)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.customer', null));
    }

    public function test_owner_does_not_see_customer_email_in_booking_list(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        $this->actingAs($owner)
            ->get(route('bookings.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('bookings.data.0.customer.name', $customer->name)
                ->where('bookings.data.0.customer.phone', $customer->phone)
                ->missing('bookings.data.0.customer.email'));
    }

    public function test_customer_does_not_see_owner_information_in_booking_details(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        $this->actingAs($customer)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.owner', null));
    }

    public function test_admin_sees_customer_email_in_booking_details(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        $this->actingAs($admin)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.customer.email', $customer->email));
    }

    public function test_booking_details_loads_when_a_deposit_payment_exists(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        Payment::create([
            'booking_id' => $booking->id,
            'type' => Payment::TYPE_DEPOSIT,
            'amount' => 100.00,
            'payment_method' => 'telebirr',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->actingAs($owner)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.payment.id', $booking->payments->first()->id)
                ->where('booking.payment.payment_method', 'telebirr')
                ->where('booking.payment.payment_status', 'paid'));
    }

    public function test_booking_details_exposes_pickup_inspection_approved_flag(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        $this->actingAs($customer)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.pickup_inspection_approved', false));

        Inspection::factory()->create([
            'booking_id' => $booking->id,
            'type' => Inspection::TYPE_PICKUP,
            'status' => Inspection::STATUS_APPROVED,
        ]);

        $this->actingAs($customer)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.pickup_inspection_approved', true));
    }

    public function test_owner_does_not_see_customer_information_even_past_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $booking = $this->booking($owner, $customer);

        $this->actingAs($owner)
            ->get(route('bookings.show', ['booking' => $booking->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.customer', null));
    }
}
