import { Head, router, usePage } from '@inertiajs/react';
import { Check, Car, CalendarDays, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    total_price: string;
    car: { brand: string; model: string; year: number; plate_number: string };
    customer: { id: number; name: string; phone: string } | null;
    owner: { id: number; name: string; phone: string } | null;
}

interface Props {
    prePickupBookings: Booking[];
    returnBookings: Booking[];
}

export default function Inspections({
    prePickupBookings,
    returnBookings,
}: Props) {
    const { props } = usePage<{ flash?: { toast?: { type: 'success' | 'error'; message: string } } }>();
    const toast = props.flash?.toast;

    const handleComplete = (bookingId: number) => {
        router.post(inspections.complete.url({ booking: bookingId }), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Booking Inspections" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Booking Inspections</h1>
                        <p className="mt-2 text-muted-foreground">Review returned bookings and mark them as completed after inspection.</p>
                    </div>
                </div>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}
                    <Card>
    <CardHeader>
        <CardTitle>Pre-Pickup Inspections</CardTitle>
    </CardHeader>

    <CardContent>
        {prePickupBookings.length === 0 ? (
            <p className="text-muted-foreground">
                No paid bookings waiting for inspection.
            </p>
        ) : (
            <div className="space-y-3">
                {prePickupBookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                    >
                        <div>
                            <p className="font-semibold">
                                Booking #{booking.id}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                {booking.car.brand} {booking.car.model}
                            </p>

                            <p className="text-sm">
                                Status: {booking.status}
                            </p>
                        </div>

                        <Button
                            onClick={() =>
                                router.visit(
                                    `/inspections/pre-pickup/${booking.id}`
                                )
                            }
                        >
                            Start Inspection
                        </Button>
                    </div>
                ))}
            </div>
        )}
    </CardContent>
</Card>
                {returnBookings.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Check className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-4 text-lg font-semibold">No bookings awaiting inspection.</p>
                            <p className="mt-2 text-sm text-muted-foreground">Returned bookings will appear here once they are ready for final inspection.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {returnBookings.map((booking) => (
                            <Card key={booking.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-3">
                                        <span>Booking #{booking.id}</span>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{booking.status}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Vehicle</p>
                                            <p className="font-medium">{booking.car.brand} {booking.car.model} ({booking.car.year})</p>
                                            <p className="text-sm text-muted-foreground">Plate: {booking.car.plate_number}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Dates</p>
                                            <p>{booking.pickup_date} → {booking.return_date}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CalendarDays className="h-4 w-4" />
                                            <span>{booking.pickup_location} → {booking.return_location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>ETB {booking.total_price}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Car className="h-4 w-4" />
                                            <span>{booking.owner?.name ?? 'Unknown owner'}</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Customer</p>
                                            <p className="font-medium">{booking.customer?.name ?? 'N/A'}</p>
                                            <p className="text-sm text-muted-foreground">{booking.customer?.phone ?? 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center justify-end">
                                           <Button
    onClick={() =>
        router.visit(`/inspections/pre-pickup/${booking.id}`)
    }
>
    Start Inspection
</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Inspections.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inspections', href: '/inspections' },
    ],
};
