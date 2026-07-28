<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CarTypeName;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CarTypeNameController extends Controller
{
    public function index(): Response
    {
        $items = CarTypeName::orderBy('sort_order')->orderBy('name')->get();

        return Inertia::render('admin/car-types/type-names', ['items' => $items]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:car_type_names,name',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        CarTypeName::create($validated);

        return redirect()->route('admin.car-types.type-names')->with('toast', ['type' => 'success', 'message' => 'Type name created.']);
    }

    public function update(Request $request, CarTypeName $carTypeName): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:car_type_names,name,'.$carTypeName->id,
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        $carTypeName->update($validated);

        return redirect()->route('admin.car-types.type-names')->with('toast', ['type' => 'success', 'message' => 'Type name updated.']);
    }

    public function destroy(CarTypeName $carTypeName): RedirectResponse
    {
        if ($carTypeName->cars()->count() > 0) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Cannot delete type with assigned vehicles.']);
        }
        $carTypeName->delete();

        return redirect()->route('admin.car-types.type-names')->with('toast', ['type' => 'success', 'message' => 'Type name deleted.']);
    }
}
