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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    upcoming_returns: {
        id: number;
        vehicle: string;
        return_date: string;
    }[];
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
    customer: {
        name: string;
        phone: string;
    };
    car: {
        brand: string;
        model: string;
        year: number;
        plate_number: string;
    };
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
                href
                    ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[#87CEEB] hover:shadow-lg hover:shadow-[#87CEEB]/10'
                    : 'transition-all duration-200'
            }
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#5E6A76]">
                    {title}
                </CardTitle>

                <span className={accent ?? 'text-[#007BA7]'}>
                    {icon}
                </span>
            </CardHeader>

            <CardContent>
                <p className="text-3xl font-bold text-[#16425B]">{value}</p>
            </CardContent>
        </Card>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
    assigned: 'bg-[#E5F8FC] text-[#007BA7]',
    accepted: 'bg-[#CDEFF7] text-[#16425B]',
};

const BOOKING_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-[#E5F8FC] text-[#007BA7]',
    approved: 'bg-[#CDEFF7] text-[#16425B]',
    paid: 'bg-emerald-50 text-emerald-700',
    picked_up: 'bg-[#CDEFF7] text-[#16425B]',
    completed: 'bg-[#E8F8FC] text-[#5E6A76]',
    cancelled: 'bg-red-50 text-red-700',
};

function formatMonth(ym: string): string {
    const [y, m] = ym.split('-');

    return `${
        [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ][parseInt(m) - 1]
    } '${y.slice(2)}`;
}

function GroupedBarChart({
    data,
    max,
}: {
    data: MonthlyData[];
    max: number;
}) {
    if (data.length === 0) {
        return null;
    }

    return (
        <>
            <div className="relative flex h-48 items-end justify-around">
                {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <div
                        key={pct}
                        className="absolute right-0 left-0 border-t border-dashed border-[#D7F2F8]"
                        style={{ bottom: `${pct * 25}%` }}
                    />
                ))}

                {data.map((d) => (
                    <div
                        key={d.month}
                        className="relative z-10 flex flex-1 items-end justify-center gap-1"
                    >
                        {/* Revenue */}
                        <div
                            className="w-5 cursor-pointer rounded-t transition-all hover:opacity-80"
                            style={{
                                height: `${Math.max(
                                    (d.revenue / max) * 100,
                                    2,
                                )}%`,
                                backgroundColor: '#007BA7',
                            }}
                            title={`Revenue: ETB ${d.revenue.toLocaleString()}`}
                        />

                        {/* Commission */}
                        <div
                            className="w-5 cursor-pointer rounded-t transition-all hover:opacity-80"
                            style={{
                                height: `${Math.max(
                                    (d.commission / max) * 100,
                                    2,
                                )}%`,
                                backgroundColor: '#FF6B00',
                            }}
                            title={`Commission: ETB ${d.commission.toLocaleString()}`}
                        />
                    </div>
                ))}

                {/* Y-axis labels */}
                <div className="pointer-events-none absolute inset-y-0 right-0 -left-1 flex flex-col justify-between">
                    <span className="-ml-14 -translate-y-1/2 text-right text-[10px] text-[#7F8D9A]">
                        ETB {max.toLocaleString()}
                    </span>

                    <span className="-ml-14 -translate-y-1/2 text-right text-[10px] text-[#7F8D9A]">
                        ETB {(max * 0.5).toFixed(0)}
                    </span>

                    <span className="-ml-14 -translate-y-1/2 text-right text-[10px] text-[#7F8D9A]">
                        ETB 0
                    </span>
                </div>
            </div>

            <div className="mt-1 ml-0 flex justify-around">
                {data.map((d) => (
                    <span
                        key={d.month}
                        className="flex-1 text-center text-[11px] text-[#7F8D9A]"
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

            <div className="min-h-full space-y-6 bg-[#F7FCFF] p-6 text-[#16425B]">
                <h1 className="text-3xl font-bold text-[#16425B]">
                    Dashboard
                </h1>

                {/* =====================================================
                    ADMIN DASHBOARD
                ====================================================== */}

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
                                {/* ADMIN HERO */}
                                <div className="rounded-2xl bg-gradient-to-br from-[#16425B] via-[#007BA7] to-[#2D8FAF] p-8 text-white shadow-lg shadow-[#007BA7]/10">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Admin Dashboard
                                    </h1>

                                    <p className="mt-1 text-white/80">
                                        Platform overview at a glance.
                                    </p>
                                </div>

                                {/* ADMIN STAT CARDS */}
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
                                        accent="text-[#FF6B00]"
                                    />

                                    <StatCard
                                        title="Active Bookings"
                                        value={s.active_bookings}
                                        icon={
                                            <Activity className="h-4 w-4" />
                                        }
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
                                        accent="text-[#FF6B00]"
                                    />
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* REVENUE & COMMISSION */}
                                    <Card className="overflow-hidden rounded-2xl shadow-sm lg:col-span-2">
                                        <CardHeader className="border-b border-[#D7F2F8] bg-[#E8F8FC] px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-base font-semibold text-[#16425B]">
                                                        Revenue & Commission
                                                    </CardTitle>

                                                    <p className="mt-0.5 text-xs text-[#5E6A76]">
                                                        Monthly revenue and{' '}
                                                        {s.commission_rate}%
                                                        platform commission
                                                    </p>
                                                </div>

                                                {/* LEGEND */}
                                                <div className="flex items-center gap-4 text-xs text-[#5E6A76]">
                                                    <span className="flex items-center gap-1.5">
                                                        <span
                                                            className="h-3 w-3 rounded-sm"
                                                            style={{
                                                                backgroundColor:
                                                                    '#007BA7',
                                                            }}
                                                        />
                                                        Revenue
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <span
                                                            className="h-3 w-3 rounded-sm"
                                                            style={{
                                                                backgroundColor:
                                                                    '#FF6B00',
                                                            }}
                                                        />
                                                        Commission
                                                    </span>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-6">
                                            {monthly.length === 0 ? (
                                                <p className="py-12 text-center text-sm text-[#5E6A76]">
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
                                                            {/* SUMMARY INDICATORS */}
                                                            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                                                                {/* Revenue */}
                                                                <div className="rounded-lg bg-[#E5F8FC] p-3">
                                                                    <p className="text-[11px] font-medium text-[#007BA7]">
                                                                        Total
                                                                        Revenue
                                                                    </p>

                                                                    <p className="text-lg font-bold text-[#16425B]">
                                                                        ETB{' '}
                                                                        {
                                                                            s.total_revenue
                                                                        }
                                                                    </p>
                                                                </div>

                                                                {/* Commission */}
                                                                <div className="rounded-lg bg-orange-50 p-3">
                                                                    <p className="text-[11px] font-medium text-[#FF6B00]">
                                                                        Total
                                                                        Commission
                                                                    </p>

                                                                    <p className="text-lg font-bold text-[#D95F00]">
                                                                        ETB{' '}
                                                                        {
                                                                            s.total_commission
                                                                        }
                                                                    </p>
                                                                </div>

                                                                {/* Monthly Average */}
                                                                <div className="rounded-lg bg-[#E8F8FC] p-3">
                                                                    <p className="text-[11px] font-medium text-[#5E6A76]">
                                                                        Monthly
                                                                        Avg
                                                                    </p>

                                                                    <p className="text-lg font-bold text-[#16425B]">
                                                                        ETB{' '}
                                                                        {avgMonthly.toFixed(
                                                                            2,
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                {/* Best Month */}
                                                                <div className="rounded-lg bg-emerald-50 p-3">
                                                                    <p className="text-[11px] font-medium text-emerald-600">
                                                                        Best
                                                                        Month
                                                                    </p>

                                                                    <p className="text-lg font-bold text-emerald-800">
                                                                        {formatMonth(
                                                                            bestEntry.month,
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                {/* Growth */}
                                                                <div className="rounded-lg bg-[#E5F8FC] p-3">
                                                                    <p className="text-[11px] font-medium text-[#007BA7]">
                                                                        MoM
                                                                        Growth
                                                                    </p>

                                                                    <p
                                                                        className={`text-lg font-bold ${
                                                                            growth >=
                                                                            0
                                                                                ? 'text-emerald-600'
                                                                                : 'text-red-600'
                                                                        }`}
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

                                    {/* PLATFORM SUMMARY */}
                                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                                        <CardHeader className="border-b border-[#D7F2F8] bg-[#E8F8FC] px-6 py-4">
                                            <CardTitle className="text-sm font-semibold text-[#16425B]">
                                                Platform Summary
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-5 p-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#5E6A76]">
                                                    Total Vehicles
                                                </span>

                                                <span className="text-lg font-bold text-[#16425B]">
                                                    {s.total_vehicles}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#5E6A76]">
                                                    Total Bookings
                                                </span>

                                                <span className="text-lg font-bold text-[#16425B]">
                                                    {s.total_bookings}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#5E6A76]">
                                                    Awaiting Deposit
                                                </span>

                                                <span className="text-lg font-bold text-[#007BA7]">
                                                    {s.pending_bookings}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#5E6A76]">
                                                    Completed
                                                </span>

                                                <span className="text-lg font-bold text-emerald-600">
                                                    {s.completed_bookings}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#5E6A76]">
                                                    Commission Rate
                                                </span>

                                                <span className="text-lg font-bold text-[#FF6B00]">
                                                    {s.commission_rate}%
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* VERIFICATION QUEUE */}
                                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                                        <CardHeader className="border-b border-[#D7F2F8] bg-[#E8F8FC] px-6 py-4">
                                            <CardTitle className="text-sm font-semibold text-[#16425B]">
                                                Verification Queue
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-5 p-6">
                                            <Link
                                                href="/admin/drivers"
                                                className="group flex items-center justify-between"
                                            >
                                                <span className="text-sm text-[#5E6A76] transition group-hover:text-[#007BA7]">
                                                    Pending Drivers
                                                </span>

                                                <span className="text-lg font-bold text-[#007BA7]">
                                                    {s.pending_drivers}
                                                </span>
                                            </Link>

                                            <Link
                                                href="/admin/vehicles"
                                                className="group flex items-center justify-between"
                                            >
                                                <span className="text-sm text-[#5E6A76] transition group-hover:text-[#007BA7]">
                                                    Pending Owners
                                                </span>

                                                <span className="text-lg font-bold text-[#007BA7]">
                                                    {s.pending_owners}
                                                </span>
                                            </Link>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#5E6A76]">
                                                    Active Users
                                                </span>

                                                <span className="text-lg font-bold text-[#16425B]">
                                                    {s.active_users}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#5E6A76]">
                                                    Staff
                                                </span>

                                                <span className="text-lg font-bold text-[#16425B]">
                                                    {s.total_staff}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        );
                    })()}

                {/* =====================================================
                    OWNER DASHBOARD
                ====================================================== */}

                {role === 'owner' &&
                    (() => {
                        const s = stats as OwnerStats;

                        const vehicleStatusData = [
                            {
                                name: 'Available',
                                value: s.available_vehicles,
                            },
                            {
                                name: 'Rented',
                                value: s.rented_vehicles,
                            },
                            {
                                name: 'Pending',
                                value: s.pending_vehicles,
                            },
                        ];

                        return (
                            <>
                                {/* OWNER HERO */}
                                <div className="rounded-2xl bg-gradient-to-br from-[#16425B] via-[#007BA7] to-[#2D8FAF] p-8 text-white shadow-lg shadow-[#007BA7]/10">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Welcome back!
                                    </h1>

                                    <p className="mt-1 text-white/80">
                                        Here&apos;s what&apos;s happening with
                                        your fleet today.
                                    </p>
                                </div>

                                {/* VEHICLE STATS */}
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
                                        accent="text-emerald-600"
                                    />

                                    <StatCard
                                        title="Rented"
                                        value={s.rented_vehicles}
                                        icon={
                                            <BookOpen className="h-4 w-4" />
                                        }
                                        accent="text-[#007BA7]"
                                    />

                                    <StatCard
                                        title="Pending Approval"
                                        value={s.pending_vehicles}
                                        icon={<Clock className="h-4 w-4" />}
                                        accent="text-[#FF6B00]"
                                    />
                                </div>

                                {/* BOOKING STATS */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <StatCard
                                        title="Active Bookings"
                                        value={s.active_bookings}
                                        icon={
                                            <Activity className="h-4 w-4" />
                                        }
                                        href="/bookings"
                                    />

                                    <StatCard
                                        title="Awaiting Deposit"
                                        value={s.pending_bookings}
                                        icon={<Clock className="h-4 w-4" />}
                                        href="/bookings"
                                        accent="text-[#FF6B00]"
                                    />

                                    <StatCard
                                        title="Total Earnings"
                                        value={`ETB ${s.total_earnings}`}
                                        icon={
                                            <CircleDollarSign className="h-4 w-4" />
                                        }
                                    />
                                </div>

                                {/* OWNER CHARTS */}
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {/* FLEET STATUS */}
                                    <Card>
                                        <CardHeader className="border-b border-[#D7F2F8] bg-[#E8F8FC]">
                                            <CardTitle>
                                                Fleet Status
                                            </CardTitle>
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
                                                                                '#007BA7',
                                                                                '#FF6B00',
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

                                            <div className="flex justify-center gap-5 text-sm text-[#5E6A76]">
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

                                    {/* MONTHLY EARNINGS */}
                                    <Card>
                                        <CardHeader className="border-b border-[#D7F2F8] bg-[#E8F8FC]">
                                            <CardTitle>
                                                Monthly Earnings
                                            </CardTitle>

                                            <p className="text-sm text-[#5E6A76]">
                                                Your earnings from paid
                                                bookings
                                            </p>
                                        </CardHeader>

                                        <CardContent>
                                            {monthlyData.length === 0 ? (
                                                <p className="py-10 text-center text-sm text-[#5E6A76]">
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
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                stroke="#D7F2F8"
                                                            />

                                                            <XAxis
                                                                dataKey="month"
                                                                tick={{
                                                                    fontSize: 12,
                                                                    fill: '#5E6A76',
                                                                }}
                                                                axisLine={{
                                                                    stroke: '#D7F2F8',
                                                                }}
                                                                tickLine={{
                                                                    stroke: '#D7F2F8',
                                                                }}
                                                            />

                                                            <YAxis
                                                                tick={{
                                                                    fontSize: 12,
                                                                    fill: '#5E6A76',
                                                                }}
                                                                axisLine={{
                                                                    stroke: '#D7F2F8',
                                                                }}
                                                                tickLine={{
                                                                    stroke: '#D7F2F8',
                                                                }}
                                                            />

                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor:
                                                                        '#F0F9FC',
                                                                    border: '1px solid #D7F2F8',
                                                                    borderRadius:
                                                                        '12px',
                                                                    color: '#16425B',
                                                                }}
                                                                formatter={(
                                                                    value,
                                                                ) => [
                                                                    `ETB ${Number(
                                                                        value,
                                                                    ).toLocaleString()}`,
                                                                    'Revenue',
                                                                ]}
                                                            />

                                                            <Line
                                                                type="monotone"
                                                                dataKey="revenue"
                                                                stroke="#007BA7"
                                                                strokeWidth={3}
                                                                dot={{
                                                                    r: 4,
                                                                    fill: '#007BA7',
                                                                }}
                                                                activeDot={{
                                                                    r: 6,
                                                                    fill: '#87CEEB',
                                                                }}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* RECENT BOOKINGS */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#D7F2F8] bg-[#E8F8FC]">
                                        <CardTitle>
                                            Recent Bookings
                                        </CardTitle>

                                        <Link
                                            href="/bookings"
                                            className="text-xs font-medium text-[#007BA7] transition hover:text-[#16425B] hover:underline"
                                        >
                                            View all →
                                        </Link>
                                    </CardHeader>

                                    <CardContent>
                                        {recentBookings.length === 0 ? (
                                            <p className="py-6 text-center text-sm text-[#5E6A76]">
                                                No bookings yet.
                                            </p>
                                        ) : (
                                            <div className="divide-y divide-[#D7F2F8]">
                                                {recentBookings.map((b) => (
                                                    <div
                                                        key={b.id}
                                                        className="flex items-center justify-between py-4"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-[#16425B]">
                                                                {b.car
                                                                    ? `${b.car.brand} ${b.car.model}`
                                                                    : 'Vehicle'}
                                                            </p>

                                                            <p className="text-sm text-[#5E6A76]">
                                                                {b.pickup_date}{' '}
                                                                &middot;{' '}
                                                                {b.customer
                                                                    ?.name ??
                                                                    'N/A'}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                                BOOKING_STATUS_STYLES[
                                                                    b.status
                                                                ] ??
                                                                'bg-[#E8F8FC] text-[#5E6A76]'
                                                            }`}
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

                {/* =====================================================
                    DRIVER DASHBOARD
                ====================================================== */}

                {role === 'driver' &&
                    (() => {
                        const s = stats as DriverStats;

                        return (
                            <>
                                {/* DRIVER STATS */}
                                <div className="grid gap-4 md:grid-cols-3">
                                    <StatCard
                                        title="Pending"
                                        value={s.pending_assignments}
                                        icon={<Clock className="h-4 w-4" />}
                                        href="/driver/assignments"
                                        accent="text-[#FF6B00]"
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
                                        accent="text-emerald-600"
                                    />
                                </div>

                                {/* CURRENT ASSIGNMENTS */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between border-b border-[#D7F2F8] bg-[#E8F8FC]">
                                        <CardTitle>
                                            Current Assignments
                                        </CardTitle>

                                        <Link
                                            href="/driver/assignments"
                                            className="text-xs text-[#007BA7] transition hover:text-[#16425B] hover:underline"
                                        >
                                            View all →
                                        </Link>
                                    </CardHeader>

                                    <CardContent>
                                        {recentAssignments.length === 0 ? (
                                            <p className="text-sm text-[#5E6A76]">
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
                                                            className="space-y-2 rounded-lg border border-[#D7F2F8] bg-[#F7FCFF] p-4"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="font-semibold text-[#16425B]">
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

                                                                    <p className="text-sm text-[#5E6A76]">
                                                                        {
                                                                            assignment
                                                                                .car
                                                                                .plate_number
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                                        ASSIGNMENT_STATUS_STYLES[
                                                                            assignment
                                                                                .status
                                                                        ] ??
                                                                        'bg-[#E8F8FC] text-[#5E6A76]'
                                                                    }`}
                                                                >
                                                                    {
                                                                        assignment.status
                                                                    }
                                                                </span>
                                                            </div>

                                                            <p className="text-sm text-[#16425B]">
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

                                                            <div className="space-y-0.5 text-sm text-[#5E6A76]">
                                                                <p>
                                                                    <span className="font-medium text-[#16425B]">
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
                                                                    <span className="font-medium text-[#16425B]">
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