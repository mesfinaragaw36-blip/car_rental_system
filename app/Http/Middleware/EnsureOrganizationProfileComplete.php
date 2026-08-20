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
            ! $user->ownerProfile->profile_completed &&
            $user->ownerProfile->verification_status !== 'approved'
        ) {
            if ($request->routeIs('profile.edit') || $request->routeIs('profile.update')) {
                return $next($request);
            }

            return redirect()->route('profile.edit')
                ->with('warning', 'Please complete your profile to continue.');
        }

        return $next($request);
    }
}
