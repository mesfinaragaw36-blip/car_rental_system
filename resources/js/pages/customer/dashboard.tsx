import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {ResponsiveContainer,PieChart,Pie,Cell,Tooltip,} from 'recharts';
import {
    CalendarCheck,
    History,
    CalendarClock,
    Car,
} from 'lucide-react';
interface UpcomingReturn {
    id: number;
    vehicle: string;
    return_date: string;
}

interface Stats {
    active_bookings: number;
    past_bookings: number;
     total_bookings: number;
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
        <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <span className="text-muted-foreground">{icon}</span>
            </CardHeader>
            <CardContent  className="pb-6">
                <p className="text-4xl font-bold text-blue-600">
    {value}
</p>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function CustomerDashboard({ stats }: Props) {
   const bookingData = [
        {
            name: 'Active',
            value: stats.active_bookings,
        },
        {
            name: 'Past',
            value: stats.past_bookings,
        },
    ];

    const COLORS = ['#3B82F6', '#10B981'];
     return (
        <>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                <div>
    <h1 className="text-4xl font-bold">
        Welcome Back 
    </h1>

    <p className="text-muted-foreground mt-2">
        Here's an overview of your bookings.
    </p>
</div>

                <div className="grid gap-4 md:grid-cols-3">
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
                    <StatCard
                        title="Total Bookings"
                        value={stats.total_bookings}
                        icon={<Car className="h-4 w-4" />}
                        description="All bookings you've made"
/>
                </div>
                <p>
    Active: {stats.active_bookings} | Past: {stats.past_bookings}
</p>
<div className="grid gap-6 lg:grid-cols-2"></div>
<Card>
    <CardHeader>
        <CardTitle>Booking Overview</CardTitle>
    </CardHeader>

    <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={bookingData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    label
                >
                    {bookingData.map((_, index) => (
                        <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>

                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    </CardContent>
</Card>
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
