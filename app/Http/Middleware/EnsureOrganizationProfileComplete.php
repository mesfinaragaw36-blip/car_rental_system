<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOrganizationProfileComplete
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user &&
            $user->role === 'owner' &&
            $user->ownerProfile &&
            $user->ownerProfile->owner_type === 'organization' &&
            ! $user->ownerProfile->profile_completed
        ) {
            // Allow access to the profile page itself
            if ($request->routeIs('owner.profile') || $request->routeIs('owner.profile.update')) {
                return $next($request);
            }

            return redirect()->route('owner.profile')
                ->with('warning', 'Please complete your organization profile to continue.');
        }

        return $next($request);
    }
}
