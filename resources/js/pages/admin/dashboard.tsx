import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Car, Clock, BookOpen, CircleDollarSign } from 'lucide-react';

interface Stats {
    total_users: number;
    total_vehicles: number;
    pending_vehicles: number;
    total_bookings: number;
    total_revenue: string;
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

export default function AdminDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={<Users className="h-4 w-4" />}
                        description="All registered accounts"
                    />
                    <StatCard
                        title="Total Vehicles"
                        value={stats.total_vehicles}
                        icon={<Car className="h-4 w-4" />}
                        description="All listed vehicles"
                    />
                    <StatCard
                        title="Pending Approvals"
                        value={stats.pending_vehicles}
                        icon={<Clock className="h-4 w-4" />}
                        description="Vehicles awaiting review"
                    />
                    <StatCard
                        title="Total Bookings"
                        value={stats.total_bookings}
                        icon={<BookOpen className="h-4 w-4" />}
                        description="All booking requests"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`ETB ${stats.total_revenue}`}
                        icon={<CircleDollarSign className="h-4 w-4" />}
                        description="From completed payments"
                    />
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }],
};
