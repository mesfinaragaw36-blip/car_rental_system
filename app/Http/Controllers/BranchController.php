<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
  public function index()
{
    $branches = Branch::all();

    return Inertia::render('Branches', [
        'branches' => $branches,
        'totalBranches' => $branches->count(),
        'activeBranches' => $branches->where('status', true)->count(),
        'inactiveBranches' => $branches->where('status', false)->count(),
    ]);
}
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'required|boolean',
        ]);

        Branch::create($validated);

        return redirect()->back();
    }


    public function destroy(Branch $branch)
    {
        $branch->delete();

        return redirect()->back();
    }


    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'status' => 'required|boolean',
        ]);

        $branch->update($validated);

        return redirect()->back();
    }
}
