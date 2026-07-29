import { Head, Link } from '@inertiajs/react';
import {
    Users, Car, Clock, BookOpen, CircleDollarSign, UserCog,
    CheckCircle, Activity, Truck, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStats {
    total_users: number; active_users: number; total_vehicles: number;
    pending_vehicles: number; total_bookings: number; pending_bookings: number;
    active_bookings: number; completed_bookings: number; total_revenue: string;
    pending_owners: number; pending_drivers: number; total_staff: number;
}
interface OwnerStats { total_vehicles: number; active_bookings: number; total_earnings: string; }
interface CustomerStats {
    active_bookings: number; past_bookings: number;
    upcoming_returns: { id: number; vehicle: string; return_date: string }[];
}
interface DriverStats { pending_assignments: number; active_trips: number; completed_trips: number; }

interface Props { role: string; stats: AdminStats | OwnerStats | CustomerStats | DriverStats; }

function StatCard({ title, value, icon, href, accent }: {
    title: string; value: string | number; icon: React.ReactNode; href?: string; accent?: string;
}) {
    const inner = (
        <Card className={href ? 'transition-shadow hover:shadow-md cursor-pointer' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <span className={accent ?? 'text-muted-foreground'}>{icon}</span>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function Dashboard({ role, stats }: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>

                {role === 'admin' && (() => {
                    const s = stats as AdminStats;

                    return (
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            <StatCard title="Total Users" value={s.total_users} icon={<Users className="h-4 w-4" />} href="/admin/users" />
                            <StatCard title="Active Users" value={s.active_users} icon={<UserCog className="h-5 w-5" />} />
                            <StatCard title="Total Vehicles" value={s.total_vehicles} icon={<Car className="h-4 w-4" />} href="/admin/vehicles" />
                            <StatCard title="Pending Vehicles" value={s.pending_vehicles} icon={<Clock className="h-4 w-4" />} href="/admin/vehicles" accent="text-yellow-600" />
                            <StatCard title="Total Bookings" value={s.total_bookings} icon={<BookOpen className="h-4 w-4" />} href="/bookings" />
                            <StatCard title="Pending Bookings" value={s.pending_bookings} icon={<Clock className="h-4 w-4" />} accent="text-yellow-600" />
                            <StatCard title="Active" value={s.active_bookings} icon={<Activity className="h-4 w-4" />} />
                            <StatCard title="Completed" value={s.completed_bookings} icon={<CheckCircle className="h-4 w-4" />} />
                            <StatCard title="Revenue" value={`ETB ${s.total_revenue}`} icon={<CircleDollarSign className="h-4 w-4" />} />
                            <StatCard title="Pending Owners" value={s.pending_owners} icon={<Shield className="h-4 w-4" />} accent="text-yellow-600" />
                            <StatCard title="Pending Drivers" value={s.pending_drivers} icon={<Truck className="h-4 w-4" />} accent="text-yellow-600" />
                            <StatCard title="Staff" value={s.total_staff} icon={<UserCog className="h-4 w-4" />} />
                        </div>
                    );
                })()}

                {role === 'owner' && (() => {
                    const s = stats as OwnerStats;

                    return (
                        <div className="grid gap-4 md:grid-cols-3">
                            <StatCard title="My Vehicles" value={s.total_vehicles} icon={<Car className="h-4 w-4" />} href="/vehicles" />
                            <StatCard title="Active Bookings" value={s.active_bookings} icon={<BookOpen className="h-4 w-4" />} href="/bookings" />
                            <StatCard title="Total Earnings" value={`ETB ${s.total_earnings}`} icon={<CircleDollarSign className="h-4 w-4" />} />
                        </div>
                    );
                })()}

                {role === 'customer' && (() => {
                    const s = stats as CustomerStats;

                    return (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <StatCard title="Active Bookings" value={s.active_bookings} icon={<BookOpen className="h-4 w-4" />} href="/bookings" />
                                <StatCard title="Past Bookings" value={s.past_bookings} icon={<CheckCircle className="h-4 w-4" />} href="/bookings" />
                            </div>
                            {s.upcoming_returns.length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle>Upcoming Returns</CardTitle></CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {s.upcoming_returns.map((r) => (
                                                <li key={r.id} className="flex justify-between text-sm">
                                                    <span>{r.vehicle}</span>
                                                    <span className="text-muted-foreground">Return: {r.return_date}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    );
                })()}

                {role === 'driver' && (() => {
                    const s = stats as DriverStats;

                    return (
                        <div className="grid gap-4 md:grid-cols-3">
                            <StatCard title="Pending" value={s.pending_assignments} icon={<Clock className="h-4 w-4" />} href="/assignments" accent="text-yellow-600" />
                            <StatCard title="Active Trips" value={s.active_trips} icon={<Truck className="h-4 w-4" />} href="/assignments" />
                            <StatCard title="Completed" value={s.completed_trips} icon={<CheckCircle className="h-4 w-4" />} />
                        </div>
                    );
                })()}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
