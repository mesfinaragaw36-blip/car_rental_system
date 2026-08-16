import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Car,
    CheckCircle2,
    ChevronLeft,
    Clock,
    FileText,
    Gauge,
    Image as ImageIcon,
    Info,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RequestProps {
    id: number;
    brand: string;
    model: string;
    year: string;
    category: string | null;
    color: string | null;
    fuel_type: string | null;
    transmission: string | null;
    engine_size: string | null;
    seats: string | number | null;
    plate_number: string | null;
    daily_price: string | number | null;
    mileage: string | number | null;
    description: string | null;
    note: string | null;
    photos: string[];
    document_path: string | null;
    status: string;
    admin_note: string | null;
    created_at: string | null;
    reviewed_at: string | null;
}

export default function CarTypeRequestStatus({
    request,
}: {
    request: RequestProps;
}) {
    const statusStyles: Record<string, { label: string; className: string }> = {
        pending: {
            label: 'Pending review',
            className: 'bg-amber-50 text-amber-600',
        },
        approved: {
            label: 'Approved',
            className: 'bg-emerald-50 text-emerald-600',
        },
        rejected: {
            label: 'Rejected',
            className: 'bg-red-50 text-red-600',
        },
    };

    const statusMeta = statusStyles[request.status] ?? statusStyles.pending;
    const StatusIcon =
        request.status === 'approved'
            ? CheckCircle2
            : request.status === 'rejected'
              ? XCircle
              : Clock;

    const specRows = [
        { label: 'Category', value: request.category },
        { label: 'Color', value: request.color },
        { label: 'Fuel type', value: request.fuel_type },
        { label: 'Transmission', value: request.transmission },
        { label: 'Engine size', value: request.engine_size },
        { label: 'Seats', value: request.seats },
        { label: 'Plate number', value: request.plate_number },
        {
            label: 'Daily price',
            value: request.daily_price ? `ETB ${request.daily_price}` : null,
        },
        {
            label: 'Mileage',
            value: request.mileage ? `${request.mileage} km` : null,
        },
    ];

    return (
        <>
            <Head title="Configuration Request" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div>
                    <Link
                        href="/vehicles"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to vehicles
                    </Link>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Configuration Request
                        </h1>
                        <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                            <Car className="h-4 w-4" />
                            {request.brand} {request.model} ({request.year})
                        </p>
                    </div>
                    <Badge
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                            statusMeta.className,
                        )}
                    >
                        <StatusIcon className="h-4 w-4" />
                        {statusMeta.label}
                    </Badge>
                </div>

                {request.status === 'rejected' && request.admin_note && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <p className="font-medium">Why it was rejected</p>
                        <p className="mt-1">{request.admin_note}</p>
                    </div>
                )}

                {request.status === 'pending' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        <p className="flex items-center gap-2 font-medium">
                            <Clock className="h-4 w-4" />
                            Waiting for review
                        </p>
                        <p className="mt-1">
                            An admin will review your request and create the
                            configuration. You&apos;ll be notified when
                            it&apos;s approved.
                        </p>
                    </div>
                )}

                {request.status === 'approved' && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        <p className="flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Approved
                        </p>
                        <p className="mt-1">
                            The configuration was created. You can now add your
                            vehicle using it.
                        </p>
                    </div>
                )}

                {request.note && (
                    <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                        <p className="flex items-center gap-2 font-medium">
                            <Info className="h-4 w-4" />
                            Your note to the admin
                        </p>
                        <p className="mt-1 text-muted-foreground">
                            {request.note}
                        </p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                            {specRows.map(
                                ({ label, value }) =>
                                    value != null && (
                                        <div
                                            key={label}
                                            className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0"
                                        >
                                            <dt className="text-sm text-muted-foreground">
                                                {label}
                                            </dt>
                                            <dd className="text-sm font-medium">
                                                {String(value)}
                                            </dd>
                                        </div>
                                    ),
                            )}
                        </dl>

                        {request.description && (
                            <p className="mt-4 text-sm text-muted-foreground">
                                {request.description}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {request.photos.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Photos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {request.photos.map((path, index) => (
                                    <a
                                        key={path}
                                        href={`/storage/${path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group overflow-hidden rounded-lg border"
                                    >
                                        <img
                                            src={`/storage/${path}`}
                                            alt={`Photo ${index + 1}`}
                                            className="h-32 w-full object-cover transition-opacity group-hover:opacity-90"
                                        />
                                    </a>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {request.document_path && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Ownership Document
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <a
                                href={`/storage/${request.document_path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                            >
                                <FileText className="h-4 w-4" />
                                View document
                            </a>
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        Submitted {request.created_at}
                    </span>
                    {request.reviewed_at && (
                        <span className="flex items-center gap-1.5">
                            <Gauge className="h-4 w-4" />
                            Reviewed {request.reviewed_at}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
}

CarTypeRequestStatus.layout = {
    breadcrumbs: [
        { title: 'Vehicles', href: '/vehicles' },
        { title: 'Configuration Request', href: '' },
    ],
};
