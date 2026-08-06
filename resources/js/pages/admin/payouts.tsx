import { Head, router, usePage } from '@inertiajs/react';
import { Banknote } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Payout {
    id: number;
    gross_amount: string;
    commission_amount: string;
    net_amount: string;
    status: 'pending' | 'paid';
    paid_at: string | null;
    created_at: string;
    booking_id: number;
    owner: { id: number; name: string } | null;
    booking: {
        car: { brand: string; model: string; plate_number: string } | null;
    } | null;
}

interface Paginated {
    data: Payout[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    payouts: Paginated;
    filters: { status?: string };
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
};

export default function AdminPayouts({ payouts, filters }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilter() {
        router.get(
            '/admin/payouts',
            { status: status || undefined },
            { preserveState: true, replace: true },
        );
    }

    function handleMarkPaid(id: number) {
        if (confirm('Confirm this payout was transferred to the owner?')) {
            router.post(`/admin/payouts/${id}/mark-paid`);
        }
    }

    return (
        <>
            <Head title="Owner Payouts" />

            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Owner Payouts</h1>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardContent className="p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applyFilter();
                            }}
                            className="flex flex-col gap-3 md:flex-row md:items-end"
                        >
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                            <Button type="submit" variant="secondary">
                                Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Payouts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {payouts.data.length === 0 ? (
                            <p className="text-muted-foreground">
                                No payouts found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">
                                                Booking
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Owner
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Vehicle
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Gross
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Commission
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Net
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Status
                                            </th>
                                            <th className="pb-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payouts.data.map((payout) => (
                                            <tr
                                                key={payout.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 font-medium">
                                                    #{payout.booking_id}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {payout.owner?.name ?? '—'}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {payout.booking?.car
                                                        ? `${payout.booking.car.brand} ${payout.booking.car.model} (${payout.booking.car.plate_number})`
                                                        : '—'}
                                                </td>
                                                <td className="py-3">
                                                    ETB {payout.gross_amount}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    ETB{' '}
                                                    {payout.commission_amount}
                                                </td>
                                                <td className="py-3 font-medium text-green-700">
                                                    ETB {payout.net_amount}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[payout.status] ?? 'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    {payout.status ===
                                                    'pending' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleMarkPaid(
                                                                    payout.id,
                                                                )
                                                            }
                                                        >
                                                            <Banknote className="mr-1 h-4 w-4" />{' '}
                                                            Mark Paid
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            {payout.paid_at ??
                                                                'Paid'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {payouts.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {payouts.links.map((link) => (
                                    <Button
                                        key={link.label}
                                        variant={
                                            link.active
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <a
                                            href={link.url ?? '#'}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
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

AdminPayouts.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Owner Payouts', href: '/admin/payouts' },
    ],
};
