import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BookingInfo {
    id: number;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    status: string;
}

interface CustomerInfo {
    name: string;
    phone: string;
}

interface CarInfo {
    brand: string;
    model: string;
    year: number;
    plate_number: string;
}

interface Assignment {
    id: number;
    status: string;
    assigned_at: string;
    booking: BookingInfo;
    customer: CustomerInfo;
    car: CarInfo;
}

interface Props {
    assignments: Assignment[];
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
    assigned:  'bg-yellow-100 text-yellow-800',
    accepted:  'bg-blue-100 text-blue-800',
    rejected:  'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
};

const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
    assigned:  'Pending — awaiting your response',
    accepted:  'Active — trip in progress',
    rejected:  'Rejected',
    completed: 'Completed',
};

export default function DriverAssignments({ assignments = [] }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    const [processingId, setProcessingId] = useState<number | null>(null);

    function handleAccept(assignmentId: number): void {
        setProcessingId(assignmentId);
        router.post(
            `/driver/assignments/${assignmentId}/accept`,
            {},
            { onFinish: () => setProcessingId(null) },
        );
    }

    function handleComplete(assignmentId: number): void {
        if (!confirm('Mark this trip as completed?')) {
            return;
        }
        setProcessingId(assignmentId);
        router.post(
            `/driver/assignments/${assignmentId}/complete`,
            {},
            { onFinish: () => setProcessingId(null) },
        );
    }

    return (
        <>
            <Head title="My Assignments" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Assignments</h1>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>All Assignments</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {assignments.length === 0 ? (
                            <p className="text-muted-foreground">
                                No assignments yet. The owner will assign you to a booking when a
                                customer requests a driver.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="rounded-lg border p-4 space-y-3"
                                    >
                                        {/* Car + status badge */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold">
                                                    {assignment.car.brand} {assignment.car.model}{' '}
                                                    <span className="font-normal text-muted-foreground">
                                                        ({assignment.car.year})
                                                    </span>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {assignment.car.plate_number}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    ASSIGNMENT_STATUS_STYLES[assignment.status] ??
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {assignment.status}
                                            </span>
                                        </div>

                                        {/* Status description */}
                                        <p className="text-sm text-muted-foreground">
                                            {ASSIGNMENT_STATUS_LABELS[assignment.status] ??
                                                assignment.status}
                                        </p>

                                        {/* Customer */}
                                        <div className="text-sm space-y-0.5">
                                            <p>
                                                <span className="font-medium">Customer: </span>
                                                {assignment.customer.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {assignment.customer.phone}
                                            </p>
                                        </div>

                                        {/* Dates + locations */}
                                        <div className="text-sm space-y-0.5">
                                            <p>
                                                <span className="font-medium">Pickup: </span>
                                                {assignment.booking.pickup_date} &mdash;{' '}
                                                {assignment.booking.pickup_location}
                                            </p>
                                            <p>
                                                <span className="font-medium">Return: </span>
                                                {assignment.booking.return_date} &mdash;{' '}
                                                {assignment.booking.return_location}
                                            </p>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2 pt-1">
                                            {assignment.status === 'assigned' && (
                                                <Button
                                                    size="sm"
                                                    disabled={processingId === assignment.id}
                                                    onClick={() => handleAccept(assignment.id)}
                                                >
                                                    {processingId === assignment.id
                                                        ? 'Processing…'
                                                        : 'Accept Trip'}
                                                </Button>
                                            )}

                                            {assignment.status === 'accepted' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={processingId === assignment.id}
                                                    onClick={() => handleComplete(assignment.id)}
                                                >
                                                    {processingId === assignment.id
                                                        ? 'Processing…'
                                                        : 'Mark as Completed'}
                                                </Button>
                                            )}
                                        </div>

                                        {/* Assigned at */}
                                        <p className="text-xs text-muted-foreground border-t pt-2">
                                            Assigned at {assignment.assigned_at}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DriverAssignments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/driver/dashboard' },
        { title: 'My Assignments', href: '/driver/assignments' },
    ],
};
