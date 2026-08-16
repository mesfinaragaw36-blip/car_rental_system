<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingDriver;
use App\Models\CarTypeRequest;
use App\Models\Notification;
use App\Models\OwnerPayout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->paginate(15)
            ->through(fn (Notification $notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'related_type' => $notification->related_type,
                'related_id' => $notification->related_id,
                'url' => $notification->url,
                'read_at' => $notification->read_at?->toDateTimeString(),
                'created_at' => $notification->created_at->diffForHumans(),
                'created_at_iso' => $notification->created_at->toIso8601String(),
            ]);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unread_count' => $request->user()->notifications()->whereNull('read_at')->count(),
        ]);
    }

    private function notificationUrl(Notification $notification): ?string
    {
        if (! $notification->related_type || ! $notification->related_id) {
            return null;
        }

        return match ($notification->related_type) {
            Booking::class => route('bookings.show', $notification->related_id),

            OwnerPayout::class => route('admin.transactions.index'),

            BookingDriver::class => route('assignments.index'),

            CarTypeRequest::class => route('car-type-requests.show', $notification->related_id),

            default => null,
        };
    }

    public function markRead(Request $request, Notification $notification): RedirectResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->update(['read_at' => now()]);

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->notifications()->whereNull('read_at')->update([
            'read_at' => now(),
        ]);

        return back();
    }
}
