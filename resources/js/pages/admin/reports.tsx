import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    Car,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardCheck,
    CreditCard,
    Download,
    FileDown,
    FileSpreadsheet,
    FileText,
    RefreshCcw,
    Users,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

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

type TopCustomer = {
    name: string;
    email: string | null;
    bookings_count: number;
};

type TopOwner = {
    name: string;
    email: string | null;
    cars_count: number;
};

type TopDriver = {
    name: string;
    email: string | null;
    assignments_count: number;
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
    topCustomers: TopCustomer[];
    topOwners: TopOwner[];
    topDrivers: TopDriver[];
    refundStatuses: Record<string, RefundStatus>;
    revenueByDate: RevenuePoint[];
    filters: {
        from: string | null;
        to: string | null;
    };
};

type SectionKey =
    | 'executive'
    | 'financial'
    | 'payouts'
    | 'bookings'
    | 'payments'
    | 'revenue'
    | 'fleet'
    | 'customers'
    | 'owners'
    | 'drivers'
    | 'inspections'
    | 'refunds';

type Section = {
    key: SectionKey;
    label: string;
    icon: ReactNode;
};

const REPORT_SECTIONS: Section[] = [
    {
        key: 'executive',
        label: 'Executive Summary',
        icon: <FileText className="h-4 w-4" />,
    },
    {
        key: 'financial',
        label: 'Financial Summary',
        icon: <CircleDollarSign className="h-4 w-4" />,
    },
    {
        key: 'payouts',
        label: 'Payouts',
        icon: <Wallet className="h-4 w-4" />,
    },
    {
        key: 'bookings',
        label: 'Bookings',
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
        key: 'payments',
        label: 'Payments',
        icon: <CreditCard className="h-4 w-4" />,
    },
    {
        key: 'revenue',
        label: 'Revenue',
        icon: <CircleDollarSign className="h-4 w-4" />,
    },
    {
        key: 'fleet',
        label: 'Fleet',
        icon: <Car className="h-4 w-4" />,
    },
    {
        key: 'customers',
        label: 'Customers',
        icon: <Users className="h-4 w-4" />,
    },
    {
        key: 'owners',
        label: 'Owners',
        icon: <Users className="h-4 w-4" />,
    },
    {
        key: 'drivers',
        label: 'Drivers',
        icon: <Users className="h-4 w-4" />,
    },
    {
        key: 'inspections',
        label: 'Inspections',
        icon: <ClipboardCheck className="h-4 w-4" />,
    },
    {
        key: 'refunds',
        label: 'Refunds',
        icon: <RefreshCcw className="h-4 w-4" />,
    },
];

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

function formatShortDate(value: string): string {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getSectionExportKey(section: SectionKey): string {
    const mapping: Record<SectionKey, string> = {
        executive: 'summary',
        financial: 'summary',
        payouts: 'summary',
        bookings: 'bookingStatuses',
        payments: 'paymentTypes',
        revenue: 'revenueByDate',
        fleet: 'topCars',
        customers: 'topCustomers',
        owners: 'topOwners',
        drivers: 'topDrivers',
        inspections: 'summary',
        refunds: 'refundStatuses',
    };

    return mapping[section];
}

function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}) {
    if (totalItems === 0 || totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
                Page {currentPage} of {totalPages} · {totalItems} total records
            </p>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex h-8 min-w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700">
                    {currentPage}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="gap-1"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function PaginatedRows<T>(
    items: T[],
    page: number,
    pageSize = 10,
) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;

    return {
        rows: items.slice(start, start + pageSize),
        totalPages,
    };
}

function SectionHeader({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                        {icon}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">
                        {title}
                    </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">{description}</p>
            </div>
        </div>
    );
}

function MetricCard({
    label,
    value,
    description,
}: {
    label: string;
    value: ReactNode;
    description?: string;
}) {
    return (
        <div className="border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-xs text-slate-500">{description}</p>
            )}
        </div>
    );
}

function ReportTable({
    headers,
    rows,
}: {
    headers: string[];
    rows: ReactNode[][];
}) {
    return (
        <div className="overflow-x-auto border border-slate-200">
            <table className="w-full min-w-[600px] border-collapse text-sm">
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
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
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
        <div className="border border-dashed border-slate-300 px-5 py-10 text-center">
            <FileText className="mx-auto h-7 w-7 text-slate-300" />

            <p className="mt-2 text-sm font-medium text-slate-500">
                No data available
            </p>

            <p className="mt-1 text-xs text-slate-400">
                There are no records for this section and reporting period.
            </p>
        </div>
    );
}

export default function Reports({
    summary,
    bookingStatuses,
    paymentTypes,
    paymentMethods,
    topCars,
    topCustomers,
    topOwners,
    topDrivers,
    refundStatuses,
    revenueByDate,
    filters,
}: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const [activeSection, setActiveSection] =
        useState<SectionKey>('executive');

    const [customerPage, setCustomerPage] = useState(1);
    const [ownerPage, setOwnerPage] = useState(1);
    const [driverPage, setDriverPage] = useState(1);
    const [carPage, setCarPage] = useState(1);
    const [revenuePage, setRevenuePage] = useState(1);

    const pageSize = 10;

    const submitFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setCustomerPage(1);
        setOwnerPage(1);
        setDriverPage(1);
        setCarPage(1);
        setRevenuePage(1);

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

        setCustomerPage(1);
        setOwnerPage(1);
        setDriverPage(1);
        setCarPage(1);
        setRevenuePage(1);

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

    const exportCsv = (section?: SectionKey) => {
        const params = new URLSearchParams();

        if (from) {
            params.append('from', from);
        }

        if (to) {
            params.append('to', to);
        }

        if (section) {
            params.append('section', getSectionExportKey(section));
        }

        window.location.href = `/admin/reports/csv?${params.toString()}`;
    };

    const bookingStatusEntries = Object.entries(bookingStatuses);
    const paymentTypeEntries = Object.entries(paymentTypes);
    const paymentMethodEntries = Object.entries(paymentMethods);
    const refundStatusEntries = Object.entries(refundStatuses);

    const paginatedCustomers = PaginatedRows(
    topCustomers,
    customerPage,
    pageSize,
);

const paginatedOwners = PaginatedRows(
    topOwners,
    ownerPage,
    pageSize,
);

   const paginatedDrivers = PaginatedRows(
    topDrivers,
    driverPage,
    pageSize,
);

    const paginatedCars = PaginatedRows(
    topCars,
    carPage,
    pageSize,
);

    const paginatedRevenue = PaginatedRows(
    revenueByDate,
    revenuePage,
    pageSize,
);

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

    const activeSectionInfo =
        REPORT_SECTIONS.find((section) => section.key === activeSection) ??
        REPORT_SECTIONS[0];

    return (
        <>
            <Head title="Reports" />

            <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Page Header */}
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                                <FileText className="h-4 w-4" />
                                Business Reporting
                            </div>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                Reports
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Review operational, financial, fleet, customer,
                                owner, and driver performance.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => exportCsv()}
                                className="gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Export Full CSV
                            </Button>

                            <Button
                                type="button"
                                onClick={exportPdf}
                                className="gap-2"
                            >
                                <FileDown className="h-4 w-4" />
                                Export PDF
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 border border-slate-200 bg-white shadow-sm">
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

                    {/* Report Navigation */}
                    <div className="mb-6 overflow-x-auto border border-slate-200 bg-white shadow-sm">
                        <div className="flex min-w-max">
                            {REPORT_SECTIONS.map((section) => {
                                const isActive =
                                    section.key === activeSection;

                                return (
                                    <button
                                        key={section.key}
                                        type="button"
                                        onClick={() => {
                                            setActiveSection(section.key);
                                            window.scrollTo({
                                                top: 0,
                                                behavior: 'smooth',
                                            });
                                        }}
                                        className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition ${
                                            isActive
                                                ? 'border-slate-900 bg-slate-50 text-slate-900'
                                                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                        }`}
                                    >
                                        {section.icon}
                                        {section.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Report */}
                    <article className="border border-slate-200 bg-white shadow-sm">
                        {/* Report Header */}
                        <header className="border-b-2 border-slate-900 px-6 py-7 sm:px-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
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

                                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                                        {activeSectionInfo.label}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Reporting period: {reportPeriod}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            exportCsv(activeSection)
                                        }
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export Section CSV
                                    </Button>
                                </div>
                            </div>
                        </header>

                        <div className="p-6 sm:p-8">
                            {/* Executive Summary */}
                            {activeSection === 'executive' && (
                                <section>
                                    <SectionHeader
                                        title="Executive Summary"
                                        description="High-level overview of the rental business during the selected period."
                                        icon={
                                            <FileText className="h-4 w-4" />
                                        }
                                    />

                                    <div className="grid grid-cols-1 gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                                        <MetricCard
                                            label="Total Bookings"
                                            value={summary.total_bookings}
                                        />

                                        <MetricCard
                                            label="Completed Bookings"
                                            value={summary.completed_bookings}
                                        />

                                        <MetricCard
                                            label="Total Revenue"
                                            value={`ETB ${formatMoney(
                                                summary.total_revenue,
                                            )}`}
                                        />

                                        <MetricCard
                                            label="Company Commission"
                                            value={`ETB ${formatMoney(
                                                summary.company_commission,
                                            )}`}
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <ReportTable
                                            headers={['Executive Metric', 'Value']}
                                            rows={[
                                                [
                                                    'Confirmed Bookings',
                                                    summary.confirmed_bookings,
                                                ],
                                                [
                                                    'Cancelled Bookings',
                                                    summary.cancelled_bookings,
                                                ],
                                                [
                                                    'Total Payments Received',
                                                    `ETB ${formatMoney(
                                                        summary.total_payments,
                                                    )}`,
                                                ],
                                                [
                                                    'Total Cars',
                                                    summary.total_cars,
                                                ],
                                                [
                                                    'Available Cars',
                                                    summary.available_cars,
                                                ],
                                                [
                                                    'Currently Booked Cars',
                                                    summary.booked_cars,
                                                ],
                                                [
                                                    'Total Inspections',
                                                    summary.total_inspections,
                                                ],
                                                [
                                                    'Issues Found',
                                                    summary.issues_found,
                                                ],
                                            ]}
                                        />
                                    </div>
                                </section>
                            )}

                            {/* Financial Summary */}
                            {activeSection === 'financial' && (
                                <section>
                                    <SectionHeader
                                        title="Financial Summary"
                                        description="Revenue, deposits, refunds, and company commission generated during the selected period."
                                        icon={
                                            <CircleDollarSign className="h-4 w-4" />
                                        }
                                    />

                                    <ReportTable
                                        headers={[
                                            'Financial Item',
                                            'Amount',
                                        ]}
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
                                                'Total Payments Received',
                                                `ETB ${formatMoney(
                                                    summary.total_payments,
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
                                            [
                                                'Processed Refunds',
                                                `ETB ${formatMoney(
                                                    summary.processed_refunds,
                                                )}`,
                                            ],
                                            [
                                                'Pending Refunds',
                                                `ETB ${formatMoney(
                                                    summary.pending_refunds,
                                                )}`,
                                            ],
                                        ]}
                                    />
                                </section>
                            )}

                            {/* Payouts */}
                            {activeSection === 'payouts' && (
                                <section>
                                    <SectionHeader
                                        title="Payout Summary"
                                        description="Owner and driver earnings and payout status."
                                        icon={<Wallet className="h-4 w-4" />}
                                    />

                                    <ReportTable
                                        headers={[
                                            'Payout Type',
                                            'Total',
                                            'Paid',
                                            'Pending',
                                        ]}
                                        rows={[
                                            [
                                                'Owner Payouts',
                                                `ETB ${formatMoney(
                                                    summary.owner_payouts,
                                                )}`,
                                                `ETB ${formatMoney(
                                                    summary.paid_owner_payouts,
                                                )}`,
                                                `ETB ${formatMoney(
                                                    summary.pending_owner_payouts,
                                                )}`,
                                            ],
                                            [
                                                'Driver Payouts',
                                                `ETB ${formatMoney(
                                                    summary.driver_payouts,
                                                )}`,
                                                `ETB ${formatMoney(
                                                    summary.paid_driver_payouts,
                                                )}`,
                                                `ETB ${formatMoney(
                                                    summary.pending_driver_payouts,
                                                )}`,
                                            ],
                                        ]}
                                    />
                                </section>
                            )}

                            {/* Bookings */}
                            {activeSection === 'bookings' && (
                                <section>
                                    <SectionHeader
                                        title="Booking Analysis"
                                        description="Breakdown of bookings by their current status."
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
                            )}

                            {/* Payments */}
                            {activeSection === 'payments' && (
                                <section>
                                    <SectionHeader
                                        title="Payment Analysis"
                                        description="Payments grouped by payment type and payment method."
                                        icon={
                                            <CreditCard className="h-4 w-4" />
                                        }
                                    />

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                                Payments by Type
                                            </h3>

                                            {paymentTypeEntries.length ===
                                            0 ? (
                                                <EmptyReportState />
                                            ) : (
                                                <ReportTable
                                                    headers={[
                                                        'Payment Type',
                                                        'Amount',
                                                    ]}
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

                                            {paymentMethodEntries.length ===
                                            0 ? (
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
                            )}

                            {/* Revenue */}
                            {activeSection === 'revenue' && (
                                <section>
                                    <SectionHeader
                                        title="Revenue Trend"
                                        description="Daily rental and extra-charge revenue during the selected period."
                                        icon={
                                            <CircleDollarSign className="h-4 w-4" />
                                        }
                                    />

                                    {revenueByDate.length === 0 ? (
                                        <EmptyReportState />
                                    ) : (
                                        <>
                                            <ReportTable
                                                headers={[
                                                    'Date',
                                                    'Revenue',
                                                    'Relative Performance',
                                                ]}
                                                rows={paginatedRevenue.rows.map(
                                                    (item) => [
                                                        formatShortDate(
                                                            item.date,
                                                        ),
                                                        `ETB ${formatMoney(
                                                            item.total,
                                                        )}`,
                                                        <div
                                                            key={item.date}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className="h-full rounded-full bg-slate-800"
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

                                                            <span className="w-12 text-right text-xs text-slate-500">
                                                                {(
                                                                    (Number(
                                                                        item.total,
                                                                    ) /
                                                                        maxRevenue) *
                                                                    100
                                                                ).toFixed(0)}
                                                                %
                                                            </span>
                                                        </div>,
                                                    ],
                                                )}
                                            />

                                            <Pagination
                                                currentPage={revenuePage}
                                                totalPages={
                                                    paginatedRevenue.totalPages
                                                }
                                                totalItems={
                                                    revenueByDate.length
                                                }
                                                onPageChange={setRevenuePage}
                                            />
                                        </>
                                    )}
                                </section>
                            )}

                            {/* Fleet */}
                            {activeSection === 'fleet' && (
                                <section>
                                    <SectionHeader
                                        title="Fleet Performance"
                                        description="Current fleet availability and the cars generating the most bookings."
                                        icon={<Car className="h-4 w-4" />}
                                    />

                                    <div className="mb-6 grid grid-cols-1 gap-px border border-slate-200 bg-slate-200 sm:grid-cols-3">
                                        <MetricCard
                                            label="Total Cars"
                                            value={summary.total_cars}
                                        />

                                        <MetricCard
                                            label="Available Cars"
                                            value={summary.available_cars}
                                        />

                                        <MetricCard
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
                                        <>
                                            <ReportTable
                                                headers={[
                                                    'Rank',
                                                    'Vehicle',
                                                    'Plate Number',
                                                    'Bookings',
                                                ]}
                                                rows={paginatedCars.rows.map(
                                                    (car, index) => {
                                                        const actualIndex =
                                                            (carPage - 1) *
                                                                pageSize +
                                                            index +
                                                            1;

                                                        return [
                                                            actualIndex,
                                                            car.car,
                                                            car.plate_number ??
                                                                'Not available',
                                                            car.bookings_count,
                                                        ];
                                                    },
                                                )}
                                            />

                                            <Pagination
                                                currentPage={carPage}
                                                totalPages={
                                                    paginatedCars.totalPages
                                                }
                                                totalItems={topCars.length}
                                                onPageChange={setCarPage}
                                            />
                                        </>
                                    )}
                                </section>
                            )}

                            {/* Customers */}
                            {activeSection === 'customers' && (
                                <section>
                                    <SectionHeader
                                        title="Customer Performance"
                                        description="Customers ranked by the number of bookings they made."
                                        icon={<Users className="h-4 w-4" />}
                                    />

                                    {topCustomers.length === 0 ? (
                                        <EmptyReportState />
                                    ) : (
                                        <>
                                            <ReportTable
                                                headers={[
                                                    'Rank',
                                                    'Customer',
                                                    'Email',
                                                    'Bookings',
                                                ]}
                                                rows={paginatedCustomers.rows.map(
                                                    (customer, index) => {
                                                        const actualIndex =
                                                            (customerPage - 1) *
                                                                pageSize +
                                                            index +
                                                            1;

                                                        return [
                                                            actualIndex,
                                                            customer.name,
                                                            customer.email ??
                                                                'Not available',
                                                            customer.bookings_count,
                                                        ];
                                                    },
                                                )}
                                            />

                                            <Pagination
                                                currentPage={customerPage}
                                                totalPages={
                                                    paginatedCustomers.totalPages
                                                }
                                                totalItems={
                                                    topCustomers.length
                                                }
                                                onPageChange={setCustomerPage}
                                            />
                                        </>
                                    )}
                                </section>
                            )}

                            {/* Owners */}
                            {activeSection === 'owners' && (
                                <section>
                                    <SectionHeader
                                        title="Owner Performance"
                                        description="Owners ranked by the number of cars they registered in the selected period."
                                        icon={<Users className="h-4 w-4" />}
                                    />

                                    {topOwners.length === 0 ? (
                                        <EmptyReportState />
                                    ) : (
                                        <>
                                            <ReportTable
                                                headers={[
                                                    'Rank',
                                                    'Owner',
                                                    'Email',
                                                    'Cars Registered',
                                                ]}
                                                rows={paginatedOwners.rows.map(
                                                    (owner, index) => {
                                                        const actualIndex =
                                                            (ownerPage - 1) *
                                                                pageSize +
                                                            index +
                                                            1;

                                                        return [
                                                            actualIndex,
                                                            owner.name,
                                                            owner.email ??
                                                                'Not available',
                                                            owner.cars_count,
                                                        ];
                                                    },
                                                )}
                                            />

                                            <Pagination
                                                currentPage={ownerPage}
                                                totalPages={
                                                    paginatedOwners.totalPages
                                                }
                                                totalItems={topOwners.length}
                                                onPageChange={setOwnerPage}
                                            />
                                        </>
                                    )}
                                </section>
                            )}

                            {/* Drivers */}
                            {activeSection === 'drivers' && (
                                <section>
                                    <SectionHeader
                                        title="Driver Performance"
                                        description="Drivers ranked by assignments they accepted and completed."
                                        icon={<Users className="h-4 w-4" />}
                                    />

                                    {topDrivers.length === 0 ? (
                                        <EmptyReportState />
                                    ) : (
                                        <>
                                            <ReportTable
                                                headers={[
                                                    'Rank',
                                                    'Driver',
                                                    'Email',
                                                    'Assignments Accepted',
                                                ]}
                                                rows={paginatedDrivers.rows.map(
                                                    (driver, index) => {
                                                        const actualIndex =
                                                            (driverPage - 1) *
                                                                pageSize +
                                                            index +
                                                            1;

                                                        return [
                                                            actualIndex,
                                                            driver.name,
                                                            driver.email ??
                                                                'Not available',
                                                            driver.assignments_count,
                                                        ];
                                                    },
                                                )}
                                            />

                                            <Pagination
                                                currentPage={driverPage}
                                                totalPages={
                                                    paginatedDrivers.totalPages
                                                }
                                                totalItems={topDrivers.length}
                                                onPageChange={setDriverPage}
                                            />
                                        </>
                                    )}
                                </section>
                            )}

                            {/* Inspections */}
                            {activeSection === 'inspections' && (
                                <section>
                                    <SectionHeader
                                        title="Inspection Report"
                                        description="Inspection activity and results during the selected period."
                                        icon={
                                            <ClipboardCheck className="h-4 w-4" />
                                        }
                                    />

                                    <ReportTable
                                        headers={[
                                            'Inspection Result',
                                            'Count',
                                        ]}
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
                            )}

                            {/* Refunds */}
                            {activeSection === 'refunds' && (
                                <section>
                                    <SectionHeader
                                        title="Refund Report"
                                        description="Refunds grouped by status, including count and total amount."
                                        icon={
                                            <RefreshCcw className="h-4 w-4" />
                                        }
                                    />

                                    <div className="mb-6 grid grid-cols-1 gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2">
                                        <MetricCard
                                            label="Processed Refunds"
                                            value={`ETB ${formatMoney(
                                                summary.processed_refunds,
                                            )}`}
                                        />

                                        <MetricCard
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
                            )}

                            {/* Footer */}
                            <footer className="mt-10 border-t-2 border-slate-900 pt-5">
                                <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                                    <p>
                                        Ethio Car Rental · Administrative
                                        Report
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
        </>
    );
}