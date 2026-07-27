import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users, Car, Clock, BookOpen, CircleDollarSign,
    UserCheck, ShieldCheck, UserCog, CheckCircle, XCircle, Activity,
} from 'lucide-react';

interface Stats {
    total_users: number;
    active_users: number;
    total_vehicles: number;
    pending_vehicles: number;
    total_bookings: number;
    pending_bookings: number;
    active_bookings: number;
    completed_bookings: number;
    total_revenue: string;
    pending_owners: number;
    pending_drivers: number;
    total_staff: number;
}

interface Props { stats: Stats; }

function StatCard({
    title, value, icon, description, href, accent,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    href?: string;
    accent?: string;
}) {
    const inner = (
        <Card className={href ? 'transition-shadow hover:shadow-md cursor-pointer' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <span className={accent ?? 'text-muted-foreground'}>{icon}</span>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{value}</p>
                {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6 space-y-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                {/* Users & Staff */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Users & Staff</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Users" value={stats.total_users} icon={<Users className="h-4 w-4" />} description="All registered accounts" href="/admin/users" />
                        <StatCard title="Active Users" value={stats.active_users} icon={<Activity className="h-4 w-4" />} description="Currently active" accent="text-green-600" />
                        <StatCard title="Total Staff" value={stats.total_staff} icon={<UserCog className="h-4 w-4" />} description="Admin staff members" href="/admin/staff" />
                        <StatCard title="Pending Owners" value={stats.pending_owners} icon={<UserCheck className="h-4 w-4" />} description="Awaiting verification" href="/admin/users?role=owner" accent={stats.pending_owners > 0 ? 'text-yellow-600' : undefined} />
                    </div>
                </section>

                {/* Vehicles */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vehicles</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard title="Total Vehicles" value={stats.total_vehicles} icon={<Car className="h-4 w-4" />} description="All listed vehicles" href="/admin/vehicles" />
                        <StatCard title="Pending Approval" value={stats.pending_vehicles} icon={<Clock className="h-4 w-4" />} description="Vehicles awaiting review" href="/admin/vehicles?status=pending" accent={stats.pending_vehicles > 0 ? 'text-yellow-600' : undefined} />
                        <StatCard title="Pending Drivers" value={stats.pending_drivers} icon={<ShieldCheck className="h-4 w-4" />} description="Driver profiles to verify" href="/admin/drivers?verification=pending" accent={stats.pending_drivers > 0 ? 'text-yellow-600' : undefined} />
                    </div>
                </section>

                {/* Bookings */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bookings</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard title="Total Bookings" value={stats.total_bookings} icon={<BookOpen className="h-4 w-4" />} description="All booking requests" href="/admin/bookings" />
                        <StatCard title="Pending" value={stats.pending_bookings} icon={<Clock className="h-4 w-4" />} description="Awaiting owner approval" href="/admin/bookings?status=pending" accent={stats.pending_bookings > 0 ? 'text-yellow-600' : undefined} />
                        <StatCard title="Active" value={stats.active_bookings} icon={<CheckCircle className="h-4 w-4" />} description="Currently approved" href="/admin/bookings?status=approved" accent="text-blue-600" />
                        <StatCard title="Completed" value={stats.completed_bookings} icon={<XCircle className="h-4 w-4" />} description="Successfully completed" href="/admin/bookings?status=completed" accent="text-green-600" />
                    </div>
                </section>

                {/* Revenue */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Revenue</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard title="Total Revenue" value={`ETB ${stats.total_revenue}`} icon={<CircleDollarSign className="h-4 w-4" />} description="From completed payments" href="/admin/payments" accent="text-green-600" />
                    </div>
                </section>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }],
};
