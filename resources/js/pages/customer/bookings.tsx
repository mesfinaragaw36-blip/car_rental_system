import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Car {
    id: number;
    brand: string;
    model: string;
}

interface Driver {
    id: number;
    name: string;
}

interface Booking {
    id: number;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    need_driver: boolean;
    total_price: string;
    status: string;
    car: Car;
    driver_assignment: {
        driver: Driver | null;
    } | null;
}

interface Props {
    bookings: {
        data: Booking[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function Bookings({ bookings }: Props) {
    return (
        <>
            <Head title="My Bookings" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Bookings</h1>

                {bookings.data.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">You have no bookings yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {bookings.data.map((booking) => (
                            <Card key={booking.id}>
                                <CardContent className="space-y-4 p-6">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold">{booking.car.brand} {booking.car.model}</h2>
                                            <p className="text-sm text-muted-foreground">Status: {booking.status}</p>
                                        </div>
                                        <p className="font-semibold">{booking.total_price} ETB</p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pickup Date</p>
                                            <p>{booking.pickup_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Return Date</p>
                                            <p>{booking.return_date}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Driver Required</p>
                                            <p>{booking.need_driver ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pickup Location</p>
                                            <p>{booking.pickup_location}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Return Location</p>
                                            <p>{booking.return_location}</p>
                                        </div>
                                    </div>

                                    {booking.driver_assignment?.driver && (
                                        <div className="rounded-lg border border-border bg-muted p-4">
                                            <p className="text-sm text-muted-foreground">Assigned Driver</p>
                                            <p>{booking.driver_assignment.driver.name}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {bookings.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {bookings.links.map((link) => (
                            <Button
                                key={link.label}
                                variant={link.active ? 'secondary' : 'outline'}
                                asChild
                            >
                                <a href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
