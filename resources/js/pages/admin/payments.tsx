import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CircleDollarSign, Search } from 'lucide-react';
import type { Auth } from '@/types';

interface Car { brand: string; model: string; }
interface User { name: string; }
interface Booking { customer: User; owner: User; car: Car; }

interface Payment {
    id: number;
    amount: string;
    payment_method: string;
    payment_status: string;
    transaction_reference: string | null;
    paid_at: string | null;
    booking: Booking;
}

interface Paginated {
    data: Payment[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    payments: Paginated;
    totalRevenue: number;
    filters: { status?: string; search?: string };
}

interface FlashProps { toast?: { type: 'success' | 'error'; message: string } }

const STATUS_STYLES: Record<string, string> = {
    paid:    'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed:  'bg-red-100 text-red-800',
};

export default function AdminPayments({ payments, totalRevenue, filters }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilters() {
        router.get('/admin/payments', { search: search || undefined, status: status || undefined }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Payments" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Payment Management</h1>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {/* Revenue card */}
                <Card className="max-w-xs">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <CircleDollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">ETB {Number(totalRevenue).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by customer name..."
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
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                            <Button type="submit" variant="secondary">Filter</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader><CardTitle>All Payments</CardTitle></CardHeader>
                    <CardContent>
                        {payments.data.length === 0 ? (
                            <p className="text-muted-foreground">No payments found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">Customer</th>
                                            <th className="pb-3 font-medium">Owner</th>
                                            <th className="pb-3 font-medium">Vehicle</th>
                                            <th className="pb-3 font-medium">Amount</th>
                                            <th className="pb-3 font-medium">Method</th>
                                            <th className="pb-3 font-medium">Reference</th>
                                            <th className="pb-3 font-medium">Paid At</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.data.map((p) => (
                                            <tr key={p.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">{p.booking.customer.name}</td>
                                                <td className="py-3 text-muted-foreground">{p.booking.owner.name}</td>
                                                <td className="py-3">{p.booking.car.brand} {p.booking.car.model}</td>
                                                <td className="py-3 font-medium">ETB {p.amount}</td>
                                                <td className="py-3 capitalize text-muted-foreground">{p.payment_method}</td>
                                                <td className="py-3 text-muted-foreground">{p.transaction_reference ?? '—'}</td>
                                                <td className="py-3 text-muted-foreground whitespace-nowrap">
                                                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[p.payment_status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                        {p.payment_status.charAt(0).toUpperCase() + p.payment_status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {payments.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {payments.links.map((link) => (
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

AdminPayments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Payments', href: '/admin/payments' },
    ],
};
