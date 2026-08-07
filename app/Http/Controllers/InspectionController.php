<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingInspection;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InspectionController extends Controller
{
   public function index(): Response
{
    $prePickupBookings = Booking::with([
        'customer',
        'owner',
        'car',
        'inspection',
    ])
    ->where('status', 'paid')
    ->latest()
    ->get();

    $returnBookings = Booking::with([
        'customer',
        'owner',
        'car',
    ])
    ->where('status', 'returned')
    ->latest('return_date')
    ->get();

    return Inertia::render('inspections', [
        'prePickupBookings' => $prePickupBookings,
        'returnBookings' => $returnBookings,
    ]);
}


    // Pre-pickup inspection page
    public function showPrePickup(Booking $booking): Response
    {
        $booking->load([
            'car',
            'customer',
            'inspection.photos',
        ]);

        return Inertia::render('inspections/pre-pickup/show', [
            'booking' => $booking,
            'inspection' => $booking->inspection,
        ]);
    }


    // Save inspection result
    public function storePrePickup(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'outside_ok' => ['required', 'boolean'],
            'inside_ok' => ['required', 'boolean'],
            'mileage_ok' => ['required', 'boolean'],
            'fuel_ok' => ['required', 'boolean'],

            'comments' => ['nullable', 'string'],

            'outside_ok_photo' => ['required', 'image'],
            'inside_ok_photo' => ['required', 'image'],
            'mileage_ok_photo' => ['required', 'image'],
            'fuel_ok_photo' => ['required', 'image'],
        ]);


        $inspection = BookingInspection::create([
            'booking_id' => $booking->id,
            'inspection_type' => 'pre_pickup',
            'inspector_id' => auth()->id(),

            'outside_ok' => $validated['outside_ok'],
            'inside_ok' => $validated['inside_ok'],
            'mileage_ok' => $validated['mileage_ok'],
            'fuel_ok' => $validated['fuel_ok'],

            'comments' => $validated['comments'] ?? null,

            'status' =>
    $validated['outside_ok']
    && $validated['inside_ok']
    && $validated['mileage_ok']
    && $validated['fuel_ok']
        ? 'approved'
        : 'failed',
        ]);


        foreach ([
            'outside_ok_photo',
            'inside_ok_photo',
            'mileage_ok_photo',
            'fuel_ok_photo',
        ] as $field) {

            $path = $request->file($field)
                ->store('inspection-photos', 'public');

            $inspection->photos()->create([
                'checklist_item' => str_replace('_photo', '', $field),
                'photo_path' => $path,
            ]);
        }


        return redirect()
            ->route('inspections.index')
            ->with('toast', [
                'type' => 'success',
                'message' => 'Pre-pickup inspection completed successfully.',
            ]);
    }


    // Old returned inspection completion
        // Old returned inspection completion
    public function complete(Booking $booking): RedirectResponse
    {
        if ($booking->status !== 'returned') {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Only returned bookings can be marked as inspected.',
            ]);
        }
        $returnInspection = BookingInspection::where('booking_id', $booking->id)
    ->where('inspection_type', 'return')
    ->first();

if (!$returnInspection || $returnInspection->status !== 'approved') {
    return back()->with('toast', [
        'type' => 'error',
        'message' => 'Please complete and approve the return inspection first.',
    ]);
}

        $booking->update([
            'status' => 'completed'
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Booking inspection completed and marked as finished.',
        ]);
    }


    // Pre-pickup inspection list
    public function prePickupIndex(): Response
    {
        $bookings = Booking::with([
            'customer',
            'owner',
            'car',
            'inspection'
        ])
        ->where('status', 'paid')
        ->latest()
        ->get()
        ->map(fn (Booking $booking) => [
            'id' => $booking->id,
            'status' => $booking->status,
            'pickup_date' => $booking->pickup_date->toDateString(),
            'return_date' => $booking->return_date->toDateString(),

            'car' => [
                'brand' => $booking->car->brand,
                'model' => $booking->car->model,
                'plate_number' => $booking->car->plate_number,
            ],

            'inspection_status' => $booking->inspection?->status,
        ]);

        return Inertia::render('inspections/pre-pickup/index', [
            'bookings' => $bookings,
        ]);
    }
}