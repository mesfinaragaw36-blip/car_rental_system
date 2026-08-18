<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDriverProfileComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Only apply this to drivers.
        if ($user?->role !== 'driver') {
            return $next($request);
        }

        // Always allow the driver to access the profile page.
        if ($request->routeIs('driver.profile')) {
            return $next($request);
        }

        // Allow viewing assignments even if profile is incomplete,
        // but don't allow accepting assignments.
        $allowViewOnly = $request->routeIs('driver.assignments.index') || 
                         $request->routeIs('driver.trip-history');

        // No profile yet: force the driver to complete it (unless just viewing).
        if (! $user->driverProfile) {
            if ($allowViewOnly) {
                return $next($request);
            }

            return redirect()
                ->route('driver.profile')
                ->with('toast', [
                    'type' => 'warning',
                    'message' => 'Please complete your driver profile before continuing.',
                ]);
        }

        $profile = $user->driverProfile;

        // Profile exists but is incomplete (missing required fields).
        if (
            empty($profile->license_number) ||
            empty($profile->license_type) ||
            ! isset($profile->experience_years) ||
            $profile->experience_years < 0 ||
            empty($profile->location) ||
            empty($profile->gender) ||
            ! isset($profile->daily_rate) ||
            $profile->daily_rate <= 0 ||
            empty($profile->license_file_path)
        ) {
            if ($allowViewOnly) {
                return $next($request);
            }

            return redirect()
                ->route('driver.profile')
                ->with('toast', [
                    'type' => 'warning',
                    'message' => 'Please complete all required profile fields including driver license document.',
                ]);
        }

        // Profile exists but has not been approved by admin yet.
        // Allow viewing assignments, but don't allow accepting them.
        if ($profile->verification_status !== 'approved') {
            if ($allowViewOnly) {
                return $next($request);
            }

            return redirect()
                ->route('driver.profile')
                ->with('toast', [
                    'type' => 'warning',
                    'message' => 'Your driver profile is waiting for admin verification. You can view assignments but cannot accept them until approved.',
                ]);
        }

        return $next($request);
    }
}
