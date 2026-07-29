import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { accept, approveClaim, complete, reject, rejectClaim } from '@/routes/assignments';

interface DriverAssignment {
    id: number;
    status: string;
    assigned_at: string;
    booking: { id: number; pickup_date: string; return_date: string; pickup_location: string; return_location: string; status: string };
    customer: { name: string; phone: string };
    car: { brand: string; model: string; year: number; plate_number: string };
    driver?: { id: number; name: string; phone: string } | null;
}

interface Props { role: string; assignments: DriverAssignment[]; }

const STATUS_STYLES: Record<string, string> = {
    claimed: 'bg-purple-100 text-purple-800',
    assigned: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<string, string> = {
    claimed: 'Claimed — awaiting owner approval',
    assigned: 'Accepted — awaiting driver response',
    accepted: 'Accepted — ready for customer payment',
    completed: 'Completed',
    rejected: 'Rejected',
};

export default function Assignments({ role, assignments = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleAction = (id: number, action: 'accept' | 'reject' | 'complete' | 'approveClaim' | 'rejectClaim') => {
        if (action === 'reject' && !confirm('Reject this assignment?')) return;
        if (action === 'rejectClaim' && !confirm('Reject this driver claim?')) return;
        if (action === 'complete' && !confirm('Mark this trip as completed?')) return;
        setProcessingId(id);
        const routeMap = { accept, reject, complete, approveClaim, rejectClaim };
        router.post(routeMap[action].url({ assignment: id }), {}, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };

    return (
        <>
            <Head title="Assignments" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Assignments</h1>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardHeader><CardTitle>All Assignments</CardTitle></CardHeader>
                    <CardContent>
                        {assignments.length === 0 ? (
                            <p className="text-muted-foreground">
                                No assignments yet. The owner will assign you to a booking when a customer requests a driver.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((a) => (
                                    <div key={a.id} className="rounded-lg border p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold">
                                                    {a.car.brand} {a.car.model} <span className="font-normal text-muted-foreground">({a.car.year})</span>
                                                </p>
                                                <p className="text-sm text-muted-foreground">{a.car.plate_number}</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-800'}`}>
                                                {a.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground">{STATUS_LABELS[a.status] ?? a.status}</p>

                                        <div className="text-sm space-y-0.5">
                                            <p><span className="font-medium">Customer: </span>{a.customer.name}</p>
                                            <p className="text-muted-foreground">{a.customer.phone}</p>
                                        </div>

                                        {a.driver && (role === 'owner' || role === 'admin') && (
                                            <div className="text-sm space-y-0.5">
                                                <p><span className="font-medium">Driver: </span>{a.driver.name}</p>
                                                <p className="text-muted-foreground">{a.driver.phone}</p>
                                            </div>
                                        )}

                                        <div className="text-sm space-y-0.5">
                                            <p><span className="font-medium">Pickup: </span>{a.booking.pickup_date} — {a.booking.pickup_location}</p>
                                            <p><span className="font-medium">Return: </span>{a.booking.return_date} — {a.booking.return_location}</p>
                                        </div>

                                        <div className="flex gap-2 pt-1">
                                            {(role === 'owner' || role === 'admin') && a.status === 'claimed' && (
                                                <>
                                                    <Button size="sm" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'approveClaim')}>
                                                        {processingId === a.id ? 'Processing…' : 'Approve Claim'}
                                                    </Button>
                                                    <Button size="sm" variant="destructive" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'rejectClaim')}>
                                                        {processingId === a.id ? 'Processing…' : 'Reject Claim'}
                                                    </Button>
                                                </>
                                            )}
                                            {a.status === 'assigned' && (
                                                <>
                                                    <Button size="sm" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'accept')}>
                                                        {processingId === a.id ? 'Processing…' : 'Accept Trip'}
                                                    </Button>
                                                    <Button size="sm" variant="destructive" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'reject')}>
                                                        {processingId === a.id ? 'Processing…' : 'Reject'}
                                                    </Button>
                                                </>
                                            )}
                                            {a.status === 'accepted' && (
                                                <Button size="sm" variant="outline" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'complete')}>
                                                    {processingId === a.id ? 'Processing…' : 'Mark as Completed'}
                                                </Button>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground border-t pt-2">Assigned at {a.assigned_at}</p>
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

Assignments.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Assignments', href: '/assignments' }],
};
