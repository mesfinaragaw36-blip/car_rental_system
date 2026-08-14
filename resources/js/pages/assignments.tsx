import { Head, usePage } from '@inertiajs/react';
import {
    Car,
    User,
    Phone,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DriverAssignment {
    id: number;
    status: string;
    assigned_at: string;
    booking: {
        id: number;
        pickup_date: string;
        return_date: string;
        pickup_location: string;
        return_location: string;
        status: string;
    };
    customer: {
        name: string;
        phone: string;
    };
    car: {
        brand: string;
        model: string;
        year: number;
        plate_number: string;
    };
    driver?: {
        id: number;
        name: string;
        phone: string;
    } | null;
}

interface Props {
    role: string;
    assignments: DriverAssignment[];
}

const STATUS_STYLES: Record<string, string> = {
    assigned: 'bg-amber-50/40 text-amber-700 border-amber-200',
    accepted: 'bg-accent/70 text-primary border-accent',
    rejected: 'bg-red-50/60 text-red-700 border-red-200',
    completed: 'bg-emerald-50/60 text-emerald-700 border-emerald-200',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
    assigned: 'Trip assigned to you by the company.',
    accepted: 'Assignment confirmed and ready for the trip.',
    completed: 'Trip completed successfully.',
    rejected: 'This assignment was declined.',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    assigned: <ShieldCheck className="h-4 w-4" />,
    accepted: <CheckCircle className="h-4 w-4" />,
    completed: <Truck className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
};

export default function Assignments({
    role,
    assignments = [],
}: Props) {
    const { props: p } = usePage<{
        toast?: {
            type: string;
            message: string;
        };
    }>();

    const toast = p.toast;

    const pendingCount = assignments.filter(
        (a) => a.status === 'assigned',
    ).length;

    const activeCount = assignments.filter(
        (a) => a.status === 'accepted',
    ).length;

    const completedCount = assignments.filter(
        (a) => a.status === 'completed',
    ).length;

    return (
        <>
            <Head title="Assignments" />

            <div className="space-y-8 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">
                        My Assignments
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        View your assigned trips and rental details.
                    </p>
                </div>

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

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Assigned
                                </p>

                                <p className="mt-0.5 text-2xl font-bold">
                                    {pendingCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                                <Truck className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Active
                                </p>

                                <p className="mt-0.5 text-2xl font-bold">
                                    {activeCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>

                            <div>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    Completed
                                </p>

                                <p className="mt-0.5 text-2xl font-bold">
                                    {completedCount}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Empty State */}
                {assignments.length === 0 ? (
                    <Card className="overflow-hidden rounded-2xl">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Car className="mb-4 h-16 w-16 text-slate-400" />

                            <h2 className="text-xl font-semibold">
                                No assignments yet
                            </h2>

                            <p className="mt-2 text-center text-muted-foreground">
                                Your assigned trips will appear here when
                                the company assigns you to a booking.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    /* Assignment List */
                    <div className="space-y-5">
                        {assignments.map((a) => (
                            <Card
                                key={a.id}
                                className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
                            >
                                {/* Status Bar */}
                                <div
                                    className={`h-1.5 w-full ${
                                        STATUS_STYLES[a.status]?.split(
                                            ' ',
                                        )[0] ?? 'bg-slate-200'
                                    }`}
                                />

                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-5">
                                        {/* Car Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                                                    <Car className="h-5 w-5 text-primary" />
                                                </div>

                                                <div>
                                                    <p className="text-lg font-bold">
                                                        {a.car.brand}{' '}
                                                        {a.car.model}
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        {a.car.year} &bull;{' '}
                                                        {a.car.plate_number}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <span
                                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    STATUS_STYLES[
                                                        a.status
                                                    ] ??
                                                    'border-slate-200 bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                {STATUS_ICONS[a.status]}

                                                {a.status}
                                            </span>
                                        </div>

                                        {/* Status Description */}
                                        <p className="text-sm text-muted-foreground">
                                            {STATUS_DESCRIPTIONS[
                                                a.status
                                            ] ?? a.status}
                                        </p>

                                        {/* Customer / Driver */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Customer */}
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Customer
                                                </p>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                    <span>
                                                        {
                                                            a.customer
                                                                .name
                                                        }
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                    <span>
                                                        {
                                                            a.customer
                                                                .phone
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Driver */}
                                            {a.driver &&
                                                (role === 'owner' ||
                                                    role === 'admin') && (
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                            Driver
                                                        </p>

                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                            <span>
                                                                {
                                                                    a.driver
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                            <span>
                                                                {
                                                                    a.driver
                                                                        .phone
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>

                                        {/* Trip Details */}
                                        <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                <span className="font-medium">
                                                    Pickup:
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {a.booking.pickup_date}{' '}
                                                    &mdash;{' '}
                                                    {
                                                        a.booking
                                                            .pickup_location
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                <span className="font-medium">
                                                    Return:
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {a.booking.return_date}{' '}
                                                    &mdash;{' '}
                                                    {
                                                        a.booking
                                                            .return_location
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Assignment Information */}
                                        <div className="flex items-center justify-end border-t pt-4">
                                            <p className="text-xs text-muted-foreground">
                                                Assigned at{' '}
                                                {a.assigned_at}
                                            </p>
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

Assignments.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Assignments',
            href: '/assignments',
        },
    ],
};