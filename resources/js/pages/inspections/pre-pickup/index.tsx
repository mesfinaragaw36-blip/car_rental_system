import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    car: {
        brand: string;
        model: string;
        plate_number: string;
    };
    inspection_status?: string | null;
}

interface Props {
    bookings: Booking[];
}

export default function PrePickupInspections({ bookings }: Props) {
    return (
        <>
            <Head title="Pre-Pickup Inspections" />

            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Pre-Pickup Inspections
                    </h1>

                    <p className="text-muted-foreground">
                        Inspect every vehicle before it is handed to the customer.
                    </p>
                </div>

                {bookings.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center">
                            No bookings waiting for inspection.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <Card key={booking.id}>
                                <CardHeader>
                                    <CardTitle>
                                        Booking #{booking.id}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div>
                                        <strong>Vehicle:</strong>{" "}
                                        {booking.car.brand}{" "}
                                        {booking.car.model}
                                    </div>

                                    <div>
                                        <strong>Plate:</strong>{" "}
                                        {booking.car.plate_number}
                                    </div>

                                    <div>
                                        <strong>Pickup:</strong>{" "}
                                        {booking.pickup_date}
                                    </div>

                                    <div>
                                        <strong>Return:</strong>{" "}
                                        {booking.return_date}
                                    </div>

                                    <div>
                                        <strong>Status:</strong>{" "}
                                        {booking.inspection_status ?? "Not inspected"}
                                    </div>

                                    <Button
    onClick={() =>
        router.visit(`/inspections/pre-pickup/${booking.id}`)
    }
>
    Start Inspection
</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}