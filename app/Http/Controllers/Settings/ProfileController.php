<?php
namespace App\Http\Controllers\Settings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\DriverProfile;
use App\Models\OwnerProfile;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profile = null;
        if ($user->role === 'owner') {
            $profile = $user->ownerProfile?->toArray();
        } elseif ($user->hasDriverPermission()) {
            $profile = $user->driverProfile?->toArray();
        }
        if ($profile !== null) {
            $profile['average_rating'] = round($user->reviews()->avg('rating') ?? 0, 1);
            $profile['review_count'] = $user->reviews()->count();
        }
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => $profile,
        ]);
    }
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $user->fill(Arr::only($validated, ['name', 'email', 'phone', 'address']));
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();
        if ($user->role === 'owner') {
            OwnerProfile::updateOrCreate(
                ['user_id' => $user->id],
                Arr::only($validated, ['business_name', 'national_id', 'trade_license_number'])
            );
        }
        if ($user->hasDriverPermission()) {
            $driverProfileData = Arr::only($validated, ['license_number', 'license_type', 'experience_years', 'daily_rate', 'location', 'availability']);
            if ($request->hasFile('license_file')) {
                $driverProfileData['license_file_path'] = $request->file('license_file')->store('driver_documents', 'public');
            }
            $driverProfileData['verification_status'] = 'pending';
            DriverProfile::updateOrCreate(['user_id' => $user->id], $driverProfileData);
        }
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);
        return to_route('profile.edit');
    }
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}