<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('owner_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('car_id')
                ->constrained('cars')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->dateTime('pickup_date');
            $table->dateTime('return_date');
            $table->string('pickup_location');
            $table->string('return_location');
            $table->boolean('need_driver')->default(false);
            $table->decimal('total_price', 10, 2);
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->enum('status', [
                'pending', 'approved', 'rejected', 'paid',
                'picked_up', 'returned', 'completed', 'cancelled',
            ])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['car_id', 'pickup_date', 'return_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
