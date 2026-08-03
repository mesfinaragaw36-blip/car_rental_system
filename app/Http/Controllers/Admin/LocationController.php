<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocationRequest;
use App\Models\Location;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Locations/Index', [
            'locations' => Location::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Locations/Create');
    }

    public function store(StoreLocationRequest $request)
    {
        Location::create($request->validated());

        return redirect()
            ->route('admin.locations.index')
            ->with('success', 'Location created successfully.');
    }

    public function edit(Location $location)
    {
        return Inertia::render('admin/Locations/Edit', [
            'location' => $location,
        ]);
    }

    public function update(StoreLocationRequest $request, Location $location)
    {
        $location->update($request->validated());

        return redirect()
            ->route('admin.locations.index')
            ->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        $location->delete();

        return redirect()
            ->route('admin.locations.index')
            ->with('success', 'Location deleted successfully.');
    }
}
