import { Head } from '@inertiajs/react';
import {
    Car,
    CheckCircle2,
    Clock3,
    ListChecks,
    XCircle,
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface AssignmentDriver {
    id: number;
    name: string;
    phone: string;
}

interface AssignmentAssignedBy {
    id: number;
    name: string;
}

interface AssignmentBooking {
    id: number | undefined;
    pickup_date: string | null | undefined;
    return_date: string | null | undefined;
    pickup_location: string | null | undefined;
    return_location: string | null | undefined;
}

interface AssignmentCar {
    brand: string | null | undefined;
    model: string | null | undefined;
    plate_number: string | null | undefined;
}

interface AssignmentCustomer {
    name: string | null | undefined;
}

interface Assignment {
    id: number;
    status: string;
    assigned_at: string | null;
    response_deadline: string | null;
    responded_at: string | null;
    rejection_reason: string | null;
    driver: AssignmentDriver | null;
    assigned_by: AssignmentAssignedBy | null;
    booking: AssignmentBooking;
    car: AssignmentCar;
    customer: AssignmentCustomer;
}

interface Props {
    assignments: Assignment[];
}

function statusBadgeClasses(status: string): string {
    switch (status) {
        case 'accepted':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';

        case 'assigned':
            return 'border-amber-200 bg-amber-50 text-amber-700';

        case 'rejected':
            return 'border-red-200 bg-red-50 text-red-700';

        case 'completed':
            return 'border-accent bg-accent text-primary';

        case 'paid':
            return 'border-accent bg-accent text-primary';

        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

function statusIcon(status: string) {
    switch (status) {
        case 'accepted':
            return <CheckCircle2 className="h-3.5 w-3.5" />;

        case 'assigned':
            return <Clock3 className="h-3.5 w-3.5" />;

        case 'rejected':
            return <XCircle className="h-3.5 w-3.5" />;

        default:
            return null;
    }
}

function statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function AdminDriverAssignments({ assignments }: Props) {
    const total = assignments.length;
    const pending = assignments.filter((a) => a.status === 'assigned').length;
    const accepted = assignments.filter(
        (a) => a.status === 'accepted',
    ).length;
    const rejected = assignments.filter(
        (a) => a.status === 'rejected',
    ).length;

    return (
        <>
            <Head title="Driver Assignments" />

            <div className="space-y-6">
                {/* Header */}
                <div className="rounded-3xl bg-gradient-to-r from-primary via-[#1d4370] to-[#14294a] p-8 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/80">
                                Administration
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                Driver Assignments
                            </h1>

                            <p className="mt-2 max-w-xl text-sm text-white/80">
                                Track every chauffeur assignment, its
                                response window, and outcome.
                            </p>
                        </div>

                        <div className="hidden rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:block">
                            <ListChecks className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Assignments
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {total}
                                </p>
                            </div>

                            <div className="rounded-xl bg-gradient-to-br from-primary to-[#1d4370] p-3 text-white shadow-sm">
                                <ListChecks className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Awaiting Response
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {pending}
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                                <Clock3 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Accepted
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {accepted}
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Rejected / Expired
                                </p>

                                <p className="mt-2 text-2xl font-semibold">
                                    {rejected}
                                </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assignments table */}
                <Card className="overflow-hidden border-0 shadow-sm">
                    <CardHeader className="border-b bg-muted/20 px-6 py-5">
                        <CardTitle className="text-lg">
                            All Assignments
                        </CardTitle>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Every driver assignment across all bookings,
                            most recent first.
                        </p>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="border-b bg-muted/10">
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Booking
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Driver
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Customer
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Status
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Assigned
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Deadline
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Responded
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Notes
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {assignments.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="rounded-full bg-muted p-4">
                                                        <ListChecks className="h-6 w-6 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="mt-4 font-medium">
                                                        No assignments yet
                                                    </h3>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Driver assignments
                                                        will appear here once
                                                        a booking requests a
                                                        chauffeur.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        assignments.map((assignment) => (
                                            <tr
                                                key={assignment.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                {/* Booking */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                                            <Car className="h-4 w-4" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                #
                                                                {
                                                                    assignment
                                                                        .booking
                                                                        .id
                                                                }{' '}
                                                                {
                                                                    assignment
                                                                        .car
                                                                        .brand
                                                                }{' '}
                                                                {
                                                                    assignment
                                                                        .car
                                                                        .model
                                                                }
                                                            </p>

                                                            <p className="truncate text-sm text-muted-foreground">
                                                                {
                                                                    assignment
                                                                        .booking
                                                                        .pickup_location
                                                                }{' '}
                                                                →{' '}
                                                                {
                                                                    assignment
                                                                        .booking
                                                                        .return_location
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Driver */}
                                                <td className="px-4 py-4">
                                                    {assignment.driver ? (
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    assignment
                                                                        .driver
                                                                        .name
                                                                }
                                                            </p>

                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    assignment
                                                                        .driver
                                                                        .phone
                                                                }
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Customer */}
                                                <td className="px-4 py-4 text-sm">
                                                    {assignment.customer
                                                        .name ?? '—'}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadgeClasses(
                                                            assignment.status,
                                                        )}`}
                                                    >
                                                        {statusIcon(
                                                            assignment.status,
                                                        )}

                                                        {statusLabel(
                                                            assignment.status,
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Assigned */}
                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        assignment.assigned_at,
                                                    )}
                                                </td>

                                                {/* Deadline */}
                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {assignment.status ===
                                                    'assigned'
                                                        ? formatDateTime(
                                                              assignment.response_deadline,
                                                          )
                                                        : '—'}
                                                </td>

                                                {/* Responded */}
                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        assignment.responded_at,
                                                    )}
                                                </td>

                                                {/* Notes */}
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {assignment.rejection_reason ??
                                                        '—'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
