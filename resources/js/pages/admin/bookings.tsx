import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, CheckCircle, XCircle, Search, Ban } from 'lucide-react';
import type { Auth } from '@/types';

interface Payment { payment_status: string; amount: string; }
interface Car { brand: string; model: string; }
interface User { name: string; }

interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    total_price: string;
    need_driver: boolean;
    customer: User;
    owner: User;
    car: Car;
    payment: Payment | null;
}

interface Paginated {
    data: Booking[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Stats {
    total: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
}

interface Props {
    bookings: Paginated;
    filters: { status?: string; search?: string };
    stats: Stats;
}

interface FlashProps { toast?: { type: 'success' | 'error'; message: string } }

const STATUS_STYLES: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-800',
    approved:  'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected:  'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function AdminBookings({ bookings, filters, stats }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilters() {
        router.get('/admin/bookings', { search: search || undefined, status: status || undefined }, { preserveState: true, replace: true });
    }

    function handleCancel(id: number) {
        if (confirm('Cancel this booking?')) router.post(`/admin/bookings/${id}/cancel`);
    }

    return (
        <>
            <Head title="Bookings" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Bookings Management</h1>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                        { label: 'Total', value: stats.total, icon: BookOpen, color: 'text-primary' },
                        { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
                        { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-blue-600' },
                        { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600' },
                        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-gray-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon className={`h-8 w-8 ${color}`} />
                                <div>
                                    <p className="text-2xl font-bold">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by customer or vehicle..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Button type="submit" variant="secondary">Filter</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader><CardTitle>All Bookings</CardTitle></CardHeader>
                    <CardContent>
                        {bookings.data.length === 0 ? (
                            <p className="text-muted-foreground">No bookings found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">#</th>
                                            <th className="pb-3 font-medium">Customer</th>
                                            <th className="pb-3 font-medium">Vehicle</th>
                                            <th className="pb-3 font-medium">Owner</th>
                                            <th className="pb-3 font-medium">Dates</th>
                                            <th className="pb-3 font-medium">Total</th>
                                            <th className="pb-3 font-medium">Payment</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.data.map((b) => (
                                            <tr key={b.id} className="border-b last:border-0">
                                                <td className="py-3 text-muted-foreground">#{b.id}</td>
                                                <td className="py-3 font-medium">{b.customer.name}</td>
                                                <td className="py-3">{b.car.brand} {b.car.model}</td>
                                                <td className="py-3 text-muted-foreground">{b.owner.name}</td>
                                                <td className="py-3 text-muted-foreground whitespace-nowrap">
                                                    {b.pickup_date} → {b.return_date}
                                                </td>
                                                <td className="py-3 font-medium">ETB {b.total_price}</td>
                                                <td className="py-3">
                                                    {b.payment ? (
                                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.payment.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {b.payment.payment_status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    {['pending', 'approved'].includes(b.status) && (
                                                        <Button size="sm" variant="destructive" onClick={() => handleCancel(b.id)}>
                                                            <Ban className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {bookings.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {bookings.links.map((link) => (
                                    <Button key={link.label} variant={link.active ? 'secondary' : 'outline'} size="sm" asChild disabled={!link.url}>
                                        <a href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminBookings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Bookings', href: '/admin/bookings' },
    ],
};
