import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarRange,
    Car,
    Pause,
    Pencil,
    Play,
    Plus,
    Settings2,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { CarDetailsModal } from '@/components/car-details-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlareCard } from '@/components/ui/glare-card';
import { destroy, toggleAvailability } from '@/routes/vehicles';

interface CarImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface AvailablePeriod {
    id: number;
    start_date: string;
    end_date: string;
}

interface LatestReview {
    reviewer: { id: number; name: string };
    rating: number;
    review_text: string | null;
    created_at: string;
}

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    daily_price: string;
    fuel_type: string;
    transmission: string;
    seats: number | null;
    category: string;
    color: string;
    engine_size: string | null;
    mileage: number | null;
    description: string | null;
    approval_status: string;
    availability_status: string;
    images: CarImage[];
    available_periods?: AvailablePeriod[];
    average_rating?: number;
    review_count?: number;
    latest_review?: LatestReview | null;
}

interface Props {
    role: string;
    vehicles: Vehicle[];
    ownerVerificationStatus: string | null;
}
export default function Vehicles({
    role,
    vehicles = [],
    ownerVerificationStatus,
}: Props) {
    const { props: p } = usePage<{
        toast?: { type: string; message: string };
    }>();
    const toast = p.toast;
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
        null,
    );
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this Car?')) {
            router.delete(destroy.url({ car: id }), { preserveScroll: true });
        }
    };

    const handleToggle = (id: number) => {
        router.post(
            toggleAvailability.url({ car: id }),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="My Cars" />
            <div className="space-y-8 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Cars</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage all your listed cars in one place.
                        </p>
                    </div>
                    {(role === 'admin' ||
                        (role === 'owner' &&
                            ownerVerificationStatus === 'approved')) && (
                        <Link href="/vehicles/create">
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Add Cars
                            </Button>
                        </Link>
                    )}
                </div>

                {toast && (
                    <div
                        className={`rounded-lg p-4 ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                {role === 'owner' && ownerVerificationStatus !== 'approved' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                        <p className="font-semibold">
                            {ownerVerificationStatus === 'rejected'
                                ? 'Your owner profile verification was rejected'
                                : 'Your owner profile is not verified yet'}
                        </p>

                        <p className="mt-1 text-sm">
                            {ownerVerificationStatus === 'rejected'
                                ? 'Please update your owner profile and resubmit it for verification before adding a car.'
                                : 'Please complete and verify your owner profile before adding a car.'}
                        </p>

                        <Link
                            href="/settings/profile"
                            className="mt-2 inline-block text-sm font-medium text-amber-900 underline"
                        >
                            {ownerVerificationStatus === 'rejected'
                                ? 'Update your profile'
                                : 'Complete your profile'}
                        </Link>
                    </div>
                )}

                {vehicles.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Car className="mb-4 h-16 w-16 text-slate-400" />
                            <h2 className="text-xl font-semibold">
                                No cars yet
                            </h2>
                            <p className="mt-2 text-center text-muted-foreground">
                                Start growing your fleet by adding your first
                                car.
                            </p>
                            {(role === 'admin' ||
                                (role === 'owner' &&
                                    ownerVerificationStatus ===
                                        'approved')) && (
                                <Link href="/vehicles/create">
                                    <Button className="bg-primary hover:bg-primary/90">
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Car
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {vehicles.map((vehicle) => {
                            const image =
                                vehicle.images?.find((img) => img.is_primary)
                                    ?.image_path ??
                                vehicle.images?.[0]?.image_path;

                            return (
                                <GlareCard
                                    key={vehicle.id}
                                    className="w-full cursor-pointer"
                                    onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setDetailsOpen(true);
                                    }}
                                >
                                    <div className="w-full p-2.5">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-[14px] p-2">
                                            {image ? (
                                                <img
                                                    src={`/storage/${image}`}
                                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Car className="h-12 w-12 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-start justify-between gap-3 px-1 pb-1">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-bold text-slate-900">
                                                    {vehicle.brand}{' '}
                                                    {vehicle.model}
                                                </h3>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Settings2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    {vehicle.transmission}
                                                </p>
                                                {vehicle.average_rating !==
                                                    undefined && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {vehicle.average_rating}{' '}
                                                        ★ ·{' '}
                                                        {vehicle.review_count ??
                                                            0}{' '}
                                                        review
                                                        {(vehicle.review_count ??
                                                            0) === 1
                                                            ? ''
                                                            : 's'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    ETB{' '}
                                                    {Number(
                                                        vehicle.daily_price,
                                                    ).toLocaleString()}
                                                </p>
                                                <p className="text-xs font-medium text-slate-400">
                                                    per day
                                                </p>
                                            </div>
                                        </div>
                                        {vehicle.latest_review && (
                                            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                                <p className="font-semibold">
                                                    Latest Review
                                                </p>
                                                <p className="mt-0.5">
                                                    {
                                                        vehicle.latest_review
                                                            .reviewer.name
                                                    }{' '}
                                                    ·{' '}
                                                    {
                                                        vehicle.latest_review
                                                            .rating
                                                    }{' '}
                                                    ★
                                                </p>
                                                {vehicle.latest_review
                                                    .review_text && (
                                                    <p className="mt-1 text-muted-foreground">
                                                        {
                                                            vehicle
                                                                .latest_review
                                                                .review_text
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </GlareCard>
                            );
                        })}
                    </div>
                )}

                <CarDetailsModal
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    car={selectedVehicle}
                    actions={
                        <div className="w-full space-y-4">
                            <div className="rounded-xl border border-slate-200 p-4 text-left">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <CalendarRange className="h-4 w-4 text-primary" />{' '}
                                    Available Dates
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Customers can only book this car during
                                    these date ranges.
                                </p>

                                {selectedVehicle?.available_periods &&
                                selectedVehicle.available_periods.length > 0 ? (
                                    <ul className="mt-3 space-y-2">
                                        {selectedVehicle.available_periods.map(
                                            (period) => (
                                                <li
                                                    key={period.id}
                                                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm"
                                                >
                                                    <p className="font-medium text-slate-800">
                                                        {period.start_date} →{' '}
                                                        {period.end_date}
                                                    </p>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                ) : (
                                    <p className="mt-3 text-sm text-slate-500">
                                        No available date ranges set.
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        if (selectedVehicle) {
                                            router.get(
                                                `/vehicles/${selectedVehicle.id}/edit`,
                                            );
                                        }
                                    }}
                                >
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Button>
                                {selectedVehicle &&
                                    (selectedVehicle.availability_status ===
                                        'available' ||
                                        selectedVehicle.availability_status ===
                                            'maintenance') && (
                                        <Button
                                            variant={
                                                selectedVehicle.availability_status ===
                                                'available'
                                                    ? 'outline'
                                                    : 'default'
                                            }
                                            className="flex-1"
                                            onClick={() =>
                                                handleToggle(selectedVehicle.id)
                                            }
                                        >
                                            {selectedVehicle.availability_status ===
                                            'available' ? (
                                                <Pause className="mr-2 h-4 w-4" />
                                            ) : (
                                                <Play className="mr-2 h-4 w-4" />
                                            )}
                                            {selectedVehicle.availability_status ===
                                            'available'
                                                ? 'Pause'
                                                : 'Resume'}
                                        </Button>
                                    )}
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                        if (selectedVehicle) {
                                            handleDelete(selectedVehicle.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </div>
                        </div>
                    }
                />
            </div>
        </>
    );
}

Vehicles.layout = {
    breadcrumbs: [{ title: 'Cars', href: '/vehicles' }],
};
