<?php

namespace Tests\Feature\Customer;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
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
            'deposit_amount' => 500.00,
            'status' => 'confirmed',
        ], $overrides));
    }

    public function test_customer_can_pay_the_deposit_for_a_confirmed_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($customer)
            ->post(route('payments.store', $booking), [
                'payment_method' => 'Telebirr',
                'transaction_reference' => 'TXN-DEP-001',
            ]);

        $response->assertRedirect(route('bookings.index'));

        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'type' => 'booking_deposit',
            'payment_method' => 'Telebirr',
            'payment_status' => 'paid',
            'amount' => '500.00',
        ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'deposit_paid',
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
            'type' => 'booking_deposit',
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

    public function test_customer_can_view_the_payment_page_for_their_confirmed_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($customer)
            ->get(route('payments.create', $booking));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('payment')
            ->where('booking.car.brand', 'Toyota')
            ->where('booking.car.model', 'Corolla')
            ->has('booking.car.plate_number')
            ->where('booking.total_price', 300)
            ->where('booking.deposit_amount', 500));
    }

    public function test_customer_cannot_view_the_payment_page_for_another_customers_booking(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $otherCustomer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $response = $this
            ->actingAs($otherCustomer)
            ->get(route('payments.create', $booking));

        $response->assertForbidden();
    }

    public function test_customer_can_view_their_payment_receipt_with_days_and_daily_rate(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'amount' => 300.00,
            'payment_method' => 'Cash',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this
            ->actingAs($customer)
            ->get(route('payments.receipt', $payment));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('receipt')
            ->where('booking.days', 3)
            ->where('booking.daily_rate', '100.00')
            ->where('payment.amount', '300.00'));
    }

    public function test_customer_cannot_view_another_customers_receipt(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $customer = User::factory()->create(['role' => 'customer']);
        $otherCustomer = User::factory()->create(['role' => 'customer']);
        $car = $this->createCar($owner);
        $booking = $this->createBooking($owner, $customer, $car);

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'amount' => 300.00,
            'payment_method' => 'Cash',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        $response = $this
            ->actingAs($otherCustomer)
            ->get(route('payments.receipt', $payment));

        $response->assertForbidden();
    }
}
