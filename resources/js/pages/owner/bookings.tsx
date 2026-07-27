import { Head } from '@inertiajs/react';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
}

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
}

interface AssignedDriver {
    id: number;
    name: string;
}

interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    total_price: string;
    need_driver: boolean;
    notes: string | null;
    customer: Customer;
    car: Car;
    assigned_driver: AssignedDriver | null;
}

interface AvailableDriver {
    id: number;
    name: string;
    phone: string;
}

interface Props {
    bookings: Booking[];
    availableDrivers: AvailableDriver[];
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    picked_up: 'bg-purple-100 text-purple-800',
    returned: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function OwnerBookings({ bookings = [], availableDrivers = [] }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedDrivers, setSelectedDrivers] = useState<Record<number, string>>({});

    function handleApprove(bookingId: number): void {
        setProcessingId(bookingId);
        router.post(
            `/owner/bookings/${bookingId}/approve`,
            {},
            { onFinish: () => setProcessingId(null) },
        );
    }

    function handleReject(bookingId: number): void {
        if (!confirm('Are you sure you want to reject this booking?')) {
            return;
        }
        setProcessingId(bookingId);
        router.post(
            `/owner/bookings/${bookingId}/reject`,
            {},
            { onFinish: () => setProcessingId(null) },
        );
    }

    function handleAssignDriver(bookingId: number): void {
        const driverId = selectedDrivers[bookingId];
        if (!driverId) {
            return;
        }
        setProcessingId(bookingId);
        router.post(
            `/owner/bookings/${bookingId}/assign-driver`,
            { driver_id: driverId },
            { onFinish: () => setProcessingId(null) },
        );
    }

    return (
        <>
            <Head title="Booking Requests" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Booking Requests</h1>
                </div>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>All Bookings</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {bookings.length === 0 ? (
                            <p className="text-muted-foreground">No booking requests yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-lg border p-4 space-y-3"
                                    >
                                        {/* Top row: car + status */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold">
                                                    {booking.car.brand} {booking.car.model}{' '}
                                                    <span className="text-muted-foreground font-normal">
                                                        ({booking.car.year})
                                                    </span>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.car.plate_number}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    STATUS_STYLES[booking.status] ??
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>

                                        {/* Customer info */}
                                        <div className="text-sm space-y-0.5">
                                            <p>
                                                <span className="font-medium">Customer: </span>
                                                {booking.customer.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {booking.customer.email} &middot;{' '}
                                                {booking.customer.phone}
                                            </p>
                                        </div>

                                        {/* Dates + price */}
                                        <div className="text-sm space-y-0.5">
                                            <p>
                                                <span className="font-medium">Pickup: </span>
                                                {booking.pickup_date} &mdash;{' '}
                                                {booking.pickup_location}
                                            </p>
                                            <p>
                                                <span className="font-medium">Return: </span>
                                                {booking.return_date} &mdash;{' '}
                                                {booking.return_location}
                                            </p>
                                            <p>
                                                <span className="font-medium">Total: </span>
                                                ETB {booking.total_price}
                                            </p>
                                        </div>

                                        {/* Driver requested badge */}
                                        {booking.need_driver && (
                                            <p className="text-xs font-medium text-blue-700 bg-blue-50 inline-block rounded-full px-2 py-0.5">
                                                Driver requested
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        disabled={processingId === booking.id}
                                                        onClick={() => handleApprove(booking.id)}
                                                    >
                                                        {processingId === booking.id
                                                            ? 'Processing…'
                                                            : 'Approve'}
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={processingId === booking.id}
                                                        onClick={() => handleReject(booking.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                            {/* Assign driver — only when driver was requested */}
                                            {booking.need_driver && (
                                                <div className="flex items-center gap-2 w-full mt-1">
                                                    {booking.assigned_driver ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            Driver assigned:{' '}
                                                            <span className="font-medium text-foreground">
                                                                {booking.assigned_driver.name}
                                                            </span>
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <select
                                                                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                                value={selectedDrivers[booking.id] ?? ''}
                                                                onChange={(e) =>
                                                                    setSelectedDrivers((prev) => ({
                                                                        ...prev,
                                                                        [booking.id]: e.target.value,
                                                                    }))
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select a driver
                                                                </option>
                                                                {availableDrivers.map((driver) => (
                                                                    <option
                                                                        key={driver.id}
                                                                        value={driver.id}
                                                                    >
                                                                        {driver.name} &middot;{' '}
                                                                        {driver.phone}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={
                                                                    processingId === booking.id ||
                                                                    !selectedDrivers[booking.id]
                                                                }
                                                                onClick={() =>
                                                                    handleAssignDriver(booking.id)
                                                                }
                                                            >
                                                                Assign Driver
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {booking.notes && (
                                            <p className="text-sm text-muted-foreground border-t pt-2">
                                                <span className="font-medium">Notes: </span>
                                                {booking.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

OwnerBookings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/owner/dashboard' },
        { title: 'Bookings', href: '/owner/bookings' },
    ],
};
