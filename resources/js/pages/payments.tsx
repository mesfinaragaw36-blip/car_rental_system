import { Head, Link } from '@inertiajs/react';
import {
    CircleDollarSign,
    Car,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Banknote,
    Eye,
    Search,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { receipt } from '@/routes/payments';

interface Payment {
    id: number;
    type: string;
    payment_method: string;
    payment_status: string;
    amount: string;
    paid_at: string | null;
    booking_id: number;
    leverage_document_status: string | null;

    customer: {
        id: number;
        name: string;
    } | null;

    car: {
        brand: string;
        model: string;
        plate_number: string;
    } | null;
}

interface Props {
    role: string;
    payments: Payment[];
}

const STATUS_STYLES: Record<string, string> = {
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    failed: 'border-red-200 bg-red-50 text-red-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    paid: <CheckCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    failed: <XCircle className="h-4 w-4" />,
};

const METHOD_ICONS: Record<string, React.ReactNode> = {
    Cash: <Banknote className="h-4 w-4" />,
    'CBE Birr': <CreditCard className="h-4 w-4" />,
};

const METHOD_LABELS: Record<string, string> = {
    Cash: 'Cash',
    'CBE Birr': 'CBE Birr',
};

const TYPE_LABELS: Record<string, string> = {
    booking_deposit: 'Deposit',
    balance: 'Balance',
    security_deposit: 'Security Deposit',
    extra_charge: 'Extra Charge',
};

const TYPE_STYLES: Record<string, string> = {
    booking_deposit: 'border-accent bg-accent text-primary',
    balance: 'border-accent bg-accent text-primary',
    security_deposit:
        'border-slate-200 bg-slate-100 text-slate-700',
    extra_charge: 'border-red-200 bg-red-50 text-red-700',
};

function PayNowAction({ payment }: { payment: Payment }) {
    if (
        payment.type !== 'extra_charge' ||
        payment.payment_status !== 'pending'
    ) {
        return null;
    }

    const url =
        '/bookings/' +
        payment.booking_id +
        '/payment/extra-charge';

    return (
        <a
            href={url}
            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
        >
            Pay Now
        </a>
    );
}

export default function Payments({
    role,
    payments = [],
}: Props) {
    const [search, setSearch] = useState('');

    const totalPaidAmount = payments
        .filter(
            (payment) =>
                payment.payment_status === 'paid' &&
                payment.type !== 'security_deposit',
        )
        .reduce(
            (sum, payment) =>
                sum + Number.parseFloat(payment.amount),
            0,
        );

    const paidCount = payments.filter(
        (payment) => payment.payment_status === 'paid',
    ).length;

    const pendingCount = payments.filter(
        (payment) => payment.payment_status === 'pending',
    ).length;

    const failedCount = payments.filter(
        (payment) => payment.payment_status === 'failed',
    ).length;

    const filteredPayments = payments.filter((payment) => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return true;
        }

        const bookingId = payment.booking_id
            .toString()
            .toLowerCase();

        const customerName =
            payment.customer?.name?.toLowerCase() ?? '';

        const carName = payment.car
            ? `${payment.car.brand} ${payment.car.model}`.toLowerCase()
            : '';

        const plateNumber =
            payment.car?.plate_number?.toLowerCase() ?? '';

        const paymentType =
            TYPE_LABELS[payment.type]?.toLowerCase() ??
            payment.type.toLowerCase();

        const paymentMethod =
            METHOD_LABELS[payment.payment_method]?.toLowerCase() ??
            payment.payment_method.toLowerCase();

        return (
            bookingId.includes(keyword) ||
            customerName.includes(keyword) ||
            carName.includes(keyword) ||
            plateNumber.includes(keyword) ||
            paymentType.includes(keyword) ||
            paymentMethod.includes(keyword)
        );
    });

    return (
        <>
            <Head title="Payment History" />

            <div className="space-y-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">
                        Payment History
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        {role === 'owner'
                            ? 'Track payments received from your rental bookings.'
                            : role === 'admin'
                              ? 'View and manage customer payment transactions.'
                              : 'View all payment transactions.'}
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-5 md:grid-cols-3">
                    {/* Total Received */}
                    <Card className="rounded-3xl border-0 bg-gradient-to-br from-white to-slate-50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                <CircleDollarSign className="h-6 w-6 text-emerald-600" />
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Total Received
                                </p>

                                <p className="mt-0.5 text-2xl font-bold text-emerald-700">
                                    ETB{' '}
                                    {totalPaidAmount.toLocaleString(
                                        'en-US',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed */}
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Completed
                                </p>

                                <p className="mt-0.5 text-2xl font-bold">
                                    {paidCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending */}
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Pending
                                </p>

                                <p className="mt-0.5 text-2xl font-bold">
                                    {pendingCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="font-semibold">
                            Transactions
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            Search payment records
                        </p>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />

                        <Input
                            placeholder="Search booking, customer, car..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Transactions */}
                <Card className="overflow-hidden rounded-2xl shadow-sm">
                    <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                        <CardTitle>
                            All Transactions
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {filteredPayments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <CircleDollarSign className="mb-4 h-16 w-16 text-slate-400" />

                                <h2 className="text-xl font-semibold">
                                    No payment records found
                                </h2>

                                <p className="mt-2 text-center text-muted-foreground">
                                    {search
                                        ? 'No payments match your search.'
                                        : 'Payments will appear here once customers make payments.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Booking
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Vehicle
                                            </th>

                                            {role === 'admin' && (
                                                <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                    Customer
                                                </th>
                                            )}

                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Type
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Method
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Amount
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Date
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold tracking-wider uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredPayments.map(
                                            (payment) => (
                                                <tr
                                                    key={payment.id}
                                                    className="border-b transition-all duration-200 last:border-0 hover:bg-accent/50"
                                                >
                                                    {/* Booking */}
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                                                            #
                                                            {
                                                                payment.booking_id
                                                            }
                                                        </span>
                                                    </td>

                                                    {/* Vehicle */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                                                                <Car className="h-4 w-4 text-primary" />
                                                            </div>

                                                            <div>
                                                                <p className="font-medium">
                                                                    {payment.car
                                                                        ? `${payment.car.brand} ${payment.car.model}`
                                                                        : '—'}
                                                                </p>

                                                                {payment
                                                                    .car
                                                                    ?.plate_number && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {
                                                                            payment
                                                                                .car
                                                                                .plate_number
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Customer */}
                                                    {role === 'admin' && (
                                                        <td className="px-6 py-4">
                                                            {payment
                                                                .customer
                                                                ?.name ??
                                                                '—'}
                                                        </td>
                                                    )}

                                                    {/* Type */}
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                                                TYPE_STYLES[
                                                                    payment
                                                                        .type
                                                                ] ??
                                                                'border-slate-200 bg-slate-50 text-slate-700'
                                                            }`}
                                                        >
                                                            {TYPE_LABELS[
                                                                payment.type
                                                            ] ??
                                                                payment.type}
                                                        </span>

                                                        {payment.type === 'extra_charge' &&
                                                            payment.leverage_document_status && (
                                                                <span
                                                                    className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                                                                        payment.leverage_document_status === 'released'
                                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                            : payment.leverage_document_status === 'pending_charges'
                                                                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                                                : 'border-slate-200 bg-slate-50 text-slate-600'
                                                                    }`}
                                                                >
                                                                    {payment.leverage_document_status === 'released'
                                                                        ? 'Document Released'
                                                                        : payment.leverage_document_status === 'pending_charges'
                                                                            ? 'Document Held'
                                                                            : payment.leverage_document_status}
                                                                </span>
                                                            )}
                                                    </td>

                                                    {/* Method */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            {METHOD_ICONS[
                                                                payment
                                                                    .payment_method
                                                            ] ?? (
                                                                <CreditCard className="h-4 w-4" />
                                                            )}

                                                            <span>
                                                                {METHOD_LABELS[
                                                                    payment
                                                                        .payment_method
                                                                ] ??
                                                                    payment.payment_method}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-6 py-4 font-semibold">
                                                        ETB{' '}
                                                        {Number.parseFloat(
                                                            payment.amount,
                                                        ).toLocaleString(
                                                            'en-US',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {payment.paid_at
                                                            ? new Date(
                                                                  payment.paid_at,
                                                              ).toLocaleDateString(
                                                                  'en-US',
                                                                  {
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                      year: 'numeric',
                                                                  },
                                                              )
                                                            : '—'}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                                                STATUS_STYLES[
                                                                    payment
                                                                        .payment_status
                                                                ] ??
                                                                'border-slate-200 bg-slate-50 text-slate-700'
                                                            }`}
                                                        >
                                                            {STATUS_ICONS[
                                                                payment
                                                                    .payment_status
                                                            ] ?? (
                                                                <Clock className="h-4 w-4" />
                                                            )}

                                                            {payment.payment_status
                                                                .charAt(
                                                                    0,
                                                                )
                                                                .toUpperCase() +
                                                                payment.payment_status.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1.5"
                                                            >
                                                                <Link
                                                                    href={receipt.url(
                                                                        {
                                                                            payment:
                                                                                payment.id,
                                                                        },
                                                                    )}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </Button>

                                                            {role ===
                                                                'customer' && (
                                                                <PayNowAction
                                                                    payment={
                                                                        payment
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
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
    breadcrumbs: [
        {
            title: 'Payment History',
            href: '/payments',
        },
    ],
};