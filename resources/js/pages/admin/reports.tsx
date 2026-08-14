import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    CalendarDays,
    Car,
    CircleDollarSign,
    ClipboardCheck,
    CreditCard,
    RefreshCcw,
    TrendingUp,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

type Summary = {
    total_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_revenue: number | string;
    security_deposits: number | string;
    total_refunds: number | string;
    company_commission: number | string;
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

type Props = {
    summary: Summary;
    bookingStatuses: Record<string, number>;
    paymentTypes: Record<string, number>;
    paymentMethods: Record<string, number>;
    topCars: TopCar[];
    refundStatuses: Record<string, RefundStatus>;
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

export default function Reports({
    summary,
    bookingStatuses,
    paymentTypes,
    paymentMethods,
    topCars,
    refundStatuses,
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

    const bookingStatusEntries = Object.entries(bookingStatuses);
    const paymentTypeEntries = Object.entries(paymentTypes);
    const paymentMethodEntries = Object.entries(paymentMethods);
    const refundStatusEntries = Object.entries(refundStatuses);

    const maxBookingStatus = Math.max(
        ...bookingStatusEntries.map(([, count]) => count),
        1,
    );

    const maxPaymentType = Math.max(
        ...paymentTypeEntries.map(([, amount]) => Number(amount)),
        1,
    );

    const maxPaymentMethod = Math.max(
        ...paymentMethodEntries.map(([, amount]) => Number(amount)),
        1,
    );

    return (
        <AppLayout>
            <Head title="Reports" />

            <div className="space-y-6">
                {/* Header */}
                <div
                    className="rounded-2xl p-8 text-white"
                    style={{
                        background:
                            'linear-gradient(135deg, #1A365D 0%, #2D5B8E 100%)',
                    }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Reports
                            </h1>
                            <p className="mt-1 text-blue-200">
                                Platform performance and financial overview.
                            </p>
                        </div>

                        <BarChart3 className="hidden h-10 w-10 text-blue-200 sm:block" />
                    </div>
                </div>

                {/* Date Filters */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="border-b px-6 py-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <CalendarDays className="h-4 w-4" />
                            Report Period
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form
                            onSubmit={submitFilters}
                            className="flex flex-col gap-4 md:flex-row md:items-end"
                        >
                            <div className="flex-1">
                                <label
                                    htmlFor="from"
                                    className="mb-2 block text-sm font-medium"
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
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="flex-1">
                                <label
                                    htmlFor="to"
                                    className="mb-2 block text-sm font-medium"
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
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <Button type="submit">Apply Filter</Button>

                            {(from || to) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Bookings
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        {summary.total_bookings}
                                    </p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Revenue
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        ETB {formatMoney(summary.total_revenue)}
                                    </p>
                                </div>
                                <CircleDollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Commission
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        ETB{' '}
                                        {formatMoney(
                                            summary.company_commission,
                                        )}
                                    </p>
                                </div>
                                <CircleDollarSign className="h-5 w-5 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Refunds
                                    </p>
                                    <p className="mt-1 text-2xl font-bold">
                                        ETB {formatMoney(summary.total_refunds)}
                                    </p>
                                </div>
                                <RefreshCcw className="h-5 w-5 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Summary */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Security Deposits
                            </p>
                            <p className="mt-1 text-xl font-bold">
                                ETB {formatMoney(summary.security_deposits)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Available Cars
                            </p>
                            <p className="mt-1 text-xl font-bold text-emerald-600">
                                {summary.available_cars}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Booked Cars
                            </p>
                            <p className="mt-1 text-xl font-bold text-amber-600">
                                {summary.booked_cars}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Inspections
                            </p>
                            <p className="mt-1 text-xl font-bold">
                                {summary.total_inspections}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Booking + Inspection */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                            <CardTitle className="text-sm font-semibold">
                                Booking Status
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            {bookingStatusEntries.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No booking data available.
                                </p>
                            ) : (
                                bookingStatusEntries.map(
                                    ([status, count]) => (
                                        <div key={status}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm">
                                                    {formatLabel(status)}
                                                </span>
                                                <span className="font-semibold">
                                                    {count}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-blue-700"
                                                    style={{
                                                        width: `${(count / maxBookingStatus) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <ClipboardCheck className="h-4 w-4" />
                                Inspection Summary
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Total Inspections
                                </span>
                                <span className="text-lg font-bold">
                                    {summary.total_inspections}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Approved
                                </span>
                                <span className="text-lg font-bold text-emerald-600">
                                    {summary.approved_inspections}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Issues Found
                                </span>
                                <span className="text-lg font-bold text-red-600">
                                    {summary.issues_found}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payments */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                <CreditCard className="h-4 w-4" />
                                Payments by Type
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            {paymentTypeEntries.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No payment data available.
                                </p>
                            ) : (
                                paymentTypeEntries.map(([type, amount]) => (
                                    <div key={type}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm">
                                                {formatLabel(type)}
                                            </span>
                                            <span className="font-semibold">
                                                ETB {formatMoney(amount)}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-600"
                                                style={{
                                                    width: `${(Number(amount) / maxPaymentType) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                            <CardTitle className="text-sm font-semibold">
                                Payments by Method
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            {paymentMethodEntries.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No payment data available.
                                </p>
                            ) : (
                                paymentMethodEntries.map(
                                    ([method, amount]) => (
                                        <div key={method}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-sm">
                                                    {formatLabel(method)}
                                                </span>
                                                <span className="font-semibold">
                                                    ETB {formatMoney(amount)}
                                                </span>
                                            </div>

                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-orange-500"
                                                    style={{
                                                        width: `${(Number(amount) / maxPaymentMethod) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Top Cars */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <Car className="h-4 w-4" />
                            Top Cars by Bookings
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {topCars.length === 0 ? (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                No booking data available.
                            </p>
                        ) : (
                            <div className="divide-y">
                                {topCars.map((car, index) => (
                                    <div
                                        key={`${car.plate_number ?? car.car}-${index}`}
                                        className="flex items-center justify-between px-6 py-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                                                {index + 1}
                                            </div>

                                            <div>
                                                <p className="font-medium">
                                                    {car.car}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {car.plate_number ??
                                                        'No plate number'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold">
                                                {car.bookings_count}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                bookings
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Refunds */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <RefreshCcw className="h-4 w-4" />
                            Refund Summary
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        {refundStatusEntries.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No refund data available.
                            </p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {refundStatusEntries.map(
                                    ([status, data]) => (
                                        <div
                                            key={status}
                                            className="rounded-xl border p-4"
                                        >
                                            <p className="text-sm text-muted-foreground">
                                                {formatLabel(status)}
                                            </p>

                                            <p className="mt-1 text-2xl font-bold">
                                                {data.count}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                ETB{' '}
                                                {formatMoney(data.amount)}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}