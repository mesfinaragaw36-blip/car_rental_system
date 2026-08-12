<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::drivers()
            ->with('driverProfile')
            ->withCount('driverAssignments');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $drivers = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/drivers', [
            'drivers' => $drivers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function suspend(User $driver): RedirectResponse
    {
        abort_unless($driver->hasDriverPermission(), 404);
        $driver->update(['status' => 'suspended']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Driver suspended.']);
    }

    public function activate(User $driver): RedirectResponse
    {
        abort_unless($driver->hasDriverPermission(), 404);
        $driver->update(['status' => 'active']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Driver activated.']);
    }
}
