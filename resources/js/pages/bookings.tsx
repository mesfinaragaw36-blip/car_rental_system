import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    Search,
    Ban,
    Eye,
    Car,
    Calendar,
    MapPin,
    CircleDollarSign,
    Clock,
    User,
    Activity,
    CheckCheck,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { useCan } from '@/hooks/use-can';
import { approve, reject, cancel, complete } from '@/routes/bookings';

interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    picked_up_at: string | null;
    returned_at: string | null;
    has_dispute?: boolean;
    total_price: string;
    need_driver: boolean;
    notes?: string | null;

    customer?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
    };

    owner?: {
        id: number;
        name: string;
    };

    car: {
        id: number;
        brand: string;
        model: string;
        year?: number;
        plate_number?: string;
        images?: {
            id: number;
            image_path: string;
            is_primary: boolean;
        }[];
    } | null;

    payment: {
        id: number;
        payment_method: string;
        payment_status: string;
        paid_at: string | null;
    } | null;
    identity_approved?: boolean;
    identity_status?: string | null;
    driver_assignment?: {
        driver: {
            id: number;
            name: string;
        } | null;
        status?: string;
    } | null;
}

interface Props {
    role: string;

    bookings: {
        data: Booking[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };

    filters?: {
        status?: string;
        search?: string;
    };

    stats?: {
        total: number;
        awaiting_deposit: number;
        deposit_paid: number;
        active: number;
        completed: number;
        cancelled: number;
    };
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-50/40 text-amber-700 border-amber-200',
    confirmed: 'bg-amber-50/40 text-amber-700 border-amber-200',
    approved: 'bg-accent/70 text-primary border-accent',
    rejected: 'bg-red-50/60 text-red-700 border-red-200',
    deposit_paid: 'bg-accent/70 text-primary border-accent',
    paid: 'bg-emerald-50/60 text-emerald-700 border-emerald-200',
    picked_up: 'bg-accent/70 text-primary border-accent',
    returned: 'bg-accent/70 text-primary border-accent',
    completed: 'bg-green-50/60 text-green-700 border-green-200',
    cancelled: 'bg-slate-50/60 text-slate-700 border-slate-200',
};

const STAT_ICONS: Record<string, React.ReactNode> = {
    Total: <Activity className="h-5 w-5" />,
    'Awaiting Deposit': <Clock className="h-5 w-5 text-amber-600" />,
    'Deposit Paid': <CheckCircle className="h-5 w-5 text-primary" />,
    Active: <Car className="h-5 w-5 text-primary" />,
    Completed: <CheckCheck className="h-5 w-5 text-emerald-600" />,
    Cancelled: <XCircle className="h-5 w-5 text-slate-600" />,
};

const hasAssignedDriver = (booking: Booking): boolean => {
    // If no driver needed, always return true
    if (!booking.need_driver) {
        return true;
    }

    // If customer selected "Auto Assignment" or a specific driver,
    // allow them to pay deposit. Driver will be assigned after deposit + inspection.
    // No need to wait for driver assignment before payment.
    return true;
};

export default function Bookings({ role, bookings, filters, stats }: Props) {
    const { props: p } = usePage<{
        toast?: {
            type: string;
            message: string;
        };
    }>();

    const toast = p.toast;
    const can = useCan();

    const [searchTerm, setSearchTerm] = useState(filters?.search ?? '');

    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    const handleAction = (bookingId: number, action: string) => {
        const routeMap: Record<string, () => string> = {
            approve: () =>
                approve.url({
                    booking: bookingId,
                }),

            reject: () =>
                reject.url({
                    booking: bookingId,
                }),

            cancel: () =>
                cancel.url({
                    booking: bookingId,
                }),

            complete: () =>
                complete.url({
                    booking: bookingId,
                }),
        };

        if (!routeMap[action]) {
            return;
        }

        router.post(
            routeMap[action](),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const applyFilters = () => {
        router.get(
            '/bookings',
            {
                search: searchTerm || undefined,
                status:
                    statusFilter && statusFilter !== 'all'
                        ? statusFilter
                        : undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <>
            <Head title="Bookings" />

            <div className="space-y-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Bookings</h1>

                    <p className="mt-2 text-muted-foreground">
                        Track and manage all rental bookings in one place.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Total
                            </p>

                            <p className="mt-1 text-3xl font-bold">
                                {stats?.total ?? bookings.data.length}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Awaiting Deposit
                            </p>

                            <p className="mt-1 text-3xl font-bold text-brand">
                                {stats?.awaiting_deposit ?? 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Deposit Paid
                            </p>

                            <p className="mt-1 text-3xl font-bold text-primary">
                                {stats?.deposit_paid ?? 0}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground">
                                Completed
                            </p>

                            <p className="mt-1 text-3xl font-bold text-green-600">
                                {stats?.completed ?? 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Admin / Owner Stats */}
                {(role === 'admin' || role === 'owner') && stats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {(
                            [
                                ['Total', stats.total],
                                ['Awaiting Deposit', stats.awaiting_deposit],
                                ['Deposit Paid', stats.deposit_paid],
                                ['Active', stats.active],
                                ['Completed', stats.completed],
                                ['Cancelled', stats.cancelled],
                            ] as const
                        ).map(([label, value]) => (
                            <Card
                                key={label}
                                className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md"
                            >
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                                        {STAT_ICONS[label]}
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                            {label}
                                        </p>

                                        <p className="mt-0.5 text-2xl font-bold">
                                            {value}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Toast */}
                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'border border-green-200 bg-green-50 text-green-800'
                                : 'border border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            placeholder="Search by car or customer..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            className="h-11 rounded-xl pl-10"
                        />
                    </div>

                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="h-11 w-44 rounded-xl">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>

                            {Object.keys(STATUS_STYLES).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status
                                        .replace('_', ' ')
                                        .replace(/^\w/, (letter) =>
                                            letter.toUpperCase(),
                                        )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={applyFilters}
                        className="rounded-xl bg-primary px-6 hover:bg-primary/90"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                {/* Bookings */}
                {bookings.data.length === 0 ? (
                    <Card className="overflow-hidden rounded-2xl">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Car className="mb-4 h-16 w-16 text-slate-400" />

                            <h2 className="text-xl font-semibold">
                                No bookings found
                            </h2>

                            <p className="mt-2 text-center text-muted-foreground">
                                Try adjusting your filters or check back later.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-5">
                        {bookings.data.map((booking) => {
                            const car = booking.car;

                            const carImage =
                                car?.images?.find((image) => image.is_primary)
                                    ?.image_path ??
                                car?.images?.[0]?.image_path;

                            return (
                                <Card
                                    key={booking.id}
                                    className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
                                >
                                    <div
                                        className={`h-1.5 w-full ${
                                            STATUS_STYLES[
                                                booking.status
                                            ]?.split(' ')[0] ?? 'bg-slate-200'
                                        }`}
                                    />

                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            {/* Booking Information */}
                                            <div className="flex-1 space-y-4">
                                                {/* Car */}
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-16 w-24 overflow-hidden rounded-xl bg-gray-100">
                                                            {carImage ? (
                                                                <img
                                                                    src={`/storage/${carImage}`}
                                                                    alt={
                                                                        car
                                                                            ? `${car.brand} ${car.model}`
                                                                            : 'Car'
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full items-center justify-center">
                                                                    <Car className="h-6 w-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <p className="text-lg font-bold">
                                                                {car
                                                                    ? `${car.brand} ${car.model}`
                                                                    : 'Unknown Car'}
                                                            </p>

                                                            {car?.plate_number && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        car.plate_number
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                                                            STATUS_STYLES[
                                                                booking.status
                                                            ] ??
                                                            'border-slate-200 bg-slate-50 text-slate-700'
                                                        }`}
                                                    >
                                                        {booking.status
                                                            .replace('_', ' ')
                                                            .replace(
                                                                /^\w/,
                                                                (letter) =>
                                                                    letter.toUpperCase(),
                                                            )}
                                                    </span>
                                                </div>

                                                {/* Booking Details */}
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <User className="h-4 w-4 shrink-0" />

                                                        <span>
                                                            {booking.customer
                                                                ?.name ?? 'N/A'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <CircleDollarSign className="h-4 w-4 shrink-0" />

                                                        <span className="font-semibold text-foreground">
                                                            ETB{' '}
                                                            {
                                                                booking.total_price
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4 shrink-0" />

                                                        <span>
                                                            {new Date(
                                                                booking.pickup_date,
                                                            ).toLocaleDateString(
                                                                'en-GB',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                },
                                                            )}

                                                            {' → '}

                                                            {new Date(
                                                                booking.return_date,
                                                            ).toLocaleDateString(
                                                                'en-GB',
                                                                {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                },
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="h-4 w-4 shrink-0" />

                                                        <span className="truncate">
                                                            {
                                                                booking.pickup_location
                                                            }{' '}
                                                            &rarr;{' '}
                                                            {
                                                                booking.return_location
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Driver */}
                                                {booking.need_driver && (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent px-3 py-1 text-xs font-medium text-primary">
                                                        <User className="h-3 w-3" />
                                                        Driver requested
                                                    </span>
                                                )}

                                                {/* Booking Progress */}
                                                <div className="mt-4 flex items-center gap-2 text-xs">
                                                    {[
                                                        'confirmed',
                                                        'deposit_paid',
                                                        'picked_up',
                                                        'returned',
                                                    ].map((step, index) => {
                                                        const statuses = [
                                                            'confirmed',
                                                            'deposit_paid',
                                                            'picked_up',
                                                            'returned',
                                                        ];

                                                        const active =
                                                            statuses.indexOf(
                                                                booking.status,
                                                            ) >= index;

                                                        return (
                                                            <div
                                                                key={step}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <div
                                                                    className={`h-3 w-3 rounded-full ${
                                                                        active
                                                                            ? 'bg-primary'
                                                                            : 'bg-gray-300'
                                                                    }`}
                                                                />

                                                                {index < 3 && (
                                                                    <div className="h-1 w-8 bg-gray-200" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                                                {/* Details */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/bookings/${booking.id}`}
                                                    >
                                                        <Eye className="mr-1.5 h-4 w-4" />
                                                        Details
                                                    </Link>
                                                </Button>

                                                {/* Approve / Reject */}
                                                {booking.status === 'pending' &&
                                                    (role === 'admin' ||
                                                        role === 'owner') && (
                                                        <div className="flex gap-1.5">
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleAction(
                                                                        booking.id,
                                                                        'approve',
                                                                    )
                                                                }
                                                            >
                                                                Approve
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() =>
                                                                    handleAction(
                                                                        booking.id,
                                                                        'reject',
                                                                    )
                                                                }
                                                            >
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}

                                                {/* Customer Cancellation */}
                                                {[
                                                    'confirmed',
                                                    'deposit_paid',
                                                    'paid',
                                                ].includes(booking.status) &&
                                                    role === 'customer' && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleAction(
                                                                    booking.id,
                                                                    'cancel',
                                                                )
                                                            }
                                                        >
                                                            <Ban className="mr-1.5 h-4 w-4" />
                                                            Cancel
                                                        </Button>
                                                    )}

                                                {/* Pickup */}
                                                {booking.status ===
                                                    'picked_up' &&
                                                    (role === 'admin' ||
                                                        role === 'owner') && (
                                                        <span className="text-xs text-muted-foreground">
                                                            Handover handled by
                                                            the inspection team
                                                        </span>
                                                    )}

                                                {/* Complete */}
                                                {booking.status ===
                                                    'returned' &&
                                                    (role === 'owner' ||
                                                        (role === 'admin' &&
                                                            can(
                                                                'bookings.manage',
                                                            ))) && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleAction(
                                                                    booking.id,
                                                                    'complete',
                                                                )
                                                            }
                                                        >
                                                            Mark Completed
                                                        </Button>
                                                    )}

                                                {/* Pay Deposit */}
                                                {role === 'customer' &&
                                                    booking.status ===
                                                        'confirmed' &&
                                                    !booking.payment &&
                                                    hasAssignedDriver(
                                                        booking,
                                                    ) &&
                                                    booking.identity_approved && (
                                                        <Button
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/bookings/${booking.id}/payment`}
                                                            >
                                                                Pay Deposit
                                                            </Link>
                                                        </Button>
                                                    )}

                                                {/* Awaiting ID Approval */}
                                                {role === 'customer' &&
                                                    booking.status ===
                                                        'confirmed' &&
                                                    !booking.payment &&
                                                    booking.identity_approved ===
                                                        false && (
                                                        <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                                                            <Clock className="h-4 w-4" />{' '}
                                                            Awaiting ID approval
                                                        </span>
                                                    )}

                                                {/* Payment Status */}
                                                {role === 'customer' &&
                                                    booking.payment
                                                        ?.payment_status ===
                                                        'paid' && (
                                                        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Paid
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

Bookings.layout = {
    breadcrumbs: [
        {
            title: 'Bookings',
            href: '/bookings',
        },
    ],
};
