import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Car, User, CalendarDays, MapPin, CreditCard, CircleDollarSign, UserCircle, Files, CheckCircle, XCircle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { approve, reject, cancel, pickedUp, returned, complete} from '@/routes/bookings';

interface BookingDetails {
    id: number; status: string; pickup_date: string; return_date: string;
    pickup_location: string; return_location: string; total_price: string;
    need_driver: boolean; notes: string | null; days: number; daily_rate: string;
    customer: { id: number; name: string; phone: string; email: string } | null;
    owner: { id: number; name: string; phone: string } | null;
    car: { id: number; brand: string; model: string; year: number; plate_number: string };
    payment: {id: number; payment_method: string; payment_status: string; paid_at: string | null } | null;
    driver: { id: number; name: string; phone: string } | null;
    driver_status: string | null;
    picked_up_at: string | null;
    returned_at: string | null;
}

interface Props { booking: BookingDetails; role: string; }

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800', paid: 'bg-green-100 text-green-800',
    picked_up: 'bg-purple-100 text-purple-800', returned: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800', cancelled: 'bg-gray-100 text-gray-800',
};

export default function BookingDetails({ booking, role }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    const handleAction = (action: string) => {
        const routeMap: Record<string, any> = { approve, reject, cancel, picked_up: pickedUp, returned, complete };
        router.post(routeMap[action].url({ booking: booking.id }), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Booking Details" />
            <div className="p-6 space-y-6 max-w-3xl mx-auto">
                <Link href="/bookings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Bookings
                </Link>

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Booking #{booking.id}</h1>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_STYLES[booking.status] ?? 'bg-gray-100'}`}>{booking.status}</span>
                </div>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{toast.message}</div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" /> Vehicle</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="font-semibold text-lg">{booking.car.brand} {booking.car.model} ({booking.car.year})</p>
                            <p className="text-muted-foreground">Plate: {booking.car.plate_number}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5" /> Pricing</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Daily Rate</span><span>ETB {booking.daily_rate}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Days</span><span>{booking.days}</span></div>
                            <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total</span><span className="text-xl font-bold text-primary">ETB {booking.total_price}</span></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Dates</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><span className="text-muted-foreground">Pickup: </span>{booking.pickup_date}</p>
                            <p><span className="text-muted-foreground">Return: </span>{booking.return_date}</p>

                            {booking.picked_up_at && (
                                <p>
                                    <span className="text-muted-foreground">Picked up at: </span>
                                    {booking.picked_up_at}
                                </p>
                            )}

                            {booking.returned_at && (
                                <p>
                                    <span className="text-muted-foreground">Returned at: </span>
                                    {booking.returned_at}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Locations</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><span className="text-muted-foreground">Pickup: </span>{booking.pickup_location}</p>
                            <p><span className="text-muted-foreground">Return: </span>{booking.return_location}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Customer</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {booking.customer ? (
                                <><p className="font-medium">{booking.customer.name}</p><p className="text-muted-foreground">{booking.customer.phone} &middot; {booking.customer.email}</p></>
                            ) : <p className="text-muted-foreground">N/A</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5" /> Owner</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {booking.owner ? (
                                <><p className="font-medium">{booking.owner.name}</p><p className="text-muted-foreground">{booking.owner.phone}</p></>
                            ) : <p className="text-muted-foreground">N/A</p>}
                        </CardContent>
                    </Card>

                                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" /> Payment
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-2 text-sm">
                                            {booking.payment ? (
                                                <>
                                                    <p>Method: {booking.payment.payment_method}</p>

                                                    <p>Status: {booking.payment.payment_status}</p>

                                                    <p className="text-muted-foreground">
                                                        Paid: {booking.payment.paid_at ?? 'N/A'}
                                                    </p>

                                                    {booking.payment.payment_status === 'paid' && (
                                                        <Button asChild className="mt-3">
                                                            <Link href={`/payments/${booking.payment.id}/receipt`}>
                                                                View Receipt
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-muted-foreground">Not paid yet</p>
                                            )}
                                        </CardContent>
                                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Files className="h-5 w-5" /> Driver</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {booking.need_driver ? (
                                booking.driver ? (
                                    <><p className="font-medium">{booking.driver.name}</p><p className="text-muted-foreground">{booking.driver.phone}</p></>
                                ) : <p className="text-muted-foreground">No driver assigned yet</p>
                            ) : <p className="text-muted-foreground">Not requested</p>}
                        </CardContent>
                    </Card>
                </div>

                {booking.notes && (
                    <Card>
                        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
                        <CardContent><p className="text-sm">{booking.notes}</p></CardContent>
                    </Card>
                )}

                <div className="flex flex-wrap gap-2">
                    {booking.status === 'pending' && (role === 'admin' || role === 'owner') && (
                        <><Button onClick={() => handleAction('approve')}><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
                        <Button variant="destructive" onClick={() => handleAction('reject')}><XCircle className="h-4 w-4 mr-1" /> Reject</Button></>
                    )}
                    {booking.status === 'pending' && role === 'customer' && (
                        <Button variant="destructive" onClick={() => handleAction('cancel')}><Ban className="h-4 w-4 mr-1" /> Cancel</Button>
                    )}
                    {booking.status === 'paid' && (role === 'admin' || role === 'owner') && (
                        <Button onClick={() => handleAction('picked_up')}>Mark Picked Up</Button>
                    )}
                    {booking.status === 'picked_up' && (role === 'admin' || role === 'owner') && (
                        <Button onClick={() => handleAction('returned')}>Mark Returned</Button>
                    )}
                    {booking.status === 'returned' && (role === 'admin' || role === 'owner') && (
                        <Button onClick={() => handleAction('complete')}>
                            Mark Completed
                        </Button>
                    )}
                    {role === 'customer' && booking.status === 'approved' && !booking.payment && (
                        !booking.need_driver || (booking.driver_status === 'assigned' || booking.driver_status === 'accepted')
                    ) && (
                        <Button asChild><Link href={`/bookings/${booking.id}/payment`}>Pay Now</Link></Button>
                    )}
                </div>
            </div>
        </>
    );
}

BookingDetails.layout = {
    breadcrumbs: [{ title: 'Bookings', href: '/bookings' }, { title: 'Booking Details', href: '' }],
};
