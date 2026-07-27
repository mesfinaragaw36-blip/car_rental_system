import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CalendarCheck, CircleDollarSign } from 'lucide-react';

interface Stats {
    total_vehicles: number;
    active_bookings: number;
    total_earnings: string;
}

interface Props {
    stats: Stats;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <span className="text-muted-foreground">{icon}</span>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{value}</p>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function OwnerDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Owner Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        title="My Vehicles"
                        value={stats.total_vehicles}
                        icon={<Car className="h-4 w-4" />}
                        description="Total listed vehicles"
                    />
                    <StatCard
                        title="Active Bookings"
                        value={stats.active_bookings}
                        icon={<CalendarCheck className="h-4 w-4" />}
                        description="Approved, paid, or in progress"
                    />
                    <StatCard
                        title="Total Earnings"
                        value={`ETB ${stats.total_earnings}`}
                        icon={<CircleDollarSign className="h-4 w-4" />}
                        description="From completed payments"
                    />
                </div>
            </div>
        </>
    );
}

OwnerDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/owner/dashboard' }],
};
