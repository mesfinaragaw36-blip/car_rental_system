<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Car;
use App\Models\CarAvailablePeriod;
use App\Models\CarImage;
use App\Models\OwnerProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DemoLateReturnSeeder extends Seeder
{
    use WithoutModelEvents;

    private const PASSWORD = 'password';

    /**
     * Seed demo users, vehicles and bookings so the late-return flow can be
     * presented entirely through the UI. Safe to re-run.
     */
    public function run(): void
    {
        $admin = $this->demoUser('demo.admin@carrental.com', 'Demo Admin', 'admin');
        $owner = $this->demoUser('demo.owner@carrental.com', 'Demo Owner', 'owner');
        $customer = $this->demoUser('demo.customer@carrental.com', 'Demo Customer', 'customer');

        OwnerProfile::updateOrCreate(
            ['user_id' => $owner->id],
            [
                'business_name' => 'Demo Fleet PLC',
                'national_id' => 'DEMO-OWNER-001',
                'trade_license_number' => 'TRADE-DEMO-001',
                'verification_status' => 'approved',
                'verified_at' => now(),
            ]
        );

        $overdueCar = $this->demoCar('DEMO-1001', 'Toyota', 'Corolla', 2019, 'Sedan', 2200, 'fleet-sedan.png');
        $onTimeCar = $this->demoCar('DEMO-1002', 'Toyota', 'RAV4', 2021, 'SUV', 3200, 'fleet-suv.png');
        $pickupCar = $this->demoCar('DEMO-1003', 'Suzuki', 'Swift', 2022, 'Hatchback', 1800, 'fleet-luxury.png');

        $this->makeAvailable($overdueCar);
        $this->makeAvailable($onTimeCar);
        $this->makeAvailable($pickupCar);

        $demoBookingIds = Booking::whereIn('car_id', [$overdueCar->id, $onTimeCar->id, $pickupCar->id])->pluck('id');

        DB::table('booking_drivers')
            ->whereIn('booking_id', $demoBookingIds)
            ->delete();

        DB::table('payments')
            ->whereIn('booking_id', $demoBookingIds)
            ->delete();

        DB::table('refunds')
            ->whereIn('booking_id', $demoBookingIds)
            ->delete();

        DB::table('owner_payouts')
            ->whereIn('booking_id', $demoBookingIds)
            ->delete();

        Booking::whereIn('id', $demoBookingIds)->delete();

        $this->overdueBooking($customer, $owner, $overdueCar);
        $this->onTimeBooking($customer, $owner, $onTimeCar);
        $this->pickupQueueBooking($customer, $owner, $pickupCar);

        $this->command?->info(
            "Demo late-return data ready.\n".
            "  Admin:    demo.admin@carrental.com / password\n".
            "  Owner:    demo.owner@carrental.com / password\n".
            "  Customer: demo.customer@carrental.com / password\n".
            'Log in as admin, open /inspections and check the Return tab.'
        );
    }

    private function demoUser(string $email, string $name, string $role): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => fake()->unique()->numerify('09########'),
                'address' => 'Addis Ababa',
                'role' => $role,
                'status' => 'active',
                'password' => Hash::make(self::PASSWORD),
            ]
        );
    }

    private function demoCar(string $plate, string $brand, string $model, int $year, string $category, float $dailyPrice, string $imageFile): Car
    {
        $car = Car::updateOrCreate(
            ['plate_number' => $plate],
            [
                'owner_id' => User::where('email', 'demo.owner@carrental.com')->value('id'),
                'brand' => $brand,
                'model' => $model,
                'year' => $year,
                'category' => $category,
                'color' => 'Silver',
                'fuel_type' => 'Petrol',
                'transmission' => 'Automatic',
                'engine_size' => '1.8L',
                'mileage' => 25000,
                'seats' => 5,
                'daily_price' => $dailyPrice,
                'description' => 'Demo vehicle for the late-return presentation.',
                'approval_status' => 'approved',
                'availability_status' => 'available',
            ]
        );

        $this->attachDemoImage($car, $imageFile);

        return $car;
    }

    private function attachDemoImage(Car $car, string $imageFile): void
    {
        $source = public_path("images/{$imageFile}");

        if (! is_file($source)) {
            return;
        }

        $path = 'demo/'.$imageFile;
        Storage::disk('public')->put($path, file_get_contents($source));

        CarImage::updateOrCreate(
            ['car_id' => $car->id],
            [
                'image_path' => $path,
                'is_primary' => true,
            ]
        );
    }

    private function makeAvailable(Car $car): void
    {
        CarAvailablePeriod::where('car_id', $car->id)->delete();

        CarAvailablePeriod::create([
            'car_id' => $car->id,
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->addMonths(6)->toDateString(),
        ]);
    }

    private function overdueBooking(User $customer, User $owner, Car $car): Booking
    {
        return Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(7)->toDateString(),
            'return_date' => now()->subDays(2)->toDateString(),
            'pickup_location' => 'Bole Branch',
            'return_location' => 'Bole Branch',
            'picked_up_at' => now()->subDays(7),
            'need_driver' => false,
            'total_price' => 13200.00,
            'deposit_amount' => 1320.00,
            'deposit_paid_at' => now()->subDays(9),
            'security_deposit_amount' => 2200.00,
            'balance_paid_at' => now()->subDays(7),
            'security_deposit_paid_at' => now()->subDays(7),
            'car_delivery_status' => Booking::CAR_DELIVERY_ARRIVED,
            'car_delivery_confirmed_at' => now()->subDays(7),
            'return_arrival_status' => Booking::RETURN_ARRIVAL_PENDING,
            'status' => Booking::STATUS_PICKED_UP,
        ]);
    }

    private function onTimeBooking(User $customer, User $owner, Car $car): Booking
    {
        return Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->subDays(2)->toDateString(),
            'return_date' => now()->addDays(2)->toDateString(),
            'pickup_location' => 'Piassa Branch',
            'return_location' => 'Piassa Branch',
            'picked_up_at' => now()->subDays(2),
            'need_driver' => false,
            'total_price' => 12800.00,
            'deposit_amount' => 1280.00,
            'deposit_paid_at' => now()->subDays(4),
            'security_deposit_amount' => 3200.00,
            'balance_paid_at' => now()->subDays(2),
            'security_deposit_paid_at' => now()->subDays(2),
            'car_delivery_status' => Booking::CAR_DELIVERY_ARRIVED,
            'car_delivery_confirmed_at' => now()->subDays(2),
            'return_arrival_status' => Booking::RETURN_ARRIVAL_PENDING,
            'status' => Booking::STATUS_PICKED_UP,
        ]);
    }

    private function pickupQueueBooking(User $customer, User $owner, Car $car): Booking
    {
        return Booking::create([
            'customer_id' => $customer->id,
            'owner_id' => $owner->id,
            'car_id' => $car->id,
            'pickup_date' => now()->addDay()->toDateString(),
            'return_date' => now()->addDays(4)->toDateString(),
            'pickup_location' => 'Mexico Branch',
            'return_location' => 'Mexico Branch',
            'need_driver' => false,
            'total_price' => 5400.00,
            'deposit_amount' => 540.00,
            'deposit_paid_at' => now(),
            'security_deposit_amount' => 1800.00,
            'car_delivery_status' => Booking::CAR_DELIVERY_PENDING,
            'return_arrival_status' => Booking::RETURN_ARRIVAL_PENDING,
            'status' => Booking::STATUS_DEPOSIT_PAID,
        ]);
    }
}
