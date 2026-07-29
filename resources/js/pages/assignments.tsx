import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { accept, complete } from '@/routes/assignments';

interface DriverAssignment {
    id: number;
    status: string;
    assigned_at: string;
    booking: { id: number; pickup_date: string; return_date: string; pickup_location: string; return_location: string; status: string };
    customer: { name: string; phone: string };
    car: { brand: string; model: string; year: number; plate_number: string };
}

interface Props { role: string; assignments: DriverAssignment[]; }

const STATUS_STYLES: Record<string, string> = {
    assigned: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

export default function Assignments({ role, assignments = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    const handleAction = (id: number, action: 'accept' | 'complete') => {
        const url = action === 'accept' ? accept.url({ assignment: id }) : complete.url({ assignment: id });
        router.post(url, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Assignments" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Assignments</h1>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {assignments.length === 0 ? (
                    <p className="text-muted-foreground">No assignments found.</p>
                ) : (
                    <div className="grid gap-4">
                        {assignments.map((a) => (
                            <Card key={a.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">
                                                {a.car.brand} {a.car.model} ({a.car.year})
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Plate: {a.car.plate_number} | Customer: {a.customer.name} ({a.customer.phone})
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Pickup: {a.booking.pickup_location} on {a.booking.pickup_date}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Return: {a.booking.return_location} on {a.booking.return_date}
                                            </p>
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[a.status] ?? 'bg-gray-100'}`}>
                                                {a.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {a.status === 'assigned' && (
                                                <Button size="sm" onClick={() => handleAction(a.id, 'accept')}>
                                                    Accept
                                                </Button>
                                            )}
                                            {a.status === 'accepted' && (
                                                <Button size="sm" onClick={() => handleAction(a.id, 'complete')}>
                                                    Complete Trip
                                                </Button>
                                            )}
                                            {role === 'admin' && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/bookings`}>View Booking</Link>
                                                </Button>
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

Assignments.layout = {
    breadcrumbs: [{ title: 'Assignments', href: '/assignments' }],
};
