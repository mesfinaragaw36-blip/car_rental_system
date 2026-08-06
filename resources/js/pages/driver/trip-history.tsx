import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Trip {
    id: number;
    status: string;
    assigned_at: string;
    booking: {
        pickup_date: string;
        return_date: string;
        pickup_location: string;
        return_location: string;
    };
    car: { brand: string; model: string; year: number; plate_number: string };
    customer: { name: string };
}

interface Props {
    assignments: Trip[];
}

const STATUS_STYLES: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function TripHistory({ assignments = [] }: Props) {
    return (
        <>
            <Head title="Trip History" />
            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Trip History</h1>

                {assignments.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        <Clock className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p>No trip history yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((a) => (
                            <Card key={a.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <p className="font-semibold">
                                                {a.car.brand} {a.car.model} (
                                                {a.car.year})
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {a.car.plate_number}
                                            </p>
                                            <div className="space-y-1 text-sm">
                                                <p className="flex items-center gap-1.5">
                                                    <CalendarDays className="h-4 w-4" />{' '}
                                                    {a.booking.pickup_date} →{' '}
                                                    {a.booking.return_date}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />{' '}
                                                    {a.booking.pickup_location}{' '}
                                                    →{' '}
                                                    {a.booking.return_location}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Customer: {a.customer.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Assigned: {a.assigned_at}
                                            </p>
                                        </div>
                                        <span
                                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[a.status] ?? 'bg-gray-100'}`}
                                        >
                                            {a.status === 'completed' ? (
                                                <CheckCircle className="h-3 w-3" />
                                            ) : (
                                                <XCircle className="h-3 w-3" />
                                            )}
                                            {a.status}
                                        </span>
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

TripHistory.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Trip History', href: '' },
    ],
};
