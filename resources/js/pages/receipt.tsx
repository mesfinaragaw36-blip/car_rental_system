import { Head, usePage } from '@inertiajs/react';
import { Printer, Banknote, CalendarDays, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    payment: {
        id: number;
        type: string;
        type_label: string;
        amount: string;
        payment_method: string;
        transaction_reference: string | null;
        payment_status: string;
        paid_at: string | null;
    };
    booking: {
        id: number;
        pickup_date: string;
        return_date: string;
        pickup_location: string;
        return_location: string;
        need_driver: boolean;
        total_price: string;
        days: number;
        daily_rate: string;
        subtotal: string;
        driver_fee: string;
        paid_to_date: string;
        balance_remaining: string;
    };
    customer: {
        name: string;
        email: string;
        phone: string;
    } | null;
    car: {
        brand: string;
        model: string;
        plate_number: string;
    } | null;
}

const STATUS_STYLES: Record<string, string> = {
    paid: 'border-green-200 bg-green-50 text-green-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    failed: 'border-red-200 bg-red-50 text-red-700',
    refunded: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function Receipt({ payment, booking, customer, car }: Props) {
    const { name } = usePage().props as { name: string };

    return (
        <>
            <Head title={`Receipt #${payment.id}`} />

            <div className="mx-auto w-full max-w-3xl p-4 sm:p-8 print:max-w-none print:p-0">
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
                    {/* Header */}
                    <div className="border-b border-dashed pb-6 text-center">
                        <img
                            src="/images/logo.png"
                            alt={name}
                            className="mx-auto mb-3 h-16 w-16 rounded-full object-cover"
                        />

                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            {name}
                        </h1>

                        <p className="mt-1 text-sm font-medium uppercase tracking-widest text-secondary">
                            Official Payment Receipt
                        </p>

                        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5 text-sm">
                            <span className="text-muted-foreground">Receipt No.</span>
                            <span className="font-semibold">#{payment.id}</span>
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-4 border-b border-dashed py-6 sm:grid-cols-4">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Booking Ref
                            </p>
                            <p className="mt-1 text-sm font-semibold">#{booking.id}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Payment Type
                            </p>
                            <p className="mt-1 text-sm font-semibold">{payment.type_label}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Date Issued
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {payment.paid_at
                                    ? new Date(payment.paid_at).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Status
                            </p>
                            <span
                                className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[payment.payment_status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
                            >
                                {payment.payment_status}
                            </span>
                        </div>
                    </div>

                    {/* Billed to + Vehicle */}
                    <div className="grid gap-6 border-b border-dashed py-6 sm:grid-cols-2">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                                <Car className="h-4 w-4" />
                                <h2 className="text-sm font-semibold uppercase tracking-wide">
                                    Vehicle
                                </h2>
                            </div>

                            <p className="text-base font-bold text-foreground">
                                {car ? `${car.brand} ${car.model}` : 'N/A'}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Plate: <span className="font-medium text-foreground">{car?.plate_number ?? 'N/A'}</span>
                            </p>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                <h2 className="text-sm font-semibold uppercase tracking-wide">
                                    Rental Period
                                </h2>
                            </div>

                            <p className="text-sm font-semibold text-foreground">
                                {booking.pickup_date} → {booking.return_date}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {booking.pickup_location} → {booking.return_location}
                            </p>
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="border-b border-dashed py-6">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Billed To
                        </h2>

                        {customer ? (
                            <div className="grid gap-2 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Name</p>
                                    <p className="text-sm font-semibold">{customer.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="text-sm">{customer.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="text-sm">{customer.phone}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">N/A</p>
                        )}
                    </div>

                    {/* Cost breakdown */}
                    <div className="py-6">
                        <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                            <Banknote className="h-4 w-4" />
                            <h2 className="text-sm font-semibold uppercase tracking-wide">
                                Cost Breakdown
                            </h2>
                        </div>

                        <dl className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Daily Rate
                                    <span className="ml-2 text-xs text-muted-foreground/70">
                                        (× {booking.days} day{booking.days === 1 ? '' : 's'})
                                    </span>
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    ETB {booking.daily_rate}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Rental Subtotal</dt>
                                <dd className="font-medium tabular-nums">
                                    ETB {booking.subtotal}
                                </dd>
                            </div>

                            {booking.need_driver && Number(booking.driver_fee) > 0 && (
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Driver Fee</dt>
                                    <dd className="font-medium tabular-nums">
                                        ETB {booking.driver_fee}
                                    </dd>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                                <dt className="font-semibold text-foreground">
                                    Rental Total
                                </dt>
                                <dd className="text-lg font-bold tabular-nums">
                                    ETB {booking.total_price}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Paid To Date
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    ETB {booking.paid_to_date}
                                </dd>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">
                                    Amount Due
                                </dt>
                                <dd className="font-medium tabular-nums">
                                    ETB {booking.balance_remaining}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Payment details */}
                    <div className="border-t border-dashed py-6">
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Payment Details
                        </h2>

                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <div className="flex justify-between gap-4 sm:block">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium sm:block sm:mt-0.5">
                                    {payment.payment_method}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 sm:block">
                                <span className="text-muted-foreground">Reference</span>
                                <span className="font-medium sm:block sm:mt-0.5">
                                    {payment.transaction_reference ?? 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 sm:block">
                                <span className="text-muted-foreground">Paid At</span>
                                <span className="font-medium sm:block sm:mt-0.5">
                                    {payment.paid_at
                                        ? new Date(payment.paid_at).toLocaleString()
                                        : 'N/A'}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4 sm:block">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="text-base font-bold sm:block sm:mt-0.5">
                                    ETB {payment.amount}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-dashed pt-6 text-center">
                        <Button onClick={() => window.print()} className="print:hidden">
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>

                        <p className="mt-4 text-sm text-muted-foreground">
                            Thank you for choosing {name}.
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground/70">
                            This receipt was issued for booking #{booking.id}. Keep it for
                            your records.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Receipt.layout = {
    breadcrumbs: [{ title: 'Receipt', href: '' }],
};
