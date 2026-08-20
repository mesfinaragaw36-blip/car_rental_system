import { Head, usePage } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    Car,
    Download,
    Printer,
    ReceiptText,
    RefreshCcw,
    ShieldCheck,
} from 'lucide-react';
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
        deposit_amount: string;
        full_deposit: string;
        full_deposit_balance: string;
        security_deposit: string;
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
    refunds: {
        id: number;
        amount: string;
        reason: string;
        status: string;
        processed_at: string | null;
    }[];
}

const STATUS_STYLES: Record<string, string> = {
    paid: 'border-green-200 bg-green-50 text-green-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    failed: 'border-red-200 bg-red-50 text-red-700',
    refunded: 'border-slate-200 bg-slate-50 text-slate-600',
};

const REFUND_STYLES: Record<string, string> = {
    processed: 'border-green-200 bg-green-50 text-green-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
};

function refundLabel(reason: string): string {
    if (/damage|repair/i.test(reason)) {
        return 'Refund — Damage';
    }

    if (/late/i.test(reason)) {
        return 'Refund — Late Fees';
    }

    if (/cancel/i.test(reason)) {
        return 'Cancellation Refund';
    }

    return 'Refund';
}

function Line({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold text-foreground tabular-nums">
                {value}
            </dd>
        </div>
    );
}

export default function Receipt({
    payment,
    booking,
    customer,
    car,
    refunds,
}: Props) {
    const { name } = usePage().props as { name: string };

    return (
        <>
            <Head title={`Receipt #${payment.id}`} />

            <div className="receipt-page flex min-h-screen w-full items-center justify-center bg-muted/50 px-4 py-10">
                <div className="w-full max-w-2xl">
                    <div className="receipt-card overflow-hidden rounded-2xl border bg-card shadow-sm">
                        {/* Header */}
                        <div className="receipt-header bg-gradient-to-br from-primary via-primary/95 to-primary/80 px-6 pt-9 pb-7 text-center text-primary-foreground">
                            <img
                                src="/images/logo.png"
                                alt={name}
                                className="mx-auto mb-3 h-16 w-16 rounded-full border-4 border-white/40 bg-white object-cover"
                            />
                            <h1 className="text-2xl font-bold tracking-tight">
                                {name}
                            </h1>
                            <p className="mt-1 text-xs font-semibold tracking-[0.25em] text-primary-foreground/80 uppercase">
                                Official Payment Receipt
                            </p>

                            <div className="receipt-badge mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur-sm">
                                <ReceiptText className="h-4 w-4" />
                                <span className="receipt-badge-label text-primary-foreground/80">
                                    Receipt No.
                                </span>
                                <span className="font-bold">#{payment.id}</span>
                            </div>
                        </div>

                        {/* Meta row */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 border-b border-dashed px-6 py-6 text-center sm:grid-cols-4">
                            <div>
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Booking Ref
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    #{booking.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Payment Type
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {payment.type_label}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Date Issued
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                    {payment.paid_at
                                        ? new Date(
                                              payment.paid_at,
                                          ).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Status
                                </p>
                                <span
                                    className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[payment.payment_status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
                                >
                                    {payment.payment_status}
                                </span>
                            </div>
                        </div>

                        {/* Vehicle + Rental Period */}
                        <div className="grid gap-8 border-b border-dashed px-6 py-6 text-center sm:grid-cols-2">
                            <div>
                                <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                                    <Car className="h-4 w-4" />
                                    <h2 className="text-sm font-semibold tracking-wide uppercase">
                                        Vehicle
                                    </h2>
                                </div>

                                <p className="text-base font-bold text-foreground">
                                    {car ? `${car.brand} ${car.model}` : 'N/A'}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Plate:{' '}
                                    <span className="font-medium text-foreground">
                                        {car?.plate_number ?? 'N/A'}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <h2 className="text-sm font-semibold tracking-wide uppercase">
                                        Rental Period
                                    </h2>
                                </div>

                                <p className="text-sm font-semibold text-foreground">
                                    {booking.pickup_date} →{' '}
                                    {booking.return_date}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {booking.pickup_location} →{' '}
                                    {booking.return_location}
                                </p>
                            </div>
                        </div>

                        {/* Customer */}
                        <div className="border-b border-dashed px-6 py-6 text-center">
                            <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Billed To
                            </h2>

                            {customer ? (
                                <div className="grid gap-2 text-sm sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Name
                                        </p>
                                        <p className="font-semibold">
                                            {customer.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Email
                                        </p>
                                        <p>{customer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Phone
                                        </p>
                                        <p>{customer.phone}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    N/A
                                </p>
                            )}
                        </div>

                        {/* Cost breakdown */}
                        <div className="border-b border-dashed px-6 py-6">
                            <div className="mb-5 flex items-center justify-center gap-2 text-muted-foreground">
                                <Banknote className="h-4 w-4" />
                                <h2 className="text-sm font-semibold tracking-wide uppercase">
                                    Cost Breakdown
                                </h2>
                            </div>

                            <dl className="mx-auto w-full max-w-md space-y-3">
                                <Line
                                    label={`Daily Price (× ${booking.days} day${booking.days === 1 ? '' : 's'})`}
                                    value={`ETB ${booking.daily_rate}`}
                                />
                                <Line
                                    label="Rental Subtotal"
                                    value={`ETB ${booking.subtotal}`}
                                />

                                {booking.need_driver &&
                                    Number(booking.driver_fee) > 0 && (
                                        <Line
                                            label="Driver Fee"
                                            value={`ETB ${booking.driver_fee}`}
                                        />
                                    )}

                                <div className="flex items-baseline justify-between gap-4 rounded-lg bg-muted/60 px-4 py-2.5">
                                    <dt className="font-semibold text-foreground">
                                        Rental Total
                                    </dt>
                                    <dd className="text-lg font-bold tabular-nums">
                                        ETB {booking.total_price}
                                    </dd>
                                </div>

                                <Line
                                    label="First Deposit"
                                    value={`ETB ${booking.deposit_amount}`}
                                />
                                <Line
                                    label="Full Deposit − First Deposit"
                                    value={`ETB ${booking.full_deposit_balance}`}
                                />

                                <div className="flex items-baseline justify-between gap-4 rounded-lg border border-border/60 bg-white px-4 py-2.5">
                                    <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        Safety Deposit
                                    </dt>
                                    <dd className="text-sm font-semibold tabular-nums">
                                        ETB {booking.security_deposit}
                                    </dd>
                                </div>

                                <div className="border-t border-border pt-3">
                                    <Line
                                        label="Paid To Date"
                                        value={`ETB ${booking.paid_to_date}`}
                                    />
                                    <Line
                                        label="Amount Due"
                                        value={`ETB ${booking.balance_remaining}`}
                                    />
                                </div>
                            </dl>
                        </div>

                        {/* Payment details */}
                        <div className="px-6 py-6 text-center">
                            <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Payment Details
                            </h2>

                            <div className="mx-auto grid w-full max-w-md gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Method
                                    </p>
                                    <p className="mt-0.5 font-medium">
                                        {payment.payment_method}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Reference
                                    </p>
                                    <p className="mt-0.5 font-medium">
                                        {payment.transaction_reference ?? 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Paid At
                                    </p>
                                    <p className="mt-0.5 font-medium">
                                        {payment.paid_at
                                            ? new Date(
                                                  payment.paid_at,
                                              ).toLocaleString()
                                            : 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Amount Paid
                                    </p>
                                    <p className="mt-0.5 text-base font-bold tabular-nums">
                                        ETB {payment.amount}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Refunds */}
                        {refunds.length > 0 && (
                            <div className="border-t border-dashed px-6 py-6 text-center">
                                <div className="mb-4 flex items-center justify-center gap-2 text-muted-foreground">
                                    <RefreshCcw className="h-4 w-4" />
                                    <h2 className="text-sm font-semibold tracking-wide uppercase">
                                        Refunds
                                    </h2>
                                </div>

                                <div className="mx-auto w-full max-w-md space-y-3">
                                    {refunds.map((refund) => (
                                        <div
                                            key={refund.id}
                                            className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-left"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground">
                                                    {refundLabel(refund.reason)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {refund.reason}
                                                </p>
                                            </div>

                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                <span className="text-sm font-bold tabular-nums">
                                                    ETB {refund.amount}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${REFUND_STYLES[refund.status] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}
                                                >
                                                    {refund.status ===
                                                    'processed'
                                                        ? 'Refunded'
                                                        : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="border-t border-dashed px-6 py-6 text-center">
                            <Button
                                onClick={() => window.print()}
                                className="receipt-btn"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print / Download PDF
                                <Download className="ml-2 h-4 w-4" />
                            </Button>

                            <p className="receipt-tip mt-2 text-xs text-muted-foreground/60">
                                Tip: In the print dialog, select 'Save as PDF' to download a PDF copy.
                            </p>

                            <p className="mt-4 text-sm text-muted-foreground">
                                Thank you for choosing {name}.
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground/70">
                                This receipt was issued for booking #
                                {booking.id}. Keep it for your records.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Receipt.layout = {
    breadcrumbs: [{ title: 'Receipt', href: '' }],
};
