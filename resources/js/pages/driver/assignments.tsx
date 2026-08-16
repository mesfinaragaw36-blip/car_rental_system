import { Head, router } from '@inertiajs/react';
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
    assigned_at: string | null;
    response_deadline?: string | null;
    responded_at?: string | null;
    rejection_reason?: string | null;

    booking: {
        id: number;
        pickup_date: string | null;
        return_date: string | null;
        pickup_location: string | null;
        return_location: string | null;
    };

    customer: {
        name: string | null;
    };

    car: {
        brand: string | null;
        model: string | null;
        year: number | null;
        plate_number: string | null;
    };
}

interface Props {
    assignments: DriverAssignment[];
}

const STATUS_STYLES: Record<string, string> = {
    assigned: 'bg-amber-50/40 text-amber-700 border-amber-200',
    accepted: 'bg-accent/70 text-primary border-accent',
    rejected: 'bg-red-50/60 text-red-700 border-red-200',
    completed: 'bg-emerald-50/60 text-emerald-700 border-emerald-200',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
    assigned: 'Trip assigned to you. Please accept or reject the assignment.',
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
    assignments = [],
}: Props) {
    const pendingCount = assignments.filter(
        (assignment) => assignment.status === 'assigned',
    ).length;

    const activeCount = assignments.filter(
        (assignment) => assignment.status === 'accepted',
    ).length;

    const completedCount = assignments.filter(
        (assignment) => assignment.status === 'completed',
    ).length;

    const handleAccept = (assignmentId: number) => {
        router.post(`/driver/assignments/${assignmentId}/accept`);
    };

    const handleReject = (assignmentId: number) => {
        const reason = window.prompt(
            'Please enter a reason for rejecting this assignment:',
        );

        if (!reason?.trim()) {
            return;
        }

        router.post(`/driver/assignments/${assignmentId}/reject`, {
            rejection_reason: reason.trim(),
        });
    };

    return (
        <>
            <Head title="My Assignments" />

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
                    <div className="space-y-5">
                        {assignments.map((assignment) => (
                            <Card
                                key={assignment.id}
                                className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg"
                            >
                                {/* Status Bar */}
                                <div
                                    className={`h-1.5 w-full ${
                                        STATUS_STYLES[
                                            assignment.status
                                        ]?.split(' ')[0] ??
                                        'bg-slate-200'
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
                                                        {
                                                            assignment.car
                                                                .brand
                                                        }{' '}
                                                        {
                                                            assignment.car
                                                                .model
                                                        }
                                                    </p>

                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            assignment.car
                                                                .year
                                                        }{' '}
                                                        &bull;{' '}
                                                        {
                                                            assignment.car
                                                                .plate_number
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <span
                                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                                                    STATUS_STYLES[
                                                        assignment.status
                                                    ] ??
                                                    'border-slate-200 bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                {STATUS_ICONS[
                                                    assignment.status
                                                ]}

                                                {assignment.status}
                                            </span>
                                        </div>

                                        {/* Status Description */}
                                        <p className="text-sm text-muted-foreground">
                                            {STATUS_DESCRIPTIONS[
                                                assignment.status
                                            ] ?? assignment.status}
                                        </p>

                                        {/* Customer */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Customer
                                            </p>

                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                <span>
                                                    {assignment.customer
                                                        ?.name ?? 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Trip Details */}
                                        <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                <span className="font-medium">
                                                    Pickup:
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {assignment.booking
                                                        ?.pickup_date ??
                                                        'N/A'}{' '}
                                                    &mdash;{' '}
                                                    {assignment.booking
                                                        ?.pickup_location ??
                                                        'N/A'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />

                                                <span className="font-medium">
                                                    Return:
                                                </span>

                                                <span className="text-muted-foreground">
                                                    {assignment.booking
                                                        ?.return_date ??
                                                        'N/A'}{' '}
                                                    &mdash;{' '}
                                                    {assignment.booking
                                                        ?.return_location ??
                                                        'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Accept / Reject */}
                                        {assignment.status === 'assigned' && (
                                            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleReject(
                                                            assignment.id,
                                                        )
                                                    }
                                                    className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    Reject Assignment
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAccept(
                                                            assignment.id,
                                                        )
                                                    }
                                                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                                                >
                                                    Accept Assignment
                                                </button>
                                            </div>
                                        )}

                                        {/* Assignment Information */}
                                        <div className="flex items-center justify-end border-t pt-4">
                                            <p className="text-xs text-muted-foreground">
                                                Assigned at{' '}
                                                {assignment.assigned_at ??
                                                    'N/A'}
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
            title: 'My Assignments',
            href: '/driver/assignments',
        },
    ],
};