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
import { approve, reject, cancel, complete, ownerNoShow } from '@/routes/bookings';

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
    customer?: { id: number; name: string; email?: string; phone?: string };
    owner?: { id: number; name: string };
    car: {
        id: number;
        brand: string;
        model: string;
        year?: number;
        plate_number?: string;
        image?: string;
    };
    payment: {
        id: number;
        payment_method: string;
        payment_status: string;
        paid_at: string | null;
    } | null;
    driver_assignment?: {
        driver: { id: number; name: string } | null;
        status?: string;
    } | null;
}

interface Props {
    role: string;
    bookings: {
        data: Booking[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters?: { status?: string; search?: string };
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
    approved: 'bg-blue-50/60 text-blue-700 border-blue-200',
    rejected: 'bg-red-50/60 text-red-700 border-red-200',
    deposit_paid: 'bg-blue-50/60 text-blue-700 border-blue-200',
    paid: 'bg-emerald-50/60 text-emerald-700 border-emerald-200',
    picked_up: 'bg-purple-50/60 text-purple-700 border-purple-200',
    returned: 'bg-indigo-50/60 text-indigo-700 border-indigo-200',
    completed: 'bg-green-50/60 text-green-700 border-green-200',
    cancelled: 'bg-slate-50/60 text-slate-700 border-slate-200',
};

const STAT_ICONS: Record<string, React.ReactNode> = {
    Total: <Activity className="h-5 w-5" />,
    'Awaiting Deposit': <Clock className="h-5 w-5 text-amber-600" />,
    'Deposit Paid': <CheckCircle className="h-5 w-5 text-blue-600" />,
    Active: <Car className="h-5 w-5 text-blue-600" />,
    Completed: <CheckCheck className="h-5 w-5 text-emerald-600" />,
    Cancelled: <XCircle className="h-5 w-5 text-slate-600" />,
};

const hasAssignedDriver = (booking: Booking): boolean => {
    if (!booking.need_driver) {
        return true;
    }

    const status = booking.driver_assignment?.status;

    return status === 'assigned' || status === 'accepted';
};

export default function Bookings({ role, bookings, filters, stats }: Props) {
    const { props: p } = usePage<{
        toast?: { type: string; message: string };
    }>();
    const toast = p.toast;
    const can = useCan();
    const [searchTerm, setSearchTerm] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');

    const handleAction = (bookingId: number, action: string) => {
        const routeMap: Record<string, any> = {
            approve: () => approve.url({ booking: bookingId }),
            reject: () => reject.url({ booking: bookingId }),
            cancel: () => cancel.url({ booking: bookingId }),
            complete: () => complete.url({ booking: bookingId }),
        };
        router.post(routeMap[action](), {}, { preserveScroll: true });
    };

    const applyFilters = () => {
        router.get(
            '/bookings',
            {
                search: searchTerm || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Bookings" />
            <div className="space-y-8 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Bookings</h1>
                    <p className="mt-2 text-muted-foreground">
                        Track and manage all rental bookings in one place.
                    </p>
                </div>
                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Total
                            </p>
                            <p className="text-3xl font-bold">
                                {bookings.data.length}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Awaiting Deposit
                            </p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {
                                    bookings.data.filter(
                                        (b) => b.status === 'confirmed',
                                    ).length
                                }
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Deposit Paid
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                                {
                                    bookings.data.filter(
                                        (b) => b.status === 'deposit_paid',
                                    ).length
                                }
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Completed
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {
                                    bookings.data.filter(
                                        (b) => b.status === 'completed',
                                    ).length
                                }
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-red-200 bg-red-50 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

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

                <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by car or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-11 rounded-xl pl-10"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="h-11 w-44 rounded-xl">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            {Object.keys(STATUS_STYLES).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={applyFilters}
                        className="rounded-xl bg-blue-600 px-6 hover:bg-blue-700"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

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
                        {bookings.data.map((booking) => (
                            <Card
                                key={booking.id}
                                className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
                            >
                                <div
                                    className={`h-1.5 w-full ${STATUS_STYLES[booking.status]?.split(' ')[0] ?? 'bg-slate-200'}`}
                                />
                                <CardContent className="p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-16 w-24 overflow-hidden rounded-xl bg-gray-100">
                                                        {booking.car.image ? (
                                                            <img
                                                                src={`/storage/${booking.car.image}`}
                                                                alt={`${booking.car.brand} ${booking.car.model}`}
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
                                                            {booking.car.brand}{' '}
                                                            {booking.car.model}
                                                        </p>
                                                        {booking.car
                                                            .plate_number && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    booking.car
                                                                        .plate_number
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status] ?? 'border-slate-200 bg-slate-50 text-slate-700'}`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </div>

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
                                                        {booking.total_price}
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

                                            {booking.need_driver && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                    <User className="h-3 w-3" />{' '}
                                                    Driver requested
                                                </span>
                                            )}
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
                                                                        ? 'bg-blue-600'
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

                                        <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link
                                                    href={`/bookings/${booking.id}`}
                                                >
                                                    <Eye className="mr-1.5 h-4 w-4" />{' '}
                                                    Details
                                                </Link>
                                            </Button>
                                            {booking.status === 'confirmed' &&
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
                                                        <Ban className="mr-1.5 h-4 w-4" />{' '}
                                                        Cancel
                                                    </Button>
                                                )}
                                                {role === 'customer' &&
                                                    (booking.status ===
                                                        'paid' ||
                                                        booking.status ===
                                                            'deposit_paid') &&
                                                    (booking.has_dispute ? (
                                                        <span className="text-sm font-medium text-red-600">
                                                            Dispute submitted
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                router.post(
                                                                    ownerNoShow.url(
                                                                        {
                                                                            booking:
                                                                                booking.id,
                                                                        },
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveScroll:
                                                                            true,
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Owner did not
                                                            deliver car
                                                        </Button>
                                                    ))}
                                            {booking.status === 'picked_up' &&
                                                (role === 'admin' ||
                                                    role === 'owner') && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Handover handled by the
                                                        inspection team
                                                    </span>
                                                )}
                                            {booking.status === 'returned' &&
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
                                            {role === 'customer' &&
                                                booking.status ===
                                                    'confirmed' &&
                                                !booking.payment &&
                                                hasAssignedDriver(booking) && (
                                                    <Button size="sm" asChild>
                                                        <Link
                                                            href={`/bookings/${booking.id}/payment`}
                                                        >
                                                            Pay Deposit
                                                        </Link>
                                                    </Button>
                                                )}
                                            {role === 'customer' &&
                                                booking.payment
                                                    ?.payment_status ===
                                                    'paid' && (
                                                    <>
                                                        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                                                            <CheckCircle className="h-4 w-4" />{' '}
                                                            Paid
                                                        </span>

                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/payments/${booking.payment.id}/receipt`}
                                                            >
                                                                View Receipt
                                                            </Link>
                                                        </Button>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Bookings.layout = {
    breadcrumbs: [{ title: 'Bookings', href: '/bookings' }],
};
