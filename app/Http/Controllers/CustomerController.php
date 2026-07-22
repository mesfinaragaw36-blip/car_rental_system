<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('Customers', [
            'customers' => Customer::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required',
            'phone' => 'required',
            'email' => 'nullable|email',
            'license_number' => 'required|unique:customers',
            'license_expiry' => 'required|date',
            'address' => 'nullable',
            'status' => 'required',
        ]);

        Customer::create($validated);

        return redirect()->back();
    }
    public function destroy(Customer $customer)
{
    $customer->delete();

    return redirect()->back();
}
}
