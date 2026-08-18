import { Head } from '@inertiajs/react';
import {
    Banknote,
    CalendarDays,
    CircleDollarSign,
    Clock,
    Wallet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Earning {
    id: number;
    status: string;
    earnings: string | null;
    payout_status: string | null;
    paid_at: string | null;
    assigned_at: string;
    booking: {
        id: number;
        pickup_date: string;
        return_date: string;
    };
    car: {
        brand: string;
        model: string;
        plate_number: string;
    };
}

interface Props {
    assignments: Earning[];
}

const PAYOUT_LABELS: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
};

export default function DriverPayments({ assignments = [] }: Props) {
    const totalEarnings = assignments.reduce(
        (sum, a) => sum + (Number(a.earnings) || 0),
        0,
    );
    const paidEarnings = assignments
        .filter((a) => a.payout_status === 'paid')
        .reduce((sum, a) => sum + (Number(a.earnings) || 0), 0);

    return (
        <>
            <Head title="Payment History" />
            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Payment History</h1>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Earnings
                                </p>
                                <p className="text-2xl font-bold">
                                    ETB {totalEarnings.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                                <Banknote className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Paid Out
                                </p>
                                <p className="text-2xl font-bold">
                                    ETB {paidEarnings.toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {assignments.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        <CircleDollarSign className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p>No earnings yet.</p>
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
                                                {a.car.plate_number})
                                            </p>
                                            <div className="space-y-1 text-sm">
                                                <p className="flex items-center gap-1.5">
                                                    <CalendarDays className="h-4 w-4" />{' '}
                                                    {a.booking.pickup_date} →{' '}
                                                    {a.booking.return_date}
                                                </p>
                                                <p className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />{' '}
                                                    Assigned:
                                                    {a.assigned_at}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0 space-y-1 text-right">
                                            <p className="text-lg font-bold">
                                                ETB{' '}
                                                {Number(a.earnings).toLocaleString()}
                                            </p>
                                            <span
                                                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                                    a.payout_status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}
                                            >
                                                {PAYOUT_LABELS[
                                                    a.payout_status ?? 'pending'
                                                ] ?? a.payout_status}
                                            </span>
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

DriverPayments.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payment History', href: '' },
    ],
};