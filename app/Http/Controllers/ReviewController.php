<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Booking $booking): RedirectResponse
    {
        $user = $request->user();

        if (! in_array($booking->status, ['returned', 'completed'], true)) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Reviews can only be submitted after a completed booking.',
            ]);
        }

        $validated = $request->validate([
            'reviewable_type' => ['required', 'in:car,user'],
            'reviewable_id' => ['required', 'integer'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'review_text' => ['nullable', 'string', 'max:1000'],
        ]);

        $reviewableType = $validated['reviewable_type'];
        $reviewableId = $validated['reviewable_id'];
        $rating = $validated['rating'];
        $reviewText = $validated['review_text'];

        if ($user->role === 'customer') {
            if ($booking->customer_id !== $user->id) {
                abort(403);
            }

            if ($reviewableType === 'car') {
                if ($booking->car_id !== $reviewableId) {
                    abort(403);
                }
            } elseif ($reviewableType === 'user') {
                if ($booking->owner_id === $reviewableId) {
                    // customer rating owner
                } elseif ($booking->driverAssignment?->driver_id === $reviewableId) {
                    // customer rating driver
                } else {
                    abort(403);
                }
            }
        } elseif ($user->role === 'owner') {
            if ($booking->owner_id !== $user->id) {
                abort(403);
            }

            if ($reviewableType !== 'user' || $reviewableId !== $booking->customer_id) {
                abort(403);
            }
        } elseif ($user->role === 'driver') {
            if ($booking->driverAssignment?->driver_id !== $user->id) {
                abort(403);
            }

            if ($reviewableType !== 'user' || $reviewableId !== $booking->customer_id) {
                abort(403);
            }
        } else {
            abort(403);
        }

        $reviewableClass = $reviewableType === 'car' ? Car::class : User::class;

        if (Review::where([
            'booking_id' => $booking->id,
            'reviewer_id' => $user->id,
            'reviewable_type' => $reviewableClass,
            'reviewable_id' => $reviewableId,
        ])->exists()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'You have already submitted this review for this booking.',
            ]);
        }

        Review::create([
            'booking_id' => $booking->id,
            'reviewer_id' => $user->id,
            'reviewable_type' => $reviewableClass,
            'reviewable_id' => $reviewableId,
            'rating' => $rating,
            'review_text' => $reviewText,
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Review submitted successfully.',
        ]);
    }
}
