import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, History, CalendarClock } from 'lucide-react';

interface UpcomingReturn {
    id: number;
    vehicle: string;
    return_date: string;
}

interface Stats {
    active_bookings: number;
    past_bookings: number;
    upcoming_returns: UpcomingReturn[];
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

export default function CustomerDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">My Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-2">
                    <StatCard
                        title="Active Bookings"
                        value={stats.active_bookings}
                        icon={<CalendarCheck className="h-4 w-4" />}
                        description="Pending, approved, paid, or picked up"
                    />
                    <StatCard
                        title="Past Bookings"
                        value={stats.past_bookings}
                        icon={<History className="h-4 w-4" />}
                        description="Returned or completed trips"
                    />
                </div>

                {/* Upcoming returns */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Upcoming Return Dates
                        </CardTitle>
                        <span className="text-muted-foreground">
                            <CalendarClock className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        {stats.upcoming_returns.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No upcoming returns.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {stats.upcoming_returns.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <span className="font-medium">{item.vehicle}</span>
                                        <span className="text-muted-foreground">
                                            {item.return_date}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-3">
                            <Link
                                href="/customer/bookings"
                                className="text-xs text-blue-600 hover:underline"
                            >
                                View all bookings →
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CustomerDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/customer/dashboard' }],
};
