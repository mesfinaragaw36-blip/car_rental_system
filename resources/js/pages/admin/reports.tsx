import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    Car,
    CheckCircle2,
    CircleDollarSign,
    ClipboardCheck,
    CreditCard,
    FileDown,
    FileText,
    RefreshCcw,
    Wallet,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

type Summary = {
    total_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;

    total_payments: number | string;
    rental_revenue: number | string;
    extra_charges: number | string;
    total_revenue: number | string;

    security_deposits: number | string;

    total_refunds: number | string;
    processed_refunds: number | string;
    pending_refunds: number | string;

    company_commission: number | string;

    owner_payouts: number | string;
    paid_owner_payouts: number | string;
    pending_owner_payouts: number | string;

    driver_payouts: number | string;
    paid_driver_payouts: number | string;
    pending_driver_payouts: number | string;

    total_cars: number;
    available_cars: number;
    booked_cars: number;

    total_inspections: number;
    approved_inspections: number;
    issues_found: number;
};

type TopCar = {
    car: string;
    plate_number: string | null;
    bookings_count: number;
};

type RefundStatus = {
    count: number;
    amount: number;
};

type RevenuePoint = {
    date: string;
    total: number;
};

type Props = {
    summary: Summary;
    bookingStatuses: Record<string, number>;
    paymentTypes: Record<string, number>;
    paymentMethods: Record<string, number>;
    topCars: TopCar[];
    refundStatuses: Record<string, RefundStatus>;
    revenueByDate: RevenuePoint[];
    filters: {
        from: string | null;
        to: string | null;
    };
};

function formatMoney(value: number | string): string {
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatLabel(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'All available dates';
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function Reports({
    summary,
    bookingStatuses,
    paymentTypes,
    paymentMethods,
    topCars,
    refundStatuses,
    revenueByDate,
    filters,
}: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/admin/reports',
            {
                from: from || undefined,
                to: to || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setFrom('');
        setTo('');

        router.get(
            '/admin/reports',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

   const exportPdf = () => {
    const params = new URLSearchParams();

    if (from) {
        params.append('from', from);
    }

    if (to) {
        params.append('to', to);
    }

    window.location.href = `/admin/reports/pdf?${params.toString()}`;
};

    const bookingStatusEntries = Object.entries(bookingStatuses);
    const paymentTypeEntries = Object.entries(paymentTypes);
    const paymentMethodEntries = Object.entries(paymentMethods);
    const refundStatusEntries = Object.entries(refundStatuses);

    const maxRevenue = Math.max(
        ...revenueByDate.map((item) => Number(item.total)),
        1,
    );

    const reportGeneratedAt = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const reportPeriod =
        from || to
            ? `${formatDate(from || null)} - ${formatDate(to || null)}`
            : 'All available dates';

    return (
        <>
            <Head title="Reports" />

            <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                <FileText className="h-4 w-4" />
                                Business Reporting
                            </div>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                Reports
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Generate, review, and export detailed rental
                                business reports.
                            </p>
                        </div>

                        <Button
                            type="button"
                            onClick={exportPdf}
                            className="gap-2"
                        >
                            <FileDown className="h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>

                    {/* Report Filters */}
                    <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-blue-700" />
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Report Period
                                </h2>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                Select the period you want to include in the
                                report.
                            </p>
                        </div>

                        <form
                            onSubmit={submitFilters}
                            className="flex flex-col gap-4 p-5 md:flex-row md:items-end"
                        >
                            <div className="flex-1">
                                <label
                                    htmlFor="from"
                                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                                >
                                    From
                                </label>

                                <input
                                    id="from"
                                    type="date"
                                    value={from}
                                    onChange={(event) =>
                                        setFrom(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex-1">
                                <label
                                    htmlFor="to"
                                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                                >
                                    To
                                </label>

                                <input
                                    id="to"
                                    type="date"
                                    value={to}
                                    onChange={(event) =>
                                        setTo(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Apply</Button>

                                {(from || to) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Printable Report */}
                    <article
                        id="report-document"
                        className="mx-auto max-w-5xl border border-slate-200 bg-white shadow-sm print:max-w-none print:border-0 print:shadow-none"
                    >
                        {/* Report Cover / Header */}
                        <header className="border-b-2 border-slate-900 px-8 py-8 sm:px-10">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                                            <Car className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                                                Ethio Car Rental
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Administrative Report
                                            </p>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                        Rental Business Report
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Comprehensive operational and financial
                                        report
                                    </p>
                                </div>

                                <div className="text-left sm:text-right">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Report Period
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {reportPeriod}
                                    </p>

                                    <p className="mt-4 text-xs text-slate-400">
                                        Generated
                                    </p>

                                    <p className="text-sm font-medium text-slate-700">
                                        {reportGeneratedAt}
                                    </p>
                                </div>
                            </div>
                        </header>

                        <div className="px-8 py-8 sm:px-10">
                            {/* Executive Summary */}
                            <section className="report-section">
                                <SectionHeading
                                    number="01"
                                    title="Executive Summary"
                                    icon={<FileText className="h-4 w-4" />}
                                />

                                <div className="mt-5 grid grid-cols-2 border border-slate-200 sm:grid-cols-4">
                                    <SummaryItem
                                        label="Total Bookings"
                                        value={summary.total_bookings}
                                    />

                                    <SummaryItem
                                        label="Completed"
                                        value={summary.completed_bookings}
                                    />

                                    <SummaryItem
                                        label="Total Revenue"
                                        value={`ETB ${formatMoney(
                                            summary.total_revenue,
                                        )}`}
                                    />

                                    <SummaryItem
                                        label="Commission"
                                        value={`ETB ${formatMoney(
                                            summary.company_commission,
                                        )}`}
                                    />
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                    <InlineMetric
                                        label="Confirmed Bookings"
                                        value={summary.confirmed_bookings}
                                    />

                                    <InlineMetric
                                        label="Cancelled Bookings"
                                        value={summary.cancelled_bookings}
                                    />

                                    <InlineMetric
                                        label="Total Payments Received"
                                        value={`ETB ${formatMoney(
                                            summary.total_payments,
                                        )}`}
                                    />
                                </div>
                            </section>

                            {/* Financial Summary */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="02"
                                    title="Financial Summary"
                                    icon={
                                        <CircleDollarSign className="h-4 w-4" />
                                    }
                                />

                                <ReportTable
                                    headers={['Financial Item', 'Amount']}
                                    rows={[
                                        [
                                            'Rental Revenue',
                                            `ETB ${formatMoney(
                                                summary.rental_revenue,
                                            )}`,
                                        ],
                                        [
                                            'Extra Charges',
                                            `ETB ${formatMoney(
                                                summary.extra_charges,
                                            )}`,
                                        ],
                                        [
                                            'Total Revenue',
                                            `ETB ${formatMoney(
                                                summary.total_revenue,
                                            )}`,
                                        ],
                                        [
                                            'Security Deposits',
                                            `ETB ${formatMoney(
                                                summary.security_deposits,
                                            )}`,
                                        ],
                                        [
                                            'Company Commission',
                                            `ETB ${formatMoney(
                                                summary.company_commission,
                                            )}`,
                                        ],
                                        [
                                            'Total Refunds',
                                            `ETB ${formatMoney(
                                                summary.total_refunds,
                                            )}`,
                                        ],
                                    ]}
                                    emphasizeLast={false}
                                />
                            </section>

                            {/* Payout Summary */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="03"
                                    title="Payout Summary"
                                    icon={<Wallet className="h-4 w-4" />}
                                />

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                            Owner Payouts
                                        </h3>

                                        <ReportTable
                                            headers={['Status', 'Amount']}
                                            rows={[
                                                [
                                                    'Total',
                                                    `ETB ${formatMoney(
                                                        summary.owner_payouts,
                                                    )}`,
                                                ],
                                                [
                                                    'Paid',
                                                    `ETB ${formatMoney(
                                                        summary.paid_owner_payouts,
                                                    )}`,
                                                ],
                                                [
                                                    'Pending',
                                                    `ETB ${formatMoney(
                                                        summary.pending_owner_payouts,
                                                    )}`,
                                                ],
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                            Driver Payouts
                                        </h3>

                                        <ReportTable
                                            headers={['Status', 'Amount']}
                                            rows={[
                                                [
                                                    'Total',
                                                    `ETB ${formatMoney(
                                                        summary.driver_payouts,
                                                    )}`,
                                                ],
                                                [
                                                    'Paid',
                                                    `ETB ${formatMoney(
                                                        summary.paid_driver_payouts,
                                                    )}`,
                                                ],
                                                [
                                                    'Pending',
                                                    `ETB ${formatMoney(
                                                        summary.pending_driver_payouts,
                                                    )}`,
                                                ],
                                            ]}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Booking Analysis */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="04"
                                    title="Booking Analysis"
                                    icon={
                                        <CheckCircle2 className="h-4 w-4" />
                                    }
                                />

                                {bookingStatusEntries.length === 0 ? (
                                    <EmptyReportState />
                                ) : (
                                    <ReportTable
                                        headers={[
                                            'Booking Status',
                                            'Number of Bookings',
                                            'Share',
                                        ]}
                                        rows={bookingStatusEntries.map(
                                            ([status, count]) => [
                                                formatLabel(status),
                                                count,
                                                `${(
                                                    (count /
                                                        Math.max(
                                                            summary.total_bookings,
                                                            1,
                                                        )) *
                                                    100
                                                ).toFixed(1)}%`,
                                            ],
                                        )}
                                    />
                                )}
                            </section>

                            {/* Payment Analysis */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="05"
                                    title="Payment Analysis"
                                    icon={<CreditCard className="h-4 w-4" />}
                                />

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                            Payments by Type
                                        </h3>

                                        {paymentTypeEntries.length === 0 ? (
                                            <EmptyReportState />
                                        ) : (
                                            <ReportTable
                                                headers={['Payment Type', 'Amount']}
                                                rows={paymentTypeEntries.map(
                                                    ([type, amount]) => [
                                                        formatLabel(type),
                                                        `ETB ${formatMoney(
                                                            amount,
                                                        )}`,
                                                    ],
                                                )}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                            Payments by Method
                                        </h3>

                                        {paymentMethodEntries.length === 0 ? (
                                            <EmptyReportState />
                                        ) : (
                                            <ReportTable
                                                headers={[
                                                    'Payment Method',
                                                    'Amount',
                                                ]}
                                                rows={paymentMethodEntries.map(
                                                    ([method, amount]) => [
                                                        formatLabel(method),
                                                        `ETB ${formatMoney(
                                                            amount,
                                                        )}`,
                                                    ],
                                                )}
                                            />
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Revenue Trend */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="06"
                                    title="Revenue Trend"
                                    icon={
                                        <CircleDollarSign className="h-4 w-4" />
                                    }
                                />

                                {revenueByDate.length === 0 ? (
                                    <EmptyReportState />
                                ) : (
                                    <div className="mt-5">
                                        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                                            <span>Daily revenue</span>
                                            <span>
                                                {revenueByDate.length} reporting
                                                days
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {revenueByDate.map((item) => (
                                                <div
                                                    key={item.date}
                                                    className="grid grid-cols-[100px_1fr_120px] items-center gap-3"
                                                >
                                                    <span className="text-xs text-slate-500">
                                                        {formatDate(item.date)}
                                                    </span>

                                                    <div className="h-5 overflow-hidden rounded-sm bg-slate-100">
                                                        <div
                                                            className="h-full rounded-sm bg-slate-800"
                                                            style={{
                                                                width: `${Math.max(
                                                                    (Number(
                                                                        item.total,
                                                                    ) /
                                                                        maxRevenue) *
                                                                        100,
                                                                    2,
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="text-right text-xs font-semibold text-slate-700">
                                                        ETB{' '}
                                                        {formatMoney(
                                                            item.total,
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Fleet Performance */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="07"
                                    title="Fleet Performance"
                                    icon={<Car className="h-4 w-4" />}
                                />

                                <div className="mb-5 grid grid-cols-3 border border-slate-200">
                                    <SummaryItem
                                        label="Total Cars"
                                        value={summary.total_cars}
                                    />

                                    <SummaryItem
                                        label="Available"
                                        value={summary.available_cars}
                                    />

                                    <SummaryItem
                                        label="Currently Booked"
                                        value={summary.booked_cars}
                                    />
                                </div>

                                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                    Top Cars by Bookings
                                </h3>

                                {topCars.length === 0 ? (
                                    <EmptyReportState />
                                ) : (
                                    <ReportTable
                                        headers={[
                                            'Rank',
                                            'Vehicle',
                                            'Plate Number',
                                            'Bookings',
                                        ]}
                                        rows={topCars.map((car, index) => [
                                            index + 1,
                                            car.car,
                                            car.plate_number ??
                                                'Not available',
                                            car.bookings_count,
                                        ])}
                                    />
                                )}
                            </section>

                            {/* Inspection Report */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="08"
                                    title="Inspection Report"
                                    icon={
                                        <ClipboardCheck className="h-4 w-4" />
                                    }
                                />

                                <ReportTable
                                    headers={['Inspection Result', 'Count']}
                                    rows={[
                                        [
                                            'Total Inspections',
                                            summary.total_inspections,
                                        ],
                                        [
                                            'Approved',
                                            summary.approved_inspections,
                                        ],
                                        [
                                            'Issues Found',
                                            summary.issues_found,
                                        ],
                                    ]}
                                />
                            </section>

                            {/* Refund Report */}
                            <section className="report-section mt-10">
                                <SectionHeading
                                    number="09"
                                    title="Refund Report"
                                    icon={<RefreshCcw className="h-4 w-4" />}
                                />

                                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                                    <InlineMetric
                                        label="Processed Refunds"
                                        value={`ETB ${formatMoney(
                                            summary.processed_refunds,
                                        )}`}
                                    />

                                    <InlineMetric
                                        label="Pending Refunds"
                                        value={`ETB ${formatMoney(
                                            summary.pending_refunds,
                                        )}`}
                                    />
                                </div>

                                {refundStatusEntries.length === 0 ? (
                                    <EmptyReportState />
                                ) : (
                                    <ReportTable
                                        headers={[
                                            'Refund Status',
                                            'Count',
                                            'Amount',
                                        ]}
                                        rows={refundStatusEntries.map(
                                            ([status, data]) => [
                                                formatLabel(status),
                                                data.count,
                                                `ETB ${formatMoney(
                                                    data.amount,
                                                )}`,
                                            ],
                                        )}
                                    />
                                )}
                            </section>

                            {/* Report Footer */}
                            <footer className="mt-12 border-t-2 border-slate-900 pt-5">
                                <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                                    <p>
                                        Ethio Car Rental · Administrative Report
                                    </p>

                                    <p>
                                        Generated on {reportGeneratedAt}
                                    </p>
                                </div>
                            </footer>
                        </div>
                    </article>
                </div>
            </div>

            {/* Print / PDF Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 14mm;
                    }

                    html,
                    body {
                        background: white !important;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    #app {
                        background: white !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #report-document,
                    #report-document * {
                        visibility: visible;
                    }

                    #report-document {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                    }

                    .report-section {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    table {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </>
    );
}

function SectionHeading({
    number,
    title,
    icon,
}: {
    number: string;
    title: string;
   icon: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                {number}
            </div>

            <div className="flex items-center gap-2">
                <span className="text-slate-600">{icon}</span>

                <h2 className="text-base font-bold text-slate-900">
                    {title}
                </h2>
            </div>
        </div>
    );
}

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="border-b border-r border-slate-200 px-4 py-4 last:border-r-0 sm:border-b-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
        </div>
    );
}

function InlineMetric({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="border-l-2 border-slate-300 pl-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
        </div>
    );
}

function ReportTable({
    headers,
    rows,
}: {
    headers: string[];
    rows: React.ReactNode[][];
    emphasizeLast?: boolean;
}) {
    return (
        <div className="overflow-hidden border border-slate-200">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-slate-300 bg-slate-50">
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-b border-slate-100 last:border-b-0"
                        >
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className={`px-4 py-3 text-slate-700 ${
                                        cellIndex === row.length - 1
                                            ? 'font-semibold text-slate-900'
                                            : ''
                                    }`}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EmptyReportState() {
    return (
        <div className="border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-400">
            No data available for this section.
        </div>
    );
}