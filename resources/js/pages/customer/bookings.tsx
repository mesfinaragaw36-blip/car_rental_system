import { Head, Link, router, usePage } from '@inertiajs/react';
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

interface Payment {
    payment_method: string;
    payment_status: string;
    paid_at: string | null;
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
    payment: Payment | null;
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

export default function Bookings({ bookings }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    function handleCancel(bookingId: number) {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        router.post(`/customer/bookings/${bookingId}/cancel`);
    }

    return (
        <>
            <Head title="My Bookings" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Bookings</h1>

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
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[booking.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                    {booking.status.replace('_', ' ')}
                                                </span>
                                                {booking.payment && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Paid via {booking.payment.payment_method}
                                                    </span>
                                                )}
                                            </div>
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

                                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                                        {booking.status === 'approved' && !booking.payment && (
                                            <Link href={`/customer/bookings/${booking.id}/payment`}>
                                                <Button size="sm">Pay Now</Button>
                                            </Link>
                                        )}

                                        {(booking.status === 'pending' || booking.status === 'approved') && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleCancel(booking.id)}
                                            >
                                                Cancel Booking
                                            </Button>
                                        )}
                                    </div>
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
