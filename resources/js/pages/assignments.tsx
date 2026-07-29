import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Car, User, Phone, Calendar, MapPin, Clock, CheckCircle, XCircle, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    claimed: 'bg-purple-50/60 text-purple-700 border-purple-200',
    assigned: 'bg-amber-50/40 text-amber-700 border-amber-200',
    accepted: 'bg-blue-50/60 text-blue-700 border-blue-200',
    rejected: 'bg-red-50/60 text-red-700 border-red-200',
    completed: 'bg-emerald-50/60 text-emerald-700 border-emerald-200',
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
    claimed: 'Driver has claimed this booking — awaiting your approval',
    assigned: 'Accepted — awaiting driver response',
    accepted: 'Driver confirmed — ready for customer payment',
    completed: 'Trip completed successfully',
    rejected: 'This assignment was declined',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    claimed: <Clock className="h-4 w-4" />,
    assigned: <ShieldCheck className="h-4 w-4" />,
    accepted: <CheckCircle className="h-4 w-4" />,
    completed: <Truck className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
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

    const pendingCount = assignments.filter(a => a.status === 'claimed' || a.status === 'assigned').length;
    const activeCount = assignments.filter(a => a.status === 'accepted').length;

    return (
        <>
            <Head title="Assignments" />
            <div className="space-y-8 p-6">
                <div>
                    <h1 className="text-3xl font-bold">My Assignments</h1>
                    <p className="mt-2 text-muted-foreground">Manage driver assignments and trip approvals.</p>
                </div>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {toast.message}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</p>
                                <p className="mt-0.5 text-2xl font-bold">{pendingCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                <Truck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active</p>
                                <p className="mt-0.5 text-2xl font-bold">{activeCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed</p>
                                <p className="mt-0.5 text-2xl font-bold">{assignments.filter(a => a.status === 'completed').length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {assignments.length === 0 ? (
                    <Card className="overflow-hidden rounded-2xl">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Car className="mb-4 h-16 w-16 text-slate-400" />
                            <h2 className="text-xl font-semibold">No assignments yet</h2>
                            <p className="mt-2 text-center text-muted-foreground">
                                {role === 'owner'
                                    ? 'Assignments will appear here when drivers claim your bookings.'
                                    : 'The owner will assign you to a booking when a customer requests a driver.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-5">
                        {assignments.map((a) => (
                            <Card key={a.id} className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg">
                                <div className={`h-1.5 w-full ${STATUS_STYLES[a.status]?.split(' ')[0] ?? 'bg-slate-200'}`} />
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                                    <Car className="h-5 w-5 text-blue-700" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold">
                                                        {a.car.brand} {a.car.model}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{a.car.year} &bull; {a.car.plate_number}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[a.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                {STATUS_ICONS[a.status]} {a.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {STATUS_DESCRIPTIONS[a.status] ?? a.status}
                                        </p>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span>{a.customer.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span>{a.customer.phone}</span>
                                                </div>
                                            </div>
                                            {a.driver && (role === 'owner' || role === 'admin') && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Driver</p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span>{a.driver.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span>{a.driver.phone}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2 rounded-xl border p-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span className="font-medium">Pickup:</span>
                                                <span className="text-muted-foreground">{a.booking.pickup_date} &mdash; {a.booking.pickup_location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span className="font-medium">Return:</span>
                                                <span className="text-muted-foreground">{a.booking.return_date} &mdash; {a.booking.return_location}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                            <div className="flex flex-wrap gap-2">
                                                {(role === 'owner' || role === 'admin') && a.status === 'claimed' && (
                                                    <>
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'approveClaim')}>
                                                            {processingId === a.id ? 'Processing…' : 'Approve Claim'}
                                                        </Button>
                                                        <Button size="sm" variant="destructive" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'rejectClaim')}>
                                                            {processingId === a.id ? 'Processing…' : 'Reject Claim'}
                                                        </Button>
                                                    </>
                                                )}
                                                {a.status === 'assigned' && (
                                                    <>
                                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={processingId === a.id} onClick={() => handleAction(a.id, 'accept')}>
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
                                            <p className="text-xs text-muted-foreground">
                                                Assigned at {a.assigned_at}
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
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Assignments', href: '/assignments' }],
};