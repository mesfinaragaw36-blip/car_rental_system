<?php

namespace Tests\Feature\Customer;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function createCar(User $owner): Car
    {
        return Car::create([
            'owner_id' => $owner->id,
            'brand' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2022,
            'plate_number' => fake()->unique()->bothify('??###'),
            'category' => 'Sedan',
            'color' => 'White',
            'fuel_type' => 'Petrol',
            'transmission' => 'Automatic',
            'engine_size' => '1.8L',
            'mileage' => 10000,
            'seats' => 5,
            'daily_price' => 100.00,
            'description' => 'Test car.',
            'approval_status' => 'approved',
            'availability_status' => 'available',
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createBooking(User $owner, User $customer, Car $car, array $overrides = []): Booking
    {
        return Booking::create(array_merge([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDays(3)->toDateString(),
            'return_date' => now()->addDays(6)->toDateString(),
            'pickup_location' => 'Addis Ababa',
            'return_location' => 'Addis Ababa',
            'need_driver' => false,
            'total_price' => 300.00,
            'status' => 'approved',
        ], $overrides));
    }

    public function test_customer_can_pay_an_approved_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($customer)
            ->post(route('payments.store', $booking), [
                'payment_method' => 'Telebirr',
            ]);

        $response->assertRedirect(route('bookings.index'));

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'payment_method' => 'Telebirr',
            'payment_status' => 'paid',
            'amount' => '300.00',
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
        ]);
    }

    public function test_payment_stores_transaction_reference(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $this
            ->actingAs($customer)
            ->post(route('payments.store', $booking), [
                'payment_method' => 'Bank Transfer',
                'transaction_reference' => 'TXN-999888',
            ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'transaction_reference' => 'TXN-999888',
        ]);
    }

    public function test_customer_cannot_pay_a_pending_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car, ['status' => 'pending']);

        $response = $this
            ->actingAs($customer)
            ->post(route('payments.store', $booking), [
                'payment_method' => 'Cash',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'error');

        $this->assertDatabaseMissing('payments', ['booking_id' => $booking->id]);
    }

    public function test_customer_cannot_pay_twice(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => 300.00,
            'payment_method' => 'Cash',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this
            ->actingAs($customer)
            ->post(route('payments.store', $booking), [
                'payment_method' => 'Telebirr',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('toast.type', 'error');

        $this->assertSame(1, Payment::where('booking_id', $booking->id)->count());
    }

    public function test_customer_cannot_pay_another_customers_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $otherCustomer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($otherCustomer)
            ->post(route('payments.store', $booking), [
                'payment_method' => 'Cash',
            ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('payments', ['booking_id' => $booking->id]);
    }

    public function test_payment_method_is_required(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($customer)
            ->post(route('payments.store', $booking), []);

        $response->assertSessionHasErrors(['payment_method']);
        $this->assertDatabaseMissing('payments', ['booking_id' => $booking->id]);
    }
}
