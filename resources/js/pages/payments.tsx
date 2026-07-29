import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDollarSign } from 'lucide-react';

interface Payment {
    id: number;
    payment_method: string;
    payment_status: string;
    amount: string;
    paid_at: string | null;
    booking_id: number;
    customer: { id: number; name: string } | null;
    car: { brand: string; model: string; plate_number: string } | null;
}

interface Props { role: string; payments: Payment[]; }

const STATUS_STYLES: Record<string, string> = {
    paid:    'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed:  'bg-red-100 text-red-800',
};

const METHOD_LABELS: Record<string, string> = {
    cash:          'Cash',
    bank_transfer: 'Bank Transfer',
    telebirr:      'Telebirr',
    chapa:         'Chapa',
};

export default function Payments({ role, payments = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    const totalPaid = payments
        .filter((p) => p.payment_status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return (
        <>
            <Head title="Payment History" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Payment History</h1>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {/* Total */}
                <Card className="max-w-xs">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <CircleDollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Paid</p>
                            <p className="text-2xl font-bold">ETB {totalPaid.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader><CardTitle>All Transactions</CardTitle></CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <p className="text-muted-foreground">No payment records found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">Booking</th>
                                            <th className="pb-3 font-medium">Vehicle</th>
                                            {role === 'admin' && <th className="pb-3 font-medium">Customer</th>}
                                            <th className="pb-3 font-medium">Method</th>
                                            <th className="pb-3 font-medium">Amount</th>
                                            <th className="pb-3 font-medium">Paid At</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="border-b last:border-0">
                                                <td className="py-3 text-muted-foreground">#{payment.booking_id}</td>
                                                <td className="py-3 font-medium">
                                                    {payment.car ? `${payment.car.brand} ${payment.car.model}` : '—'}
                                                </td>
                                                {role === 'admin' && (
                                                    <td className="py-3">{payment.customer?.name ?? '—'}</td>
                                                )}
                                                <td className="py-3 text-muted-foreground">
                                                    {METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
                                                </td>
                                                <td className="py-3 font-semibold">ETB {payment.amount}</td>
                                                <td className="py-3 text-muted-foreground">
                                                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[payment.payment_status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                        {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Payments.layout = {
    breadcrumbs: [{ title: 'Payment History', href: '/payments' }],
};
