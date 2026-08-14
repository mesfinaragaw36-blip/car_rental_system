import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Car as CarIcon,
    CheckCircle2,
    FileText,
    Fuel,
    Gauge,
    Palette,
    Power,
    PowerOff,
    Settings2,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCan } from '@/hooks/use-can';
import { cn } from '@/lib/utils';

interface VehicleDocument {
    id: number;
    document_type: string;
    document_path: string;
    expiry_date: string | null;
    verification_status: string;
    rejection_reason?: string | null;
}

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    category: string;
    color: string;
    fuel_type: string;
    transmission: string;
    engine_size: string | null;
    mileage: number | null;
    seats: number | null;
    daily_price: string;
    description: string | null;
    approval_status: string;
    availability_status: string;
    rejection_reason?: string | null;
    owner: { name: string; email: string };
    images: { id: number; image_path: string; is_primary: boolean }[];
    documents: VehicleDocument[];
    reviews?: Array<{
        id: number;
        reviewer: { id: number; name: string };
        rating: number;
        review_text: string | null;
        created_at: string;
    }>;
}

interface Props {
    vehicle: Vehicle;
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

function StatusBadge({
    label,
    tone,
}: {
    label: string;
    tone: 'green' | 'red' | 'yellow' | 'blue' | 'slate';
}) {
    const tones: Record<string, string> = {
        green: 'bg-green-100 text-green-700 ring-green-600/20',
        red: 'bg-red-100 text-red-700 ring-red-600/20',
        yellow: 'bg-brand-soft text-brand ring-brand/20',
        blue: 'bg-accent text-primary ring-primary/10',
        slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}
        >
            {label}
        </span>
    );
}

function approvalTone(status: string): 'green' | 'red' | 'yellow' | 'slate' {
    if (status === 'approved') {
        return 'green';
    }

    if (status === 'rejected') {
        return 'red';
    }

    if (status === 'pending') {
        return 'yellow';
    }

    return 'slate';
}

function documentTone(status: string): 'green' | 'red' | 'yellow' | 'slate' {
    if (status === 'approved') {
        return 'green';
    }

    if (status === 'rejected') {
        return 'red';
    }

    if (status === 'pending') {
        return 'yellow';
    }

    return 'slate';
}

function SpecTile({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <Icon className="h-4 w-4 text-primary" />
            <p className="mt-2 text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}

function CarGallery({ images }: { images: Vehicle['images'] }) {
    const [activeImage, setActiveImage] = useState(0);
    const currentImage = images[activeImage] ?? images[0];

    return (
        <div className="flex gap-3">
            {images.length > 1 && (
                <div className="flex flex-col gap-2">
                    {images.map((img, index) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => setActiveImage(index)}
                            className={cn(
                                'h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition',
                                index === activeImage
                                    ? 'border-primary shadow-sm'
                                    : 'border-transparent opacity-60 hover:opacity-100',
                            )}
                        >
                            <img
                                src={`/storage/${img.image_path}`}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="aspect-[4/3] w-full p-3">
                    {currentImage ? (
                        <img
                            src={`/storage/${currentImage.image_path}`}
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <CarIcon className="h-14 w-14 text-slate-300" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VehicleDetails({ vehicle }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;
    const can = useCan();

    const images = [...(vehicle.images ?? [])].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary),
    );

    const specs: Array<{
        icon: LucideIcon;
        label: string;
        value: string | number;
    }> = [
        {
            icon: Settings2,
            label: 'Transmission',
            value: vehicle.transmission,
        },
        { icon: Fuel, label: 'Fuel Type', value: vehicle.fuel_type },
        { icon: Users, label: 'Seats', value: vehicle.seats ?? '—' },
        { icon: Calendar, label: 'Year', value: vehicle.year },
        { icon: Palette, label: 'Color', value: vehicle.color },
        {
            icon: Zap,
            label: 'Engine Size',
            value: vehicle.engine_size ?? '—',
        },
        {
            icon: Gauge,
            label: 'Mileage',
            value:
                vehicle.mileage != null
                    ? `${vehicle.mileage.toLocaleString()} km`
                    : '—',
        },
        { icon: CarIcon, label: 'Category', value: vehicle.category },
    ];

    function handleApprove() {
        router.post(`/admin/vehicles/${vehicle.id}/approve`);
    }

    function handleReject() {
        const reason = prompt(
            'Please enter the reason for vehicle rejection:',
        );

        if (reason && reason.trim() !== '') {
            router.post(`/admin/vehicles/${vehicle.id}/reject`, {
                rejection_reason: reason,
            });
        }
    }

    function handleToggleStatus() {
        const isActive = vehicle.availability_status !== 'inactive';
        const msg = isActive
            ? 'Deactivate this vehicle? It will be hidden from bookings.'
            : 'Reactivate this vehicle?';
        if (confirm(msg)) {
            router.post(`/admin/vehicles/${vehicle.id}/toggle-status`, {}, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title={`${vehicle.brand} ${vehicle.model}`} />

            <div className="space-y-6 p-6">
                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                <Card className="overflow-hidden">
                    <div className="border-b bg-slate-50 px-5 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold">
                                    {vehicle.brand} {vehicle.model}
                                </h2>
                                <StatusBadge
                                    label={vehicle.approval_status.replace(
                                        '_',
                                        ' ',
                                    )}
                                    tone={approvalTone(vehicle.approval_status)}
                                />
                                <StatusBadge
                                    label={vehicle.availability_status.replace(
                                        '_',
                                        ' ',
                                    )}
                                    tone={
                                        vehicle.availability_status ===
                                        'available'
                                            ? 'green'
                                            : 'slate'
                                    }
                                />
                                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                    {vehicle.plate_number}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {vehicle.availability_status === 'inactive' ? 'Inactive' : 'Active'}
                                    </span>
                                    <button
                                        role="switch"
                                        aria-checked={vehicle.availability_status !== 'inactive'}
                                        title={vehicle.availability_status === 'inactive' ? 'Reactivate vehicle' : 'Deactivate vehicle'}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            vehicle.availability_status !== 'inactive' ? "border-green-500 bg-green-50" : "border-slate-300 bg-slate-100"
                                        )}
                                        onClick={handleToggleStatus}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                                                vehicle.availability_status !== 'inactive' ? "translate-x-5 bg-green-600" : "translate-x-0.5 bg-slate-400"
                                            )}
                                        />
                                    </button>
                                </div>

                                <Link href="/admin/vehicles">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="mr-1 h-4 w-4" />{' '}
                                        Back
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <CardContent className="space-y-6 p-5">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <CarGallery images={images} />

                            <div className="space-y-4">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {vehicle.year} ·{' '}
                                            {vehicle.category} ·{' '}
                                            {vehicle.owner.name}
                                        </p>
                                        <p className="mt-1 text-2xl font-bold">
                                            ETB{' '}
                                            {Number(
                                                vehicle.daily_price,
                                            ).toLocaleString()}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                {' '}
                                                / day
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="text-muted-foreground">
                                            Owner
                                        </p>
                                        <p className="text-lg font-bold">
                                            {vehicle.owner.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {vehicle.owner.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                    {specs.map((spec) => (
                                        <SpecTile key={spec.label} {...spec} />
                                    ))}
                                </div>

                                {vehicle.description && (
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            About this vehicle
                                        </h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                            {vehicle.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-slate-100 pt-5">
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Vehicle Documents
                                </h3>
                                {vehicle.documents.length === 0 ? (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        No documents uploaded.
                                    </p>
                                ) : (
                                    <div className="mt-2 space-y-3">
                                        {vehicle.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-slate-50/70 p-3"
                                            >
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-medium capitalize">
                                                        {doc.document_type.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        {doc.expiry_date && (
                                                            <span>
                                                                Expires:{' '}
                                                                {new Date(
                                                                    doc.expiry_date,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <a
                                                            href={`/storage/${doc.document_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            View file ↗
                                                        </a>
                                                    </div>
                                                    {doc.rejection_reason && (
                                                        <p className="mt-1 text-xs text-red-600">
                                                            Reason:{' '}
                                                            {doc.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>

                                                <StatusBadge
                                                    label={doc.verification_status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                    tone={documentTone(
                                                        doc.verification_status,
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {vehicle.rejection_reason && (
                                <div className="rounded-lg bg-red-50 p-3 text-red-800">
                                    <p className="text-xs font-semibold">
                                        Rejection Reason:
                                    </p>
                                    <p className="text-sm">
                                        {vehicle.rejection_reason}
                                    </p>
                                </div>
                            )}

                            {vehicle.approval_status === 'pending' &&
                                can('vehicles.approve') && (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50 p-4">
                                    <div>
                                        <p className="font-semibold">
                                            Approve or reject this vehicle
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Approving makes it visible to
                                            customers for rental bookings.
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Button onClick={handleApprove}>
                                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleReject}
                                        >
                                            <XCircle className="mr-1.5 h-4 w-4" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {vehicle.reviews &&
                                vehicle.reviews.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            Reviews
                                        </h3>
                                        <div className="mt-2 space-y-3">
                                            {vehicle.reviews.map((r) => (
                                                <div
                                                    key={r.id}
                                                    className="flex items-start justify-between gap-3 rounded-lg border bg-slate-50/70 p-3"
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {r.reviewer.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {r.rating} ★ ·{' '}
                                                            {new Date(
                                                                r.created_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                        {r.review_text && (
                                                            <p className="mt-2 text-sm text-muted-foreground">
                                                                {r.review_text}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    'Delete this review?',
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/admin/reviews/${r.id}`,
                                                                );
                                                            }
                                                        }}
                                                        disabled={!can('reviews.manage')}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

VehicleDetails.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Vehicles', href: '/admin/vehicles' },
        { title: 'Details', href: '#' },
    ],
};
