import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CircleDollarSign, Car, User, CreditCard, CheckCircle,
    Clock, XCircle, Banknote, Smartphone, Building,
} from 'lucide-react';

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
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    paid: <CheckCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    failed: <XCircle className="h-4 w-4" />,
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
    cash: <Banknote className="h-4 w-4" />,
    bank_transfer: <Building className="h-4 w-4" />,
    telebirr: <Smartphone className="h-4 w-4" />,
    chapa: <CreditCard className="h-4 w-4" />,
};

const METHOD_LABELS: Record<string, string> = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    telebirr: 'Telebirr',
    chapa: 'Chapa',
};

export default function Payments({ role, payments = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    const totalPaidAmount = payments
        .filter((p) => p.payment_status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const paidCount = payments.filter(p => p.payment_status === 'paid').length;
    const pendingCount = payments.filter(p => p.payment_status === 'pending').length;

    return (
        <>
            <Head title="Payment History" />
            <div className="space-y-8 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Payment History</h1>
                    <p className="mt-2 text-muted-foreground">
                        {role === 'owner' ? 'Track payments received from your rental bookings.' : 'View all payment transactions.'}
                    </p>
                </div>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {toast.message}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                <CircleDollarSign className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Received</p>
                                <p className="mt-0.5 text-2xl font-bold text-emerald-700">ETB {totalPaidAmount.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed</p>
                                <p className="mt-0.5 text-2xl font-bold">{paidCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</p>
                                <p className="mt-0.5 text-2xl font-bold">{pendingCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden rounded-2xl shadow-sm">
                    <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                        <CardTitle>All Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <CircleDollarSign className="mb-4 h-16 w-16 text-slate-400" />
                                <h2 className="text-xl font-semibold">No payment records found</h2>
                                <p className="mt-2 text-center text-muted-foreground">Payments will appear here once customers complete their bookings.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Booking</th>
                                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Vehicle</th>
                                            {role === 'admin' && <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Customer</th>}
                                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="border-b last:border-0 transition hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs text-muted-foreground">#{payment.booking_id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                                                            <Car className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {payment.car ? `${payment.car.brand} ${payment.car.model}` : '—'}
                                                            </p>
                                                            {payment.car?.plate_number && (
                                                                <p className="text-xs text-muted-foreground">{payment.car.plate_number}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {role === 'admin' && (
                                                    <td className="px-6 py-4">{payment.customer?.name ?? '—'}</td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        {METHOD_ICONS[payment.payment_method]}
                                                        <span>{METHOD_LABELS[payment.payment_method] ?? payment.payment_method}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold">ETB {payment.amount}</td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[payment.payment_status] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                        {STATUS_ICONS[payment.payment_status]}
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