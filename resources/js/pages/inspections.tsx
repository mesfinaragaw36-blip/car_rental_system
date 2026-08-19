
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownToLine,
    Calendar,
    Car as CarIcon,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Fuel,
    Gauge,
    KeyRound,
    PackageCheck,
    Palette,
    Plus,
    Settings2,
    Timer,
    Trash2,
    TriangleAlert,
    Truck,
    Users,
    Wrench,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlareCard } from '@/components/ui/glare-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import inspections from '@/routes/inspections';

interface CarImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Damage {
    area: string;
    description: string;
}

interface InspectionRecord {
    id: number;
    type: 'pickup' | 'return';
    status: 'approved' | 'issues_found' | 'pending';
    conducted_at: string | null;
    conducted_by_name: string | null;
    mileage_reading: number | null;
    fuel_level: number | null;
    damages: Damage[] | null;
    notes: string | null;
    photos?: string[] | null;
    id_verified?: boolean | null;
    id_verified_by_name?: string | null;
    id_verified_at?: string | null;
}

type DeliveryStatus = 'pending' | 'arrived' | 'failed';

type ReturnArrivalStatus = 'pending' | 'arrived';

interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    total_price: string;
    security_deposit_amount: string | number;
    car_delivery_status: DeliveryStatus;
    car_delivery_confirmed_at: string | null;
    car_delivery_due_date: string;
    return_arrival_status: ReturnArrivalStatus;
    return_arrival_confirmed_at: string | null;
    returned_at: string | null;
    late_return_days: number;
    car: {
        id: number;
        brand: string;
        model: string;
        year: number;
        plate_number: string;
        estimated_value: string | number | null;
        daily_price: string;
        fuel_type: string;
        transmission: string;
        seats: number | null;
        category: string;
        color: string;
        engine_size: string | null;
        mileage: number | null;
        description: string | null;
        images: CarImage[];
    };
    customer: {
        id: number;
        name: string;
        phone: string;
        national_id?: string | null;
    } | null;
    owner: { id: number; name: string; phone: string } | null;
    inspections: InspectionRecord[];
}

interface Props {
    pickup_queue: Booking[];
    return_queue: Booking[];
    awaiting_completion: Booking[];
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

function deliveryTone(
    status: DeliveryStatus,
): 'green' | 'red' | 'yellow' {
    if (status === 'arrived') {
        return 'green';
    }

    if (status === 'failed') {
        return 'red';
    }

    return 'yellow';
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
        <div className="rounded-xl border border-slate-200/70 bg-background/70 p-3">
            <Icon className="h-4 w-4 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                {value}
            </p>
        </div>
    );
}

function CarGallery({ images }: { images: CarImage[] }) {
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

            <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-background/60">
                <div className="aspect-[4/3] w-full p-3">
                    {currentImage ? (
                        <img
                            src={`/storage/${currentImage.image_path}`}
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <CarIcon className="h-14 w-14 text-muted-foreground/40" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DeliveryPanel({ booking }: { booking: Booking }) {
    const [processing, setProcessing] = useState<
        'arrived' | 'failed' | null
    >(null);

    const status = booking.car_delivery_status;

    const confirm = (deliveryStatus: 'arrived' | 'failed') => {
        if (
            deliveryStatus === 'failed' &&
            !window.confirm(
                'Mark this car as not delivered? The owner and admins will be notified.',
            )
        ) {
            return;
        }

        setProcessing(deliveryStatus);

        router.post(
            inspections.delivery.url({ booking: booking.id }),
            { status: deliveryStatus },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            },
        );
    };

    return (
        <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    {status === 'arrived' ? (
                        <PackageCheck className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : status === 'failed' ? (
                        <TriangleAlert className="mt-0.5 h-5 w-5 text-red-600" />
                    ) : (
                        <Truck className="mt-0.5 h-5 w-5 text-brand" />
                    )}

                    <div>
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                            Owner car delivery

                            <StatusBadge
                                label={status.replace('_', ' ')}
                                tone={deliveryTone(status)}
                            />
                        </p>

                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Due by {booking.car_delivery_due_date} at{' '}
                            {booking.pickup_location}.
                        </p>

                        {status !== 'pending' &&
                            booking.car_delivery_confirmed_at && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Confirmed{' '}
                                    {new Date(
                                        booking.car_delivery_confirmed_at,
                                    ).toLocaleString()}
                                </p>
                            )}
                    </div>
                </div>

                {status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            disabled={processing !== null}
                            onClick={() => confirm('arrived')}
                        >
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />

                            {processing === 'arrived'
                                ? 'Confirming...'
                                : 'Car Arrived'}
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={processing !== null}
                            onClick={() => confirm('failed')}
                        >
                            <XCircle className="mr-1.5 h-4 w-4" />

                            {processing === 'failed'
                                ? 'Marking...'
                                : 'Car Not Delivered'}
                        </Button>
                    </div>
                )}

                {status === 'failed' && (
                    <p className="w-full text-sm text-red-600">
                        The owner and admins have been notified. The booking
                        has been cancelled and the customer's payment has been
                        queued for refund.
                    </p>
                )}
            </div>
        </div>
    );
}

function ReturnArrivalPanel({ booking }: { booking: Booking }) {
    const [processing, setProcessing] = useState(false);
    const status = booking.return_arrival_status;
    const lateDays = booking.late_return_days;

    const confirmArrival = () => {
        setProcessing(true);

        router.post(
            inspections.returnArrival.url({ booking: booking.id }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const markNotArrived = () => {
        if (
            !window.confirm(
                'Mark this car as not returned? Platform admins will be notified.',
            )
        ) {
            return;
        }

        setProcessing(true);

        router.post(
            inspections.returnNotArrived.url({ booking: booking.id }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="rounded-xl border border-border bg-background/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    {status === 'arrived' ? (
                        <PackageCheck className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : (
                        <KeyRound className="mt-0.5 h-5 w-5 text-brand" />
                    )}

                    <div>
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                            Customer car return

                            <StatusBadge
                                label={
                                    status === 'arrived'
                                        ? 'arrived'
                                        : 'pending'
                                }
                                tone={
                                    status === 'arrived'
                                        ? 'green'
                                        : 'yellow'
                                }
                            />

                            {lateDays > 0 && status === 'pending' && (
                                <StatusBadge
                                    label={`Late by ${lateDays} day${
                                        lateDays > 1 ? 's' : ''
                                    }`}
                                    tone="red"
                                />
                            )}
                        </p>

                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {status === 'arrived'
                                ? `Car confirmed back at ${booking.return_location}.`
                                : `Waiting for the customer to return the car to ${booking.return_location}.`}
                        </p>

                        {status === 'arrived' &&
                            booking.return_arrival_confirmed_at && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Confirmed{' '}
                                    {new Date(
                                        booking.return_arrival_confirmed_at,
                                    ).toLocaleString()}
                                </p>
                            )}
                    </div>
                </div>

                {status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                        <Button
                            type="button"
                            size="sm"
                            disabled={processing}
                            onClick={confirmArrival}
                        >
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />

                            {processing
                                ? 'Confirming...'
                                : 'Car Arrived'}
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={processing}
                            onClick={markNotArrived}
                        >
                            <XCircle className="mr-1.5 h-4 w-4" />

                            {processing
                                ? 'Marking...'
                                : 'Car Not Returned'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function SnapshotDiff({
    pickup,
    current,
}: {
    pickup: InspectionRecord;
    current: {
        mileage: string;
        fuel: string;
        damages: Damage[];
    };
}) {
    const mileageDiff =
        pickup.mileage_reading !== null &&
        current.mileage.trim() !== ''
            ? Math.max(
                  0,
                  Number(current.mileage) -
                      Number(pickup.mileage_reading),
              )
            : null;

    const fuelDiff =
        pickup.fuel_level !== null &&
        current.fuel.trim() !== ''
            ? Number(current.fuel) -
              Number(pickup.fuel_level)
            : null;

    const submitted = current.damages.filter(
        (d) =>
            d.area.trim() !== '' ||
            d.description.trim() !== '',
    );

    const pickupDamageKeys = new Set(
        (pickup.damages ?? []).map(
            (d) =>
                `${d.area.trim().toLowerCase()}|${d.description
                    .trim()
                    .toLowerCase()}`,
        ),
    );

    const newDamages = submitted.filter(
        (d) =>
            !pickupDamageKeys.has(
                `${d.area.trim().toLowerCase()}|${d.description
                    .trim()
                    .toLowerCase()}`,
            ),
    );

    return (
        <div className="rounded-lg border border-accent bg-accent/60 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-primary">
                <Timer className="h-4 w-4" />
                Diff vs pickup snapshot
            </p>

            <div className="mt-2 grid gap-2 text-primary sm:grid-cols-3">
                <p>
                    Miles driven:{' '}
                    <span className="font-semibold">
                        {mileageDiff !== null
                            ? `${mileageDiff.toLocaleString()} km`
                            : '—'}
                    </span>
                </p>

                <p>
                    Fuel delta:{' '}
                    <span className="font-semibold">
                        {fuelDiff !== null
                            ? `${fuelDiff > 0 ? '+' : ''}${fuelDiff}%`
                            : '—'}
                    </span>
                </p>

                <p>
                    New damages:{' '}
                    <span className="font-semibold">
                        {newDamages.length}
                    </span>
                </p>
            </div>

            {newDamages.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-red-700">
                    {newDamages.map((damage, i) => (
                        <li key={i}>
                            <span className="font-medium">
                                {damage.area}
                            </span>{' '}
                            - {damage.description}
                        </li>
                    ))}
                </ul>
            )}

            {newDamages.length === 0 &&
                submitted.length === 0 && (
                    <p className="mt-2 text-primary">
                        No new damages reported yet. Remember to record
                        any damages found during the return inspection.
                    </p>
                )}
        </div>
    );
}

function InspectionForm({
    booking,
    type,
    onClose,
}: {
    booking: Booking;
    type: 'pickup' | 'return';
    onClose?: () => void;
}) {
    const {
        data,
        setData,
        processing,
        errors,
        reset,
    } = useForm({
        type,
        status: 'approved',
        mileage_reading: '',
        fuel_level: '',
        estimated_value:
            booking.car.estimated_value?.toString() ?? '',
        damages: [
            {
                area: '',
                description: '',
            },
        ] as Damage[],
        notes: '',
        photos: [] as File[],
    });

    const pickup = booking.inspections.find(
        (inspection) =>
            inspection.type === 'pickup',
    );

    const addDamage = () => {
        setData('damages', [
            ...data.damages,
            {
                area: '',
                description: '',
            },
        ]);
    };

    const updateDamage = (
        index: number,
        field: keyof Damage,
        value: string,
    ) => {
        setData(
            'damages',
            data.damages.map((damage, i) =>
                i === index
                    ? {
                          ...damage,
                          [field]: value,
                      }
                    : damage,
            ),
        );
    };

    const removeDamage = (index: number) => {
        setData(
            'damages',
            data.damages.filter(
                (_, i) => i !== index,
            ),
        );
    };

    const damagesToSubmit =
        data.damages.filter(
            (damage) =>
                damage.area.trim() !== '' ||
                damage.description.trim() !== '',
        );

    const submitWith = (
        status: 'approved' | 'issues_found',
    ) => {
        const formData = new FormData();

        formData.append('type', type);
        formData.append('status', status);
        formData.append(
            'mileage_reading',
            data.mileage_reading,
        );
        formData.append(
            'fuel_level',
            data.fuel_level,
        );
        formData.append(
            'estimated_value',
            data.estimated_value,
        );
        formData.append('notes', data.notes);

        damagesToSubmit.forEach((d, i) => {
            formData.append(
                `damages[${i}][area]`,
                d.area,
            );

            formData.append(
                `damages[${i}][description]`,
                d.description,
            );
        });

        data.photos.forEach((photo) => {
            formData.append('photos[]', photo);
        });

        router.post(
            inspections.conduct.url({
                booking: booking.id,
            }),
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    reset();

                    if (onClose) {
                        onClose();
                    }
                },
            },
        );
    };

    return (
        <div className="space-y-4 rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Record{' '}
                {type === 'pickup'
                    ? 'Pickup'
                    : 'Return'}{' '}
                Inspection
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>
                        {type === 'pickup'
                            ? 'Mileage'
                            : 'Return mileage'}{' '}
                        (km)
                    </Label>

                    <Input
                        type="number"
                        min={0}
                        value={data.mileage_reading}
                        onChange={(e) =>
                            setData(
                                'mileage_reading',
                                e.target.value,
                            )
                        }
                        placeholder="e.g. 45230"
                    />

                    {errors.mileage_reading && (
                        <p className="text-xs text-red-600">
                            {errors.mileage_reading}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Fuel level (%)</Label>

                    <Input
                        type="number"
                        min={0}
                        max={100}
                        value={data.fuel_level}
                        onChange={(e) =>
                            setData(
                                'fuel_level',
                                e.target.value,
                            )
                        }
                        placeholder="e.g. 75"
                    />

                    {errors.fuel_level && (
                        <p className="text-xs text-red-600">
                            {errors.fuel_level}
                        </p>
                    )}
                </div>
            </div>

            {type === 'pickup' && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="max-w-sm space-y-1">
                            <Label>
                                Estimated car value (ETB)
                            </Label>

                            <Input
                                type="number"
                                min={0}
                                value={
                                    data.estimated_value
                                }
                                onChange={(e) =>
                                    setData(
                                        'estimated_value',
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. 2500000"
                            />

                            <p className="text-xs text-muted-foreground">
                                Used to calculate the 10%
                                security deposit (minimum
                                1,000 ETB).
                            </p>
                        </div>

                        <div className="text-right text-sm">
                            <p className="text-muted-foreground">
                                Security deposit
                            </p>

                            <p className="text-xl font-bold text-emerald-700">
                                ETB{' '}
                                {Number(
                                    booking.security_deposit_amount,
                                ).toLocaleString()}
                            </p>

                            {booking.car.estimated_value ? (
                                <p className="text-xs text-muted-foreground">
                                    10% of ETB{' '}
                                    {Number(
                                        booking.car
                                            .estimated_value,
                                    ).toLocaleString()}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Enter the value to update
                                    the deposit.
                                </p>
                            )}
                        </div>
                    </div>

                    {errors.estimated_value && (
                        <p className="mt-2 text-xs text-red-600">
                            {errors.estimated_value}
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Damages</Label>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addDamage}
                    >
                        <Plus className="mr-1 h-3 w-3" />
                        Add damage
                    </Button>
                </div>

                {data.damages.map(
                    (damage, index) => (
                        <div
                            key={index}
                            className="grid gap-2 md:grid-cols-[1fr_2fr_auto]"
                        >
                            <Input
                                value={damage.area}
                                onChange={(e) =>
                                    updateDamage(
                                        index,
                                        'area',
                                        e.target.value,
                                    )
                                }
                                placeholder="Area (e.g. front bumper)"
                            />

                            <Input
                                value={
                                    damage.description
                                }
                                onChange={(e) =>
                                    updateDamage(
                                        index,
                                        'description',
                                        e.target.value,
                                    )
                                }
                                placeholder="Description"
                            />

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    removeDamage(
                                        index,
                                    )
                                }
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ),
                )}
            </div>

            {type === 'return' &&
                pickup &&
                pickup.status === 'approved' && (
                    <SnapshotDiff
                        pickup={pickup}
                        current={{
                            mileage:
                                data.mileage_reading,
                            fuel: data.fuel_level,
                            damages:
                                damagesToSubmit,
                        }}
                    />
                )}

            <div className="space-y-2">
                <Label>
                    Evidence Photos (Before / After
                    inspection)
                </Label>

                <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files) {
                            setData(
                                'photos',
                                Array.from(
                                    e.target.files,
                                ),
                            );
                        }
                    }}
                />

                {errors.photos && (
                    <p className="text-xs text-red-600">
                        {errors.photos}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Notes</Label>

                <Textarea
                    value={data.notes}
                    onChange={(e) =>
                        setData(
                            'notes',
                            e.target.value,
                        )
                    }
                    placeholder="Additional observations..."
                    rows={3}
                />

                {errors.notes && (
                    <p className="text-xs text-red-600">
                        {errors.notes}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={() =>
                        submitWith('approved')
                    }
                    disabled={processing}
                >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />

                    {processing
                        ? 'Saving...'
                        : 'Approve'}
                </Button>

                <Button
                    variant="destructive"
                    disabled={processing}
                    onClick={() => {
                        if (
                            type === 'pickup' &&
                            !window.confirm(
                                'Reject this pickup inspection? The booking will be cancelled and the 10% deposit refunded to the customer.',
                            )
                        ) {
                            return;
                        }

                        submitWith('issues_found');
                    }}
                >
                    <XCircle className="mr-1.5 h-4 w-4" />

                    {processing
                        ? 'Saving...'
                        : type === 'pickup'
                          ? 'Reject (Cancel & Refund)'
                          : 'Issues found'}
                </Button>
            </div>
        </div>
    );
}

function InspectionBadges({
    inspections,
}: {
    inspections: InspectionRecord[];
}) {
    if (inspections.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No inspections recorded yet.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {inspections.map((inspection) => (
                <div
                    key={inspection.id}
                    className="rounded-lg border border-border bg-background p-3 text-sm"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 font-semibold capitalize text-foreground">
                            {inspection.type ===
                            'pickup' ? (
                                <ArrowDownToLine className="h-4 w-4 text-primary" />
                            ) : (
                                <Gauge className="h-4 w-4 text-primary" />
                            )}

                            {inspection.type}{' '}
                            inspection
                        </span>

                        <StatusBadge
                            label={inspection.status.replace(
                                '_',
                                ' ',
                            )}
                            tone={
                                inspection.status ===
                                'approved'
                                    ? 'green'
                                    : inspection.status ===
                                        'issues_found'
                                      ? 'red'
                                      : 'yellow'
                            }
                        />
                    </div>

                    <p className="mt-1 text-muted-foreground">
                        {inspection.conducted_at
                            ? `${new Date(
                                  inspection.conducted_at,
                              ).toLocaleString()} by ${
                                  inspection.conducted_by_name ??
                                  'staff'
                              }`
                            : 'Conducted'}

                        {inspection.mileage_reading !==
                            null &&
                            ` · ${inspection.mileage_reading.toLocaleString()} km`}

                        {inspection.fuel_level !==
                            null &&
                            ` · ${inspection.fuel_level}% fuel`}
                    </p>

                    {inspection.type ===
                        'pickup' && (
                        <div className="mt-2">
                            {inspection.id_verified ? (
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Check className="h-3.5 w-3.5 text-green-600" />

                                    <span className="font-medium text-green-700">
                                        ID Verified
                                    </span>

                                    {inspection.id_verified_by_name && (
                                        <span className="text-muted-foreground">
                                            · by{' '}
                                            {
                                                inspection.id_verified_by_name
                                            }
                                        </span>
                                    )}

                                    {inspection.id_verified_at && (
                                        <span className="text-muted-foreground">
                                            ·{' '}
                                            {new Date(
                                                inspection.id_verified_at,
                                            ).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-sm">
                                    <X className="h-3.5 w-3.5 text-amber-600" />

                                    <span className="font-medium text-amber-700">
                                        ID Verification
                                        Pending
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {inspection.damages &&
                        inspection.damages.length >
                            0 && (
                            <ul className="mt-2 list-inside list-disc text-red-600">
                                {inspection.damages.map(
                                    (damage, i) => (
                                        <li key={i}>
                                            <span className="font-medium">
                                                {
                                                    damage.area
                                                }
                                            </span>{' '}
                                            -{' '}
                                            {
                                                damage.description
                                            }
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}

                    {inspection.notes && (
                        <p className="mt-2 text-muted-foreground">
                            {inspection.notes}
                        </p>
                    )}

                    {inspection.photos &&
                        inspection.photos.length >
                            0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {inspection.photos.map(
                                    (path, i) => (
                                        <a
                                            key={i}
                                            href={`/storage/${path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block h-16 w-16 overflow-hidden rounded-md border border-border shadow-sm hover:opacity-90"
                                        >
                                            <img
                                                src={`/storage/${path}`}
                                                alt="Evidence"
                                                className="h-full w-full object-cover"
                                            />
                                        </a>
                                    ),
                                )}
                            </div>
                        )}
                </div>
            ))}
        </div>
    );
}

function CompletionCard({
    booking,
}: {
    booking: Booking;
}) {
    const [repairCost, setRepairCost] =
        useState('');
    const [processing, setProcessing] =
        useState(false);

    const returnInspection =
        booking.inspections.find(
            (inspection) =>
                inspection.type === 'return',
        );

    const hasIssues =
        returnInspection?.status ===
        'issues_found';

    const handleComplete = () => {
        if (hasIssues && !repairCost.trim()) {
            return;
        }

        setProcessing(true);

        router.post(
            inspections.complete.url({
                booking: booking.id,
            }),
            hasIssues
                ? { repair_cost: repairCost }
                : {},
            {
                preserveScroll: true,
                onFinish: () =>
                    setProcessing(false),
            },
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-end gap-3">
                {hasIssues && (
                    <div className="space-y-1">
                        <Label>
                            Repair cost (deducted from
                            security deposit)
                        </Label>

                        <Input
                            type="number"
                            min={0}
                            value={repairCost}
                            onChange={(e) =>
                                setRepairCost(
                                    e.target.value,
                                )
                            }
                            placeholder="e.g. 2000"
                            className="w-56"
                        />

                        {!repairCost.trim() && (
                            <p className="text-xs text-red-600">
                                Required when damages
                                are found.
                            </p>
                        )}
                    </div>
                )}

                <Button
                    onClick={handleComplete}
                    disabled={
                        !returnInspection ||
                        (hasIssues &&
                            !repairCost.trim()) ||
                        processing
                    }
                >
                    <Check className="mr-2 h-4 w-4" />
                    Mark Completed
                </Button>
            </div>
        </div>
    );
}

function BookingDetail({
    booking,
    inspectionType,
    onClose,
}: {
    booking: Booking;
    inspectionType: 'pickup' | 'return';
    onClose: () => void;
}) {
    const car = booking.car;

    const hasPickup =
        booking.inspections.some(
            (inspection) =>
                inspection.type === 'pickup',
        );

    const pickupApproved =
        booking.inspections.some(
            (inspection) =>
                inspection.type === 'pickup' &&
                inspection.status === 'approved',
        );

    const hasReturnInspection =
        booking.inspections.some(
            (inspection) =>
                inspection.type === 'return',
        );

    const [
        processingAction,
        setProcessingAction,
    ] = useState<
        'handover' | 'returned' | null
    >(null);

    const [
        handoverIdVerified,
        setHandoverIdVerified,
    ] = useState(false);

    const showPickupForm =
        inspectionType === 'pickup' &&
        !hasPickup &&
        booking.car_delivery_status ===
            'arrived';

    const showReturnForm =
        inspectionType === 'return' &&
        !hasReturnInspection &&
        booking.return_arrival_status ===
            'arrived';

    const images = [...car.images].sort(
        (a, b) =>
            Number(b.is_primary) -
            Number(a.is_primary),
    );

    const specs: Array<{
        icon: LucideIcon;
        label: string;
        value: string | number;
    }> = [
        {
            icon: Settings2,
            label: 'Transmission',
            value: car.transmission,
        },
        {
            icon: Fuel,
            label: 'Fuel Type',
            value: car.fuel_type,
        },
        {
            icon: Users,
            label: 'Seats',
            value: car.seats ?? '—',
        },
        {
            icon: Calendar,
            label: 'Year',
            value: car.year,
        },
        {
            icon: Palette,
            label: 'Color',
            value: car.color,
        },
        {
            icon: Zap,
            label: 'Engine Size',
            value: car.engine_size ?? '—',
        },
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
            value: car.category,
        },
    ];

    return (
        <Card className="overflow-hidden border-border bg-card">
            <div className="border-b border-border bg-background/60 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-foreground">
                            {car.brand} {car.model}
                        </h2>

                        <StatusBadge
                            label={booking.status.replace(
                                '_',
                                ' ',
                            )}
                            tone={
                                booking.status ===
                                'deposit_paid'
                                    ? 'blue'
                                    : 'slate'
                            }
                        />

                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            Booking #{booking.id}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                    >
                        <X className="mr-1 h-4 w-4" />
                        Close
                    </Button>
                </div>
            </div>

            <CardContent className="space-y-6 p-5">
                <div className="grid gap-6 lg:grid-cols-2">
                    <CarGallery
                        images={images}
                    />

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {car.year} ·{' '}
                                    {car.category} ·{' '}
                                    {car.plate_number}
                                </p>

                                <p className="mt-1 text-2xl font-bold text-foreground">
                                    ETB{' '}
                                    {Number(
                                        car.daily_price,
                                    ).toLocaleString()}

                                    <span className="text-sm font-normal text-muted-foreground">
                                        {' '}
                                        / day
                                    </span>
                                </p>
                            </div>

                            <div className="text-right text-sm">
                                <p className="text-muted-foreground">
                                    Booking total
                                </p>

                                <p className="text-lg font-bold text-foreground">
                                    ETB{' '}
                                    {Number(
                                        booking.total_price,
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-background/60 p-4 text-sm">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Pickup
                                    </p>

                                    <p className="font-medium text-foreground">
                                        {booking.pickup_date}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {booking.pickup_location}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Return
                                    </p>

                                    <p className="font-medium text-foreground">
                                        {booking.return_date}
                                    </p>

                                    <p className="text-muted-foreground">
                                        {booking.return_location}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-4 text-muted-foreground">
                                <span>
                                    Customer:{' '}
                                    {booking.customer
                                        ?.name ?? 'N/A'}
                                </span>

                                <span>
                                    Owner:{' '}
                                    {booking.owner
                                        ?.name ?? 'N/A'}
                                </span>

                                {booking.security_deposit_amount && (
                                    <span>
                                        Deposit: ETB{' '}
                                        {Number(
                                            booking.security_deposit_amount,
                                        ).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                            {specs.map((spec) => (
                                <SpecTile
                                    key={spec.label}
                                    {...spec}
                                />
                            ))}
                        </div>

                        {car.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    About this vehicle
                                </h3>

                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                    {car.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 border-t border-border pt-5">
                    {inspectionType ===
                        'pickup' && (
                        <DeliveryPanel
                            booking={booking}
                        />
                    )}

                    {inspectionType ===
                        'return' && (
                        <ReturnArrivalPanel
                            booking={booking}
                        />
                    )}

                    <InspectionBadges
                        inspections={
                            booking.inspections
                        }
                    />

                    {showPickupForm && (
                        <div className="pt-2">
                            <InspectionForm
                                booking={booking}
                                type="pickup"
                            />
                        </div>
                    )}

                    {showReturnForm && (
                        <div className="pt-2">
                            <InspectionForm
                                booking={booking}
                                type="return"
                            />
                        </div>
                    )}

                    {inspectionType ===
                        'pickup' &&
                        booking.status === 'paid' &&
                        pickupApproved && (
                            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            Customer Identity
                                            Verification
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {booking.customer ? (
                                                <>
                                                    <span className="font-medium text-foreground">
                                                        {
                                                            booking
                                                                .customer
                                                                .name
                                                        }
                                                    </span>

                                                    {booking
                                                        .customer
                                                        .national_id ? (
                                                        <>
                                                            {' · '}

                                                            <span className="font-mono">
                                                                National
                                                                ID:{' '}
                                                                {
                                                                    booking
                                                                        .customer
                                                                        .national_id
                                                                }
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                            No National
                                                            ID on file
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                'Customer information not available'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
                                    <input
                                        type="checkbox"
                                        id="handover_id_verified"
                                        checked={
                                            handoverIdVerified
                                        }
                                        onChange={(e) =>
                                            setHandoverIdVerified(
                                                e.target
                                                    .checked,
                                            )
                                        }
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary focus:ring-2 focus:ring-primary"
                                    />

                                    <label
                                        htmlFor="handover_id_verified"
                                        className="flex-1 cursor-pointer text-sm text-foreground"
                                    >
                                        <span className="font-semibold">
                                            I confirm that the
                                            customer's National
                                            ID has been physically
                                            checked and matches
                                            the customer.
                                        </span>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            This verification is
                                            mandatory before
                                            handing over the
                                            vehicle and will be
                                            recorded with your
                                            staff ID and
                                            timestamp.
                                        </p>
                                    </label>
                                </div>

                                <Button
                                    size="sm"
                                    disabled={
                                        processingAction !==
                                            null ||
                                        !handoverIdVerified
                                    }
                                    onClick={() => {
                                        setProcessingAction(
                                            'handover',
                                        );

                                        router.post(
                                            inspections.handover.url(
                                                {
                                                    booking:
                                                        booking.id,
                                                },
                                            ),
                                            {
                                                id_verified:
                                                    handoverIdVerified,
                                            },
                                            {
                                                preserveScroll:
                                                    true,
                                                onFinish: () =>
                                                    setProcessingAction(
                                                        null,
                                                    ),
                                            },
                                        );
                                    }}
                                >
                                    <KeyRound className="mr-1.5 h-4 w-4" />

                                    {processingAction ===
                                    'handover'
                                        ? 'Handing over...'
                                        : 'Hand Over Keys (Mark Picked Up)'}
                                </Button>
                            </div>
                        )}

                    {inspectionType ===
                        'return' &&
                        booking.status ===
                            'picked_up' &&
                        hasReturnInspection && (
                            <Button
                                className="w-full"
                                variant="secondary"
                                disabled={
                                    processingAction !==
                                    null
                                }
                                onClick={() => {
                                    setProcessingAction(
                                        'returned',
                                    );

                                    router.post(
                                        inspections.returned.url(
                                            {
                                                booking:
                                                    booking.id,
                                            },
                                        ),
                                        {},
                                        {
                                            preserveScroll:
                                                true,
                                            onFinish: () =>
                                                setProcessingAction(
                                                    null,
                                                ),
                                        },
                                    );
                                }}
                            >
                                <PackageCheck className="mr-1.5 h-4 w-4" />

                                {processingAction ===
                                'returned'
                                    ? 'Marking...'
                                    : 'Mark Returned'}
                            </Button>
                        )}

                    {inspectionType ===
                        'return' &&
                        booking.status ===
                            'returned' && (
                            <div className="rounded-xl border border-border bg-background/60 p-4">
                                <CompletionCard
                                    booking={booking}
                                />
                            </div>
                        )}
                </div>
            </CardContent>
        </Card>
    );
}

function InspectionCard({
    booking,
    inspectionType,
    active,
    onSelect,
}: {
    booking: Booking;
    inspectionType: 'pickup' | 'return';
    active: boolean;
    onSelect: () => void;
}) {
    const car = booking.car;

    const image =
        car.images.find(
            (img) => img.is_primary,
        )?.image_path ??
        car.images?.[0]?.image_path;

    const needsInspection =
        inspectionType === 'pickup'
            ? !booking.inspections.some(
                  (inspection) =>
                      inspection.type ===
                      'pickup',
              )
            : !booking.inspections.some(
                  (inspection) =>
                      inspection.type ===
                      'return',
              );

    const pickupApproved =
        booking.inspections.some(
            (inspection) =>
                inspection.type ===
                    'pickup' &&
                inspection.status ===
                    'approved',
        );

    const readyForHandover =
        inspectionType === 'pickup' &&
        pickupApproved &&
        booking.status === 'paid';

    return (
        <GlareCard
            className={cn(
                'w-full cursor-pointer',
                active &&
                    'ring-2 ring-primary',
            )}
            onClick={onSelect}
        >
            <div className="w-full p-2.5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] p-2">
                    {image ? (
                        <img
                            src={`/storage/${image}`}
                            alt={`${car.brand} ${car.model}`}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <CarIcon className="h-9 w-9 text-muted-foreground/50" />
                        </div>
                    )}

                    {needsInspection && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                            <Wrench className="h-6 w-6 text-amber-600 drop-shadow" />
                        </div>
                    )}

                    {readyForHandover && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                            <KeyRound className="h-6 w-6 text-emerald-600 drop-shadow" />
                        </div>
                    )}
                </div>

                <div className="mt-3 flex items-start justify-between gap-3 px-1 pb-1">
                    <div className="min-w-0">
                        <h3 className="truncate text-xs font-bold text-foreground">
                            {car.brand}{' '}
                            {car.model}
                        </h3>

                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            {car.transmission}
                        </p>

                        <p className="text-[11px] text-muted-foreground">
                            {car.plate_number}
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-foreground">
                            ETB{' '}
                            {Number(
                                car.daily_price,
                            ).toLocaleString()}
                        </p>

                        <p className="text-[10px] font-medium text-muted-foreground">
                            per day
                        </p>
                    </div>
                </div>
            </div>
        </GlareCard>
    );
}

export default function Inspections({
    pickup_queue,
    return_queue,
    awaiting_completion,
}: Props) {
    const [
        tab,
        setTab,
    ] = useState<
        'pickup' | 'return' | 'completion'
    >('pickup');

    const [
        selectedId,
        setSelectedId,
    ] = useState<number | null>(null);

    const tabs = [
        {
            key: 'pickup',
            label: `Pickup (${pickup_queue.length})`,
            queue: pickup_queue,
        },
        {
            key: 'return',
            label: `Return (${return_queue.length})`,
            queue: return_queue,
        },
        {
            key: 'completion',
            label: `Completion (${awaiting_completion.length})`,
            queue: awaiting_completion,
        },
    ] as const;

    const active =
        tabs.find(
            (item) => item.key === tab,
        ) ?? tabs[0];

    const inspectionType =
        tab === 'completion'
            ? 'return'
            : tab;

    const selectedBooking =
        active.queue.find(
            (booking) =>
                booking.id === selectedId,
        ) ?? null;

    return (
        <>
            <Head title="Booking Inspections" />

            <div className="min-h-full space-y-6 bg-background p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Booking Inspections
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        Select a vehicle to confirm
                        delivery, inspect it before
                        handover and at return, then
                        mark returned bookings as
                        completed.
                    </p>
                </div>

                {!selectedBooking && (
                    <>
                        <div className="flex gap-2">
                            {tabs.map((item) => (
                                <Button
                                    key={item.key}
                                    variant={
                                        tab ===
                                        item.key
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => {
                                        setTab(
                                            item.key,
                                        );
                                        setSelectedId(
                                            null,
                                        );
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>

                        {active.queue.length ===
                        0 ? (
                            <Card className="border-border bg-card">
                                <CardContent className="py-16 text-center">
                                    <Check className="mx-auto h-12 w-12 text-green-500" />

                                    <p className="mt-4 text-lg font-semibold text-foreground">
                                        No bookings in
                                        this queue.
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {tab ===
                                            'pickup' &&
                                            'Bookings with a paid deposit awaiting the pre-handover inspection will appear here.'}

                                        {tab ===
                                            'return' &&
                                            'Picked up bookings awaiting the return inspection will appear here.'}

                                        {tab ===
                                            'completion' &&
                                            'Returned bookings awaiting final completion will appear here.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {active.queue.map(
                                    (booking) => (
                                        <InspectionCard
                                            key={
                                                booking.id
                                            }
                                            booking={
                                                booking
                                            }
                                            inspectionType={
                                                inspectionType
                                            }
                                            active={
                                                booking.id ===
                                                selectedId
                                            }
                                            onSelect={() =>
                                                setSelectedId(
                                                    booking.id ===
                                                        selectedId
                                                        ? null
                                                        : booking.id,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </>
                )}

                {selectedBooking && (
                    <BookingDetail
                        booking={
                            selectedBooking
                        }
                        inspectionType={
                            inspectionType
                        }
                        onClose={() =>
                            setSelectedId(
                                null,
                            )
                        }
                    />
                )}
            </div>
        </>
    );
}

Inspections.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Inspections',
            href: '/inspections',
        },
    ],
};