import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle, XCircle, Search, Ban,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { index as bookingsIndex, approve, reject, cancel, assignDriver, pickedUp, returned } from '@/routes/bookings';

interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    total_price: string;
    need_driver: boolean;
    notes?: string | null;
    customer?: { id: number; name: string; email?: string; phone?: string };
    owner?: { id: number; name: string };
    car: { id: number; brand: string; model: string; year?: number; plate_number?: string };
    payment: { payment_method: string; payment_status: string; paid_at: string | null } | null;
    assigned_driver?: { id: number; name: string } | null;
    driver_assignment?: { driver: { id: number; name: string } | null } | null;
}

interface AvailableDriver { id: number; name: string; phone: string; }

interface Props {
    role: string;
    bookings: { data: Booking[]; links: { url: string | null; label: string; active: boolean }[] };
    availableDrivers?: AvailableDriver[];
    filters?: { status?: string; search?: string };
    stats?: { total: number; pending: number; active: number; completed: number; cancelled: number };
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

export default function Bookings({ role, bookings, availableDrivers = [], filters, stats }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;
    const [searchTerm, setSearchTerm] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [selectedDriver, setSelectedDriver] = useState('');

    const handleAction = (bookingId: number, action: string) => {
        const routeMap: Record<string, any> = {
            approve: () => approve.url({ booking: bookingId }),
            reject: () => reject.url({ booking: bookingId }),
            cancel: () => cancel.url({ booking: bookingId }),
            picked_up: () => pickedUp.url({ booking: bookingId }),
            returned: () => returned.url({ booking: bookingId }),
        };
        router.post(routeMap[action](), {}, { preserveScroll: true });
    };

    const handleAssignDriver = (bookingId: number) => {
        if (!selectedDriver) {
return;
}

        router.post(assignDriver.url({ booking: bookingId }), { driver_id: selectedDriver }, {
            preserveScroll: true,
            onSuccess: () => {
 setAssigningId(null); setSelectedDriver(''); 
},
        });
    };

    const applyFilters = () => {
        router.get(bookingsIndex.url({ query: { search: searchTerm, status: statusFilter } }), {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Bookings" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Bookings</h1>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {(role === 'admin' || role === 'owner') && stats && (
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                        {([
                            ['Total', stats.total],
                            ['Pending', stats.pending],
                            ['Active', stats.active],
                            ['Completed', stats.completed],
                            ['Cancelled', stats.cancelled],
                        ] as const).map(([label, value]) => (
                            <Card key={label}>
                                <CardHeader className="py-3"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
                                <CardContent className="py-2"><p className="text-2xl font-bold">{value}</p></CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <Input
                        placeholder="Search by car or customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                    <Select value={statusFilter} onValueChange={(v) => {
 setStatusFilter(v); 
}}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            {Object.keys(STATUS_STYLES).map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="secondary" onClick={applyFilters}>
                        <Search className="h-4 w-4 mr-1" /> Filter
                    </Button>
                </div>

                {bookings.data.length === 0 ? (
                    <p className="text-muted-foreground">No bookings found.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.data.map((booking) => (
                            <Card key={booking.id}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">
                                                {booking.car.brand} {booking.car.model}
                                                {booking.car.plate_number && <span className="text-sm text-muted-foreground"> ({booking.car.plate_number})</span>}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.customer?.name ?? 'N/A'} &middot; {booking.pickup_date} &rarr; {booking.return_date}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.pickup_location} &rarr; {booking.return_location}
                                            </p>
                                            <p className="text-sm font-medium">ETB {booking.total_price}</p>
                                            {booking.need_driver && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Driver requested</span>}
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[booking.status] ?? 'bg-gray-100'}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {booking.status === 'pending' && (role === 'admin' || role === 'owner') && (
                                                <>
                                                    <Button size="sm" onClick={() => handleAction(booking.id, 'approve')}><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleAction(booking.id, 'reject')}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                                                </>
                                            )}
                                            {booking.status === 'pending' && role === 'customer' && (
                                                <Button size="sm" variant="destructive" onClick={() => handleAction(booking.id, 'cancel')}><Ban className="h-4 w-4 mr-1" /> Cancel</Button>
                                            )}
                                            {booking.status === 'approved' && (role === 'admin' || role === 'owner') && (
                                                <>
                                                    {assigningId === booking.id ? (
                                                        <div className="flex gap-1 items-center">
                                                            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                                                <SelectTrigger className="w-40"><SelectValue placeholder="Select driver" /></SelectTrigger>
                                                                <SelectContent>
                                                                    {availableDrivers.map((d) => (
                                                                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Button size="sm" onClick={() => handleAssignDriver(booking.id)}>Assign</Button>
                                                            <Button size="sm" variant="ghost" onClick={() => {
 setAssigningId(null); setSelectedDriver(''); 
}}>Cancel</Button>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="outline" onClick={() => setAssigningId(booking.id)}>Assign Driver</Button>
                                                    )}
                                                </>
                                            )}
                                            {booking.status === 'paid' && (role === 'admin' || role === 'owner') && (
                                                <Button size="sm" onClick={() => handleAction(booking.id, 'picked_up')}>Mark Picked Up</Button>
                                            )}
                                            {booking.status === 'picked_up' && (role === 'admin' || role === 'owner') && (
                                                <Button size="sm" onClick={() => handleAction(booking.id, 'returned')}>Mark Returned</Button>
                                            )}
                                            {role === 'customer' && booking.status === 'approved' && booking.payment?.payment_status === 'pending' && (
                                                <Button size="sm" asChild>
                                                    <Link href={`/bookings/${booking.id}/payment`}>Pay Now</Link>
                                                </Button>
                                            )}
                                            {role === 'customer' && booking.payment?.payment_status === 'completed' && (
                                                <span className="text-green-600 text-sm font-medium">Paid</span>
                                            )}
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

Bookings.layout = {
    breadcrumbs: [{ title: 'Bookings', href: '/bookings' }],
};
