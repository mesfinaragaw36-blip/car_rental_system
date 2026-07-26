import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Booking {
    id: number;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    need_driver: boolean;
    total_price: string;
    status: string;
    car: {
        brand: string;
        model: string;
    };
}

interface Props {
    bookings: Booking[];
}

function statusBadgeClass(status: string) {
    switch (status) {
        case 'approved':
        case 'paid':
        case 'picked_up':
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'rejected':
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
}

export default function MyBookings({ bookings = [] }: Props) {
    return (
        <>
            <Head title="My Bookings" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Bookings</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking History</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {bookings.length === 0 ? (
                            <p className="text-muted-foreground">
                                You have no bookings yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">
                                                    {booking.car.brand} {booking.car.model}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.pickup_date} &rarr; {booking.return_date}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.pickup_location} &rarr; {booking.return_location}
                                                </p>
                                                {booking.need_driver && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Driver requested
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-right space-y-1">
                                                <span
                                                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                                                        booking.status
                                                    )}`}
                                                >
                                                    {booking.status}
                                                </span>
                                                <p className="font-bold">${booking.total_price}</p>
                                            </div>
                                        </div>
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