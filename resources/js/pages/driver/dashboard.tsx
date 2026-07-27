import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Truck, CheckCircle } from 'lucide-react';

interface Stats {
    pending_assignments: number;
    active_trips: number;
    completed_trips: number;
}

interface BookingInfo {
    id: number;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
}

interface CustomerInfo {
    name: string;
    phone: string;
}

interface CarInfo {
    brand: string;
    model: string;
    year: number;
    plate_number: string;
}

interface Assignment {
    id: number;
    status: string;
    assigned_at: string;
    booking: BookingInfo;
    customer: CustomerInfo;
    car: CarInfo;
}

interface Props {
    stats: Stats;
    recentAssignments: Assignment[];
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}

const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
    assigned: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
};

const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
    assigned: 'Pending — awaiting your response',
    accepted: 'Active — trip in progress',
    completed: 'Completed',
};

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

export default function DriverDashboard({ stats, recentAssignments = [] }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Driver Dashboard</h1>

                {/* Stat cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        title="Pending Assignments"
                        value={stats.pending_assignments}
                        icon={<Clock className="h-4 w-4" />}
                        description="Waiting for your response"
                    />
                    <StatCard
                        title="Active Trips"
                        value={stats.active_trips}
                        icon={<Truck className="h-4 w-4" />}
                        description="Currently in progress"
                    />
                    <StatCard
                        title="Completed Trips"
                        value={stats.completed_trips}
                        icon={<CheckCircle className="h-4 w-4" />}
                        description="Successfully finished"
                    />
                </div>

                {/* Active & pending assignments list */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Current Assignments</CardTitle>
                        <Link
                            href="/driver/assignments"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            View all →
                        </Link>
                    </CardHeader>

                    <CardContent>
                        {recentAssignments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No active assignments. The owner will assign you once a customer
                                books a vehicle with a driver.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentAssignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="rounded-lg border p-4 space-y-2"
                                    >
                                        {/* Car + status */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold">
                                                    {assignment.car.brand} {assignment.car.model}{' '}
                                                    <span className="font-normal text-muted-foreground">
                                                        ({assignment.car.year})
                                                    </span>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {assignment.car.plate_number}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    ASSIGNMENT_STATUS_STYLES[assignment.status] ??
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {assignment.status}
                                            </span>
                                        </div>

                                        {/* Status label */}
                                        <p className="text-xs text-muted-foreground">
                                            {ASSIGNMENT_STATUS_LABELS[assignment.status] ??
                                                assignment.status}
                                        </p>

                                        {/* Customer */}
                                        <p className="text-sm">
                                            <span className="font-medium">Customer: </span>
                                            {assignment.customer.name} &middot;{' '}
                                            {assignment.customer.phone}
                                        </p>

                                        {/* Dates */}
                                        <div className="text-sm space-y-0.5">
                                            <p>
                                                <span className="font-medium">Pickup: </span>
                                                {assignment.booking.pickup_date} &mdash;{' '}
                                                {assignment.booking.pickup_location}
                                            </p>
                                            <p>
                                                <span className="font-medium">Return: </span>
                                                {assignment.booking.return_date} &mdash;{' '}
                                                {assignment.booking.return_location}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DriverDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/driver/dashboard' }],
};
