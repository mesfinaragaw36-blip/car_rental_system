import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Car,
    Clock,
    BookOpen,
    CircleDollarSign,
    CheckCircle,
    Activity,
    Truck,
    AlertTriangle,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as disputesIndex } from '@/routes/disputes';

interface AdminStats {
    total_users: number;
    active_users: number;
    total_vehicles: number;
    total_bookings: number;
    pending_bookings: number;
    active_bookings: number;
    completed_bookings: number;
    total_revenue: string;
    total_commission: string;
    commission_rate: number;
    pending_owners: number;
    pending_drivers: number;
    total_staff: number;
}

interface MonthlyData {
    month: string;
    revenue: number;
    commission: number;
}
interface OwnerStats {
    total_vehicles: number;
    active_bookings: number;
    pending_bookings: number;
    total_earnings: string;
    available_vehicles: number;
    rented_vehicles: number;
    pending_vehicles: number;
}
interface RecentBooking {
    id: number;
    status: string;
    pickup_date: string;
    customer: { name: string } | null;
    car: { brand: string; model: string } | null;
}
interface CustomerStats {
    active_bookings: number;
    past_bookings: number;
    upcoming_returns: { id: number; vehicle: string; return_date: string }[];
}
interface DriverStats {
    pending_assignments: number;
    active_trips: number;
    completed_trips: number;
}

interface Assignment {
    id: number;
    status: string;
    assigned_at: string | null;
    booking: {
        id: number;
        pickup_date: string;
        return_date: string;
        pickup_location: string;
        return_location: string;
    };
    customer: { name: string; phone: string };
    car: { brand: string; model: string; year: number; plate_number: string };
}

interface Props {
    role: string;
    stats: AdminStats | OwnerStats | CustomerStats | DriverStats;
    recentAssignments?: Assignment[];
    recentBookings?: RecentBooking[];
    monthlyData?: MonthlyData[];
}

function StatCard({
    title,
    value,
    icon,
    href,
    accent,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    href?: string;
    accent?: string;
}) {
    const inner = (
        <Card
            className={
                href ? 'cursor-pointer transition-shadow hover:shadow-md' : ''
            }
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <span className={accent ?? 'text-muted-foreground'}>
                    {icon}
                </span>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
    assigned: 'bg-brand-soft text-brand',
    accepted: 'bg-accent text-primary',
};

const BOOKING_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-brand-soft text-brand',
    approved: 'bg-accent text-primary',
    paid: 'bg-emerald-50 text-emerald-700',
    picked_up: 'bg-accent text-primary',
    completed: 'bg-muted text-muted-foreground',
    cancelled: 'bg-red-50 text-red-700',
};

function formatMonth(ym: string): string {
    const [y, m] = ym.split('-');

    return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(m) - 1]} '${y.slice(2)}`;
}

function GroupedBarChart({ data, max }: { data: MonthlyData[]; max: number }) {
    if (data.length === 0) {
        return null;
    }

    return (
        <>
            <div className="relative flex h-48 items-end justify-around">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <div
                        key={pct}
                        className="absolute right-0 left-0 border-t border-dashed border-gray-200"
                        style={{ bottom: `${pct * 25}%` }}
                    />
                ))}
                {data.map((d) => (
                    <div
                        key={d.month}
                        className="relative z-10 flex flex-1 items-end justify-center gap-1"
                    >
                        <div
                            className="w-5 cursor-pointer rounded-t transition-all hover:opacity-80"
                            style={{
                                height: `${Math.max((d.revenue / max) * 100, 2)}%`,
                                backgroundColor: '#1A365D',
                            }}
                            title={`Revenue: ETB ${d.revenue.toLocaleString()}`}
                        />
                        <div
                            className="w-5 cursor-pointer rounded-t transition-all hover:opacity-80"
                            style={{
                                height: `${Math.max((d.commission / max) * 100, 2)}%`,
                                backgroundColor: '#FF6B00',
                            }}
                            title={`Commission: ETB ${d.commission.toLocaleString()}`}
                        />
                    </div>
                ))}
                {/* Y-axis labels */}
                <div className="pointer-events-none absolute inset-y-0 right-0 -left-1 flex flex-col justify-between">
                    <span className="-ml-14 -translate-y-1/2 text-right text-[10px] text-muted-foreground">
                        ETB {max.toLocaleString()}
                    </span>
                    <span className="-ml-14 -translate-y-1/2 text-right text-[10px] text-muted-foreground">
                        ETB {(max * 0.5).toFixed(0)}
                    </span>
                    <span className="-ml-14 -translate-y-1/2 text-right text-[10px] text-muted-foreground">
                        ETB 0
                    </span>
                </div>
            </div>
            <div className="mt-1 ml-0 flex justify-around">
                {data.map((d) => (
                    <span
                        key={d.month}
                        className="flex-1 text-center text-[11px] text-muted-foreground"
                    >
                        {formatMonth(d.month)}
                    </span>
                ))}
            </div>
        </>
    );
}
export default function Dashboard({
    role,
    stats,
    recentAssignments = [],
    recentBookings = [],
    monthlyData = [],
}: Props) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>

                {role === 'admin' &&
                    (() => {
                        const s = stats as AdminStats;
                        const monthly = monthlyData as MonthlyData[];
                        const maxRevenue = Math.max(
                            ...monthly.map((d) => d.revenue),
                            1,
                        );

                        return (
                            <>
                                <div
                                    className="rounded-2xl bg-gradient-to-br p-8 text-white"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #1A365D 0%, #2D5B8E 100%)',
                                    }}
                                >
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Admin Dashboard
                                    </h1>
                                    <p className="mt-1 text-white/80">
                                        Platform overview at a glance.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <StatCard
                                        title="Total Revenue"
                                        value={`ETB ${s.total_revenue}`}
                                        icon={
                                            <CircleDollarSign className="h-4 w-4" />
                                        }
                                    />
                                    <StatCard
                                        title="Commission"
                                        value={`ETB ${s.total_commission}`}
                                        icon={
                                            <CircleDollarSign className="h-4 w-4" />
                                        }
                                        accent="text-brand"
                                    />
                                    <StatCard
                                        title="Active Bookings"
                                        value={s.active_bookings}
                                        icon={<Activity className="h-4 w-4" />}
                                        href="/bookings"
                                    />
                                    <StatCard
                                        title="Total Users"
                                        value={s.total_users}
                                        icon={<Users className="h-4 w-4" />}
                                        href="/admin/users"
                                    />
                                    <StatCard
                                        title="Booking Disputes"
                                        value="View"
                                        icon={
                                            <AlertTriangle className="h-4 w-4" />
                                        }
                                        href={disputesIndex.url()}
                                    />
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    <Card className="overflow-hidden rounded-2xl shadow-sm lg:col-span-2">
                                        <CardHeader className="border-b px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-base font-semibold">
                                                        Revenue & Commission
                                                    </CardTitle>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        Monthly revenue and{' '}
                                                        {s.commission_rate}%
                                                        platform commission
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            {monthly.length === 0 ? (
                                                <p className="py-12 text-center text-sm text-muted-foreground">
                                                    No transaction data yet.
                                                </p>
                                            ) : (
                                                (() => {
                                                    const totalRevenueNum =
                                                        parseFloat(
                                                            s.total_revenue,
                                                        );
                                                    const avgMonthly =
                                                        monthly.length > 0
                                                            ? totalRevenueNum /
                                                              monthly.length
                                                            : 0;
                                                    const bestEntry =
                                                        monthly.reduce(
                                                            (b, c) =>
                                                                c.revenue >
                                                                b.revenue
                                                                    ? c
                                                                    : b,
                                                        );
                                                    const lastIdx =
                                                        monthly.length - 1;
                                                    const growth =
                                                        monthly.length >= 2
                                                            ? ((monthly[lastIdx]
                                                                  .revenue -
                                                                  monthly[
                                                                      lastIdx -
                                                                          1
                                                                  ].revenue) /
                                                                  monthly[
                                                                      lastIdx -
                                                                          1
                                                                  ].revenue) *
                                                              100
                                                            : 0;

                                                    return (
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                                                <div className="rounded-lg bg-accent p-3">
                                                                    <p className="text-[11px] font-medium text-primary">
                                                                        Total
                                                                        Revenue
                                                                    </p>
                                                                    <p className="text-lg font-bold text-primary">
                                                                        ETB{' '}
                                                                        {
                                                                            s.total_revenue
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="rounded-lg bg-brand-soft p-3">
                                                                    <p className="text-[11px] font-medium text-brand">
                                                                        Total
                                                                        Commission
                                                                    </p>
                                                                    <p className="text-lg font-bold text-brand">
                                                                        ETB{' '}
                                                                        {
                                                                            s.total_commission
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="rounded-lg bg-muted p-3">
                                                                    <p className="text-[11px] font-medium text-muted-foreground">
                                                                        Monthly
                                                                        Avg
                                                                    </p>
                                                                    <p className="text-lg font-bold text-foreground">
                                                                        ETB{' '}
                                                                        {avgMonthly.toFixed(
                                                                            2,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="rounded-lg bg-green-50/80 p-3">
                                                                    <p className="text-[11px] font-medium text-green-600">
                                                                        Best
                                                                        Month
                                                                    </p>
                                                                    <p className="text-lg font-bold text-green-800">
                                                                        {formatMonth(
                                                                            bestEntry.month,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="rounded-lg bg-accent p-3">
                                                                    <p className="text-[11px] font-medium text-primary">
                                                                        MoM
                                                                        Growth
                                                                    </p>
                                                                    <p
                                                                        className={`text-lg font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                                                    >
                                                                        {growth >=
                                                                        0
                                                                            ? '+'
                                                                            : ''}
                                                                        {growth.toFixed(
                                                                            1,
                                                                        )}
                                                                        %
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1.5">
                                                                    <span
                                                                        className="h-3 w-3 rounded-sm"
                                                                        style={{
                                                                            backgroundColor:
                                                                                '#1A365D',
                                                                        }}
                                                                    />{' '}
                                                                    Revenue
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <span
                                                                        className="h-3 w-3 rounded-sm"
                                                                        style={{
                                                                            backgroundColor:
                                                                                '#FF6B00',
                                                                        }}
                                                                    />{' '}
                                                                    Commission
                                                                </span>
                                                            </div>
                                                            <GroupedBarChart
                                                                data={monthly}
                                                                max={maxRevenue}
                                                            />
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                                        <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                                            <CardTitle className="text-sm font-semibold">
                                                Platform Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-5 p-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Total Vehicles
                                                </span>
                                                <span className="text-lg font-bold">
                                                    {s.total_vehicles}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Total Bookings
                                                </span>
                                                <span className="text-lg font-bold">
                                                    {s.total_bookings}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Awaiting Deposit
                                                </span>
                                                <span className="text-lg font-bold text-brand">
                                                    {s.pending_bookings}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Completed
                                                </span>
                                                <span className="text-lg font-bold text-emerald-600">
                                                    {s.completed_bookings}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Commission Rate
                                                </span>
                                                <span className="text-lg font-bold text-brand">
                                                    {s.commission_rate}%
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                                        <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
                                            <CardTitle className="text-sm font-semibold">
                                                Verification Queue
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-5 p-6">
                                            <Link
                                                href="/admin/drivers"
                                                className="group flex items-center justify-between"
                                            >
                                                <span className="text-sm text-muted-foreground group-hover:text-foreground">
                                                    Pending Drivers
                                                </span>
                                                <span className="text-lg font-bold text-brand">
                                                    {s.pending_drivers}
                                                </span>
                                            </Link>
                                            <Link
                                                href="/admin/vehicles"
                                                className="group flex items-center justify-between"
                                            >
                                                <span className="text-sm text-muted-foreground group-hover:text-foreground">
                                                    Pending Owners
                                                </span>
                                                <span className="text-lg font-bold text-brand">
                                                    {s.pending_owners}
                                                </span>
                                            </Link>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Active Users
                                                </span>
                                                <span className="text-lg font-bold">
                                                    {s.active_users}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Staff
                                                </span>
                                                <span className="text-lg font-bold">
                                                    {s.total_staff}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        );
                    })()}

                {role === 'owner' &&
                    (() => {
                        const s = stats as OwnerStats;
                        const vehicleStatusData = [
                            { name: 'Available', value: s.available_vehicles },
                            { name: 'Rented', value: s.rented_vehicles },
                            { name: 'Pending', value: s.pending_vehicles },
                        ];

                        return (
                            <>
                                <div className="rounded-2xl bg-gradient-to-br from-primary via-[#1d4370] to-[#14294a] p-8 text-white">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Welcome back!
                                    </h1>
                                    <p className="mt-1 text-white/80">
                                        Here&apos;s what&apos;s happening with
                                        your fleet today.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <StatCard
                                        title="Total Vehicles"
                                        value={s.total_vehicles}
                                        icon={<Car className="h-4 w-4" />}
                                        href="/vehicles"
                                    />
                                    <StatCard
                                        title="Available"
                                        value={s.available_vehicles}
                                        icon={
                                            <CheckCircle className="h-4 w-4" />
                                        }
                                        accent="text-green-600"
                                    />
                                    <StatCard
                                        title="Rented"
                                        value={s.rented_vehicles}
                                        icon={<BookOpen className="h-4 w-4" />}
                                        accent="text-primary"
                                    />
                                    <StatCard
                                        title="Pending Approval"
                                        value={s.pending_vehicles}
                                        icon={<Clock className="h-4 w-4" />}
                                        accent="text-brand"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <StatCard
                                        title="Active Bookings"
                                        value={s.active_bookings}
                                        icon={<Activity className="h-4 w-4" />}
                                        href="/bookings"
                                    />
                                    <StatCard
                                        title="Awaiting Deposit"
                                        value={s.pending_bookings}
                                        icon={<Clock className="h-4 w-4" />}
                                        href="/bookings"
                                        accent="text-brand"
                                    />
                                    <StatCard
                                        title="Total Earnings"
                                        value={`ETB ${s.total_earnings}`}
                                        icon={
                                            <CircleDollarSign className="h-4 w-4" />
                                        }
                                    />
                                </div>

                                <div className="grid gap-4 lg:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Fleet Status</CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="h-72">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <RechartsPieChart>
                                                        <Pie
                                                            data={
                                                                vehicleStatusData
                                                            }
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={90}
                                                            dataKey="value"
                                                            nameKey="name"
                                                        >
                                                            {vehicleStatusData.map(
                                                                (
                                                                    entry,
                                                                    index,
                                                                ) => (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={
                                                                            [
                                                                                '#22C55E',
                                                                                '#1A365D',
                                                                                '#FF6B00',
                                                                                '#EF4444',
                                                                            ][
                                                                                index
                                                                            ]
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </Pie>

                                                        <Tooltip />
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="flex justify-center gap-5 text-sm">
                                                {vehicleStatusData.map(
                                                    (item) => (
                                                        <div key={item.name}>
                                                            {item.name}:{' '}
                                                            {item.value}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Monthly Earnings
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Your earnings from paid bookings
                                            </p>
                                        </CardHeader>

                                        <CardContent>
                                            {monthlyData.length === 0 ? (
                                                <p className="py-10 text-center text-sm text-muted-foreground">
                                                    No earnings data available
                                                    yet.
                                                </p>
                                            ) : (
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <LineChart
                                                            data={monthlyData}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />

                                                            <XAxis
                                                                dataKey="month"
                                                                tick={{
                                                                    fontSize: 12,
                                                                }}
                                                            />

                                                            <YAxis
                                                                tick={{
                                                                    fontSize: 12,
                                                                }}
                                                            />

                                                            <Tooltip
                                                                formatter={(
                                                                    value,
                                                                ) => [
                                                                    `ETB ${Number(value).toLocaleString()}`,
                                                                    'Revenue',
                                                                ]}
                                                            />

                                                            <Line
                                                                type="monotone"
                                                                dataKey="revenue"
                                                                strokeWidth={2}
                                                                dot={{ r: 4 }}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Recent Bookings</CardTitle>
                                        <Link
                                            href="/bookings"
                                            className="text-xs font-medium text-primary hover:underline"
                                        >
                                            View all →
                                        </Link>
                                    </CardHeader>
                                    <CardContent>
                                        {recentBookings.length === 0 ? (
                                            <p className="py-6 text-center text-sm text-muted-foreground">
                                                No bookings yet.
                                            </p>
                                        ) : (
                                            <div className="divide-y">
                                                {recentBookings.map((b) => (
                                                    <div
                                                        key={b.id}
                                                        className="flex items-center justify-between py-4"
                                                    >
                                                        <div>
                                                            <p className="font-semibold">
                                                                {b.car
                                                                    ? `${b.car.brand} ${b.car.model}`
                                                                    : 'Vehicle'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {b.pickup_date}{' '}
                                                                &middot;{' '}
                                                                {b.customer
                                                                    ?.name ??
                                                                    'N/A'}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-medium ${BOOKING_STATUS_STYLES[b.status] ?? 'bg-muted text-muted-foreground'}`}
                                                        >
                                                            {b.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        );
                    })()}

                {role === 'driver' &&
                    (() => {
                        const s = stats as DriverStats;

                        return (
                            <>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <StatCard
                                        title="Pending"
                                        value={s.pending_assignments}
                                        icon={<Clock className="h-4 w-4" />}
                                        href="/driver/assignments"
                                        accent="text-brand"
                                    />
                                    <StatCard
                                        title="Active Trips"
                                        value={s.active_trips}
                                        icon={<Truck className="h-4 w-4" />}
                                        href="/driver/assignments"
                                    />
                                    <StatCard
                                        title="Completed"
                                        value={s.completed_trips}
                                        icon={
                                            <CheckCircle className="h-4 w-4" />
                                        }
                                    />
                                </div>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>
                                            Current Assignments
                                        </CardTitle>
                                        <Link
                                            href="/assignments"
                                            className="text-xs text-primary hover:underline"
                                        >
                                            View all →
                                        </Link>
                                    </CardHeader>
                                    <CardContent>
                                        {recentAssignments.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No active assignments. The owner
                                                will assign you once a customer
                                                books a vehicle with a driver.
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentAssignments.map(
                                                    (assignment) => (
                                                        <div
                                                            key={assignment.id}
                                                            className="space-y-2 rounded-lg border p-4"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="font-semibold">
                                                                        {
                                                                            assignment
                                                                                .car
                                                                                .brand
                                                                        }{' '}
                                                                        {
                                                                            assignment
                                                                                .car
                                                                                .model
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            assignment
                                                                                .car
                                                                                .year
                                                                        }
                                                                        )
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            assignment
                                                                                .car
                                                                                .plate_number
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${ASSIGNMENT_STATUS_STYLES[assignment.status] ?? 'bg-muted text-muted-foreground'}`}
                                                                >
                                                                    {
                                                                        assignment.status
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="text-sm">
                                                                <span className="font-medium">
                                                                    Customer:{' '}
                                                                </span>
                                                                {
                                                                    assignment
                                                                        .customer
                                                                        .name
                                                                }{' '}
                                                                &middot;{' '}
                                                                {
                                                                    assignment
                                                                        .customer
                                                                        .phone
                                                                }
                                                            </p>
                                                            <div className="space-y-0.5 text-sm">
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Pickup:{' '}
                                                                    </span>
                                                                    {
                                                                        assignment
                                                                            .booking
                                                                            .pickup_date
                                                                    }{' '}
                                                                    —{' '}
                                                                    {
                                                                        assignment
                                                                            .booking
                                                                            .pickup_location
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Return:{' '}
                                                                    </span>
                                                                    {
                                                                        assignment
                                                                            .booking
                                                                            .return_date
                                                                    }{' '}
                                                                    —{' '}
                                                                    {
                                                                        assignment
                                                                            .booking
                                                                            .return_location
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        );
                    })()}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
