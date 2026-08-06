import {
    Calendar,
    Car as CarIcon,
    Fuel,
    Gauge,
    Palette,
    Settings2,
    Users,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface CarDetailsImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

export interface CarDetails {
    id: number;
    brand: string;
    model: string;
    year: number;
    fuel_type: string;
    transmission: string;
    daily_price: string;
    category: string;
    color: string;
    engine_size: string | null;
    mileage: number | null;
    seats: number | null;
    description: string | null;
    availability_status?: string;
    approval_status?: string;
    plate_number?: string;
    images: CarDetailsImage[];
    owner?: { id: number; name: string; phone: string } | null;
    car_type_name?: { id: number; name: string } | null;
}

interface CarDetailsModalProps {
    open: boolean;
    onClose: () => void;
    car: CarDetails | null;
    actions?: ReactNode;
}

function formatPrice(value: string | number) {
    return Number(value).toLocaleString();
}

function getInitials(name?: string) {
    if (!name) {
        return '?';
    }

    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
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
            <Icon className="h-4 w-4 text-blue-600" />
            <p className="mt-2 text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}

function CarGallery({ images }: { images: CarDetailsImage[] }) {
    const [activeImage, setActiveImage] = useState(0);
    const currentImage = images[activeImage] ?? images[0];

    return (
        <div className="relative">
            <div className="aspect-[16/10] w-full p-2">
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
            {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
                    {images.map((img, index) => (
                        <button
                            key={img.id}
                            type="button"
                            onClick={() => setActiveImage(index)}
                            className={cn(
                                'h-12 w-16 overflow-hidden rounded-lg border-2 transition',
                                index === activeImage
                                    ? 'border-white shadow-lg'
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
        </div>
    );
}

export function CarDetailsModal({
    open,
    onClose,
    car,
    actions,
}: CarDetailsModalProps) {
    if (!car) {
        return null;
    }

    const images = [...car.images].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary),
    );
    const specs: Array<{
        icon: LucideIcon;
        label: string;
        value: string | number;
    }> = [
        { icon: Settings2, label: 'Transmission', value: car.transmission },
        { icon: Fuel, label: 'Fuel Type', value: car.fuel_type },
        { icon: Users, label: 'Seats', value: car.seats ?? '—' },
        { icon: Calendar, label: 'Year', value: car.year },
        { icon: Palette, label: 'Color', value: car.color },
        { icon: Zap, label: 'Engine Size', value: car.engine_size ?? '—' },
        {
            icon: Gauge,
            label: 'Mileage',
            value:
                car.mileage != null
                    ? `${car.mileage.toLocaleString()} km`
                    : '—',
        },
        {
            icon: CarIcon,
            label: 'Category',
            value: car.car_type_name?.name ?? car.category,
        },
    ];

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
                <DialogTitle className="sr-only">
                    {car.brand} {car.model}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Details for {car.brand} {car.model}.
                </DialogDescription>

                <CarGallery key={car.id} images={images} />

                <div className="px-6 pt-5 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {car.availability_status && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {car.availability_status}
                            </span>
                        )}
                        {car.approval_status && (
                            <span
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-semibold',
                                    car.approval_status === 'approved'
                                        ? 'bg-green-50 text-green-700'
                                        : car.approval_status === 'pending'
                                          ? 'bg-amber-50 text-amber-700'
                                          : 'bg-red-50 text-red-600',
                                )}
                            >
                                {car.approval_status}
                            </span>
                        )}
                        {car.plate_number && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                {car.plate_number}
                            </span>
                        )}
                    </div>

                    <h2 className="mt-3 text-2xl font-bold text-slate-900">
                        {car.brand} {car.model}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                        {car.year} · {car.car_type_name?.name ?? car.category}
                    </p>

                    <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">
                            ETB {formatPrice(car.daily_price)}
                        </span>
                        <span className="text-sm text-slate-500">/ day</span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {specs.map((spec) => (
                            <SpecTile key={spec.label} {...spec} />
                        ))}
                    </div>

                    {car.description && (
                        <div className="mt-5">
                            <h3 className="text-sm font-semibold text-slate-900">
                                About this vehicle
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                                {car.description}
                            </p>
                        </div>
                    )}

                    {car.owner && (
                        <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                {getInitials(car.owner.name)}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                    {car.owner.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Vehicle Owner
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {actions && (
                    <DialogFooter className="gap-2 border-t border-slate-100 px-6 py-4">
                        {actions}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
