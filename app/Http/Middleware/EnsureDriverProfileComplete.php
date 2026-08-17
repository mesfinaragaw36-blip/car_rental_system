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

        // No profile yet: force the driver to complete it.
        if (! $user->driverProfile) {
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
            empty($profile->experience_years) ||
            empty($profile->location) ||
            empty($profile->gender) ||
            empty($profile->daily_rate) ||
            empty($profile->license_file_path) ||
            empty($profile->national_id_file_path)
        ) {
            return redirect()
                ->route('driver.profile')
                ->with('toast', [
                    'type' => 'warning',
                    'message' => 'Please complete all required profile fields including license and ID documents.',
                ]);
        }

        // Profile exists but has not been approved by admin yet.
        if ($profile->verification_status !== 'approved') {
            return redirect()
                ->route('driver.profile')
                ->with('toast', [
                    'type' => 'warning',
                    'message' => 'Your driver profile is waiting for admin verification.',
                ]);
        }

        return $next($request);
    }
}
