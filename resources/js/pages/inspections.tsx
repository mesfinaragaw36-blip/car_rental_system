import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownToLine,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Gauge,
    KeyRound,
    PackageCheck,
    Plus,
    Timer,
    Trash2,
    TriangleAlert,
    Truck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import inspections from '@/routes/inspections';

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
        brand: string;
        model: string;
        year: number;
        plate_number: string;
        estimated_value: string | number | null;
    };
    customer: { id: number; name: string; phone: string } | null;
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
        yellow: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
        blue: 'bg-blue-100 text-blue-700 ring-blue-600/20',
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

function deliveryTone(status: DeliveryStatus): 'green' | 'red' | 'yellow' {
    if (status === 'arrived') {
        return 'green';
    }

    if (status === 'failed') {
        return 'red';
    }

    return 'yellow';
}

function DeliveryPanel({ booking }: { booking: Booking }) {
    const [processing, setProcessing] = useState<'arrived' | 'failed' | null>(
        null,
    );
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
            { preserveScroll: true, onFinish: () => setProcessing(null) },
        );
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    {status === 'arrived' ? (
                        <PackageCheck className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : status === 'failed' ? (
                        <TriangleAlert className="mt-0.5 h-5 w-5 text-red-600" />
                    ) : (
                        <Truck className="mt-0.5 h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
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
                        The owner and admins have been alerted. Follow up before
                        the pickup date.
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
        if (
            lateDays > 0 &&
            !window.confirm(
                `This car is ${lateDays} day${lateDays > 1 ? 's' : ''} late. Confirm the customer returned it now?`,
            )
        ) {
            return;
        }

        setProcessing(true);

        router.post(
            inspections.returnArrival.url({ booking: booking.id }),
            {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    {status === 'arrived' ? (
                        <PackageCheck className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : (
                        <KeyRound className="mt-0.5 h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                            Customer car return
                            <StatusBadge
                                label={
                                    status === 'arrived'
                                        ? 'arrived'
                                        : 'pending'
                                }
                                tone={
                                    status === 'arrived' ? 'green' : 'yellow'
                                }
                            />
                            {lateDays > 0 && status === 'pending' && (
                                <StatusBadge
                                    label={`Late by ${lateDays} day${lateDays > 1 ? 's' : ''}`}
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
                    <Button
                        size="sm"
                        disabled={processing}
                        onClick={confirmArrival}
                    >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        {processing ? 'Confirming...' : 'Car Arrived'}
                    </Button>
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
    current: { mileage: string; fuel: string; damages: Damage[] };
}) {
    const mileageDiff =
        pickup.mileage_reading !== null && current.mileage.trim() !== ''
            ? Math.max(
                  0,
                  Number(current.mileage) - Number(pickup.mileage_reading),
              )
            : null;
    const fuelDiff =
        pickup.fuel_level !== null && current.fuel.trim() !== ''
            ? Number(current.fuel) - Number(pickup.fuel_level)
            : null;

    const submitted = current.damages.filter(
        (d) => d.area.trim() !== '' || d.description.trim() !== '',
    );
    const pickupDamageKeys = new Set(
        (pickup.damages ?? []).map(
            (d) =>
                `${d.area.trim().toLowerCase()}|${d.description.trim().toLowerCase()}`,
        ),
    );
    const newDamages = submitted.filter(
        (d) =>
            !pickupDamageKeys.has(
                `${d.area.trim().toLowerCase()}|${d.description.trim().toLowerCase()}`,
            ),
    );

    return (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-blue-800">
                <Timer className="h-4 w-4" /> Diff vs pickup snapshot
            </p>
            <div className="mt-2 grid gap-2 text-blue-900 sm:grid-cols-3">
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
                    <span className="font-semibold">{newDamages.length}</span>
                </p>
            </div>
            {newDamages.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-red-700">
                    {newDamages.map((damage, i) => (
                        <li key={i}>
                            <span className="font-medium">{damage.area}</span> -{' '}
                            {damage.description}
                        </li>
                    ))}
                </ul>
            )}
            {newDamages.length === 0 && submitted.length === 0 && (
                <p className="mt-2 text-blue-700">
                    No new damages reported yet. Remember to record any damages
                    found during the return inspection.
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
    const { data, setData, processing, errors, reset } =
        useForm({
            type,
            status: 'approved',
            mileage_reading: '',
            fuel_level: '',
            estimated_value: booking.car.estimated_value?.toString() ?? '',
            damages: [{ area: '', description: '' }] as Damage[],
            notes: '',
            photos: [] as File[],
        });

    const pickup = booking.inspections.find(
        (inspection) => inspection.type === 'pickup',
    );

    const addDamage = () => {
        setData('damages', [...data.damages, { area: '', description: '' }]);
    };

    const updateDamage = (
        index: number,
        field: keyof Damage,
        value: string,
    ) => {
        setData(
            'damages',
            data.damages.map((damage, i) =>
                i === index ? { ...damage, [field]: value } : damage,
            ),
        );
    };

    const removeDamage = (index: number) => {
        setData(
            'damages',
            data.damages.filter((_, i) => i !== index),
        );
    };

    const damagesToSubmit = data.damages.filter(
        (damage) =>
            damage.area.trim() !== '' || damage.description.trim() !== '',
    );

    const submitWith = (status: 'approved' | 'issues_found') => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('status', status);
        formData.append('mileage_reading', data.mileage_reading);
        formData.append('fuel_level', data.fuel_level);
        formData.append('estimated_value', data.estimated_value);
        formData.append('notes', data.notes);
        damagesToSubmit.forEach((d, i) => {
            formData.append(`damages[${i}][area]`, d.area);
            formData.append(`damages[${i}][description]`, d.description);
        });
        data.photos.forEach((photo) => {
            formData.append('photos[]', photo);
        });

        router.post(inspections.conduct.url({ booking: booking.id }), formData, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                if (onClose) onClose();
            },
        });
    };

    return (
        <div className="space-y-4 rounded-xl border bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Record {type === 'pickup' ? 'Pickup' : 'Return'} Inspection
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>
                        {type === 'pickup' ? 'Mileage' : 'Return mileage'} (km)
                    </Label>
                    <Input
                        type="number"
                        min={0}
                        value={data.mileage_reading}
                        onChange={(e) =>
                            setData('mileage_reading', e.target.value)
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
                        onChange={(e) => setData('fuel_level', e.target.value)}
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
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="max-w-sm space-y-1">
                            <Label>Estimated car value (ETB)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={data.estimated_value}
                                onChange={(e) =>
                                    setData('estimated_value', e.target.value)
                                }
                                placeholder="e.g. 2500000"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used to calculate the 10% security deposit
                                (minimum 1,000 ETB).
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
                                        booking.car.estimated_value,
                                    ).toLocaleString()}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Enter the value to update the deposit.
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
                        <Plus className="mr-1 h-3 w-3" /> Add damage
                    </Button>
                </div>
                {data.damages.map((damage, index) => (
                    <div
                        key={index}
                        className="grid gap-2 md:grid-cols-[1fr_2fr_auto]"
                    >
                        <Input
                            value={damage.area}
                            onChange={(e) =>
                                updateDamage(index, 'area', e.target.value)
                            }
                            placeholder="Area (e.g. front bumper)"
                        />
                        <Input
                            value={damage.description}
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
                            onClick={() => removeDamage(index)}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
            </div>

            {type === 'return' && pickup && pickup.status === 'approved' && (
                <SnapshotDiff
                    pickup={pickup}
                    current={{
                        mileage: data.mileage_reading,
                        fuel: data.fuel_level,
                        damages: damagesToSubmit,
                    }}
                />
            )}

            <div className="space-y-2">
                <Label>Evidence Photos (Before / After inspection)</Label>
                <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                        if (e.target.files) {
                            setData('photos', Array.from(e.target.files));
                        }
                    }}
                />
                {errors.photos && (
                    <p className="text-xs text-red-600">{errors.photos}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Additional observations..."
                    rows={3}
                />
                {errors.notes && (
                    <p className="text-xs text-red-600">{errors.notes}</p>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={() => submitWith('approved')}
                    disabled={processing}
                >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    {processing ? 'Saving...' : 'Approve'}
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
                    className="rounded-lg border bg-white p-3 text-sm"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 font-semibold capitalize">
                            {inspection.type === 'pickup' ? (
                                <ArrowDownToLine className="h-4 w-4 text-blue-600" />
                            ) : (
                                <Gauge className="h-4 w-4 text-indigo-600" />
                            )}
                            {inspection.type} inspection
                        </span>
                        <StatusBadge
                            label={inspection.status.replace('_', ' ')}
                            tone={
                                inspection.status === 'approved'
                                    ? 'green'
                                    : inspection.status === 'issues_found'
                                      ? 'red'
                                      : 'yellow'
                            }
                        />
                    </div>
                    <p className="mt-1 text-muted-foreground">
                        {inspection.conducted_at
                            ? `${new Date(inspection.conducted_at).toLocaleString()} by ${inspection.conducted_by_name ?? 'staff'}`
                            : 'Conducted'}
                        {inspection.mileage_reading !== null &&
                            ` · ${inspection.mileage_reading.toLocaleString()} km`}
                        {inspection.fuel_level !== null &&
                            ` · ${inspection.fuel_level}% fuel`}
                    </p>
                    {inspection.damages && inspection.damages.length > 0 && (
                        <ul className="mt-2 list-inside list-disc text-red-600">
                            {inspection.damages.map((damage, i) => (
                                <li key={i}>
                                    <span className="font-medium">
                                        {damage.area}
                                    </span>{' '}
                                    - {damage.description}
                                </li>
                            ))}
                        </ul>
                    )}
                    {inspection.notes && (
                        <p className="mt-2 text-muted-foreground">
                            {inspection.notes}
                        </p>
                    )}
                    {inspection.photos && inspection.photos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {inspection.photos.map((path, i) => (
                                <a
                                    key={i}
                                    href={`/storage/${path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block h-16 w-16 overflow-hidden rounded-md border shadow-sm hover:opacity-90"
                                >
                                    <img
                                        src={`/storage/${path}`}
                                        alt="Evidence"
                                        className="h-full w-full object-cover"
                                    />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function BookingCard({
    booking,
    inspectionType,
}: {
    booking: Booking;
    inspectionType: 'pickup' | 'return';
}) {
    const hasPickup = booking.inspections.some(
        (inspection) => inspection.type === 'pickup',
    );
    const pickupApproved = booking.inspections.some(
        (inspection) =>
            inspection.type === 'pickup' && inspection.status === 'approved',
    );
    const hasReturnInspection = booking.inspections.some(
        (inspection) => inspection.type === 'return',
    );
    const [processingAction, setProcessingAction] = useState<
        'handover' | 'returned' | null
    >(null);
    const [inspectOpen, setInspectOpen] = useState(false);
    const showForm =
        inspectionType === 'pickup'
            ? !hasPickup
            : !booking.inspections.some(
                  (inspection) => inspection.type === 'return',
              );

    const pickupDone =
        hasPickup ||
        booking.car_delivery_status === 'arrived' ||
        booking.car_delivery_status === 'failed';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                    <span>Booking #{booking.id}</span>
                    <StatusBadge
                        label={booking.status.replace('_', ' ')}
                        tone={
                            booking.status === 'deposit_paid' ? 'blue' : 'slate'
                        }
                    />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                    <div>
                        <p className="text-muted-foreground">Vehicle</p>
                        <p className="font-medium">
                            {booking.car.brand} {booking.car.model} (
                            {booking.car.year})
                        </p>
                        <p className="text-muted-foreground">
                            Plate: {booking.car.plate_number}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Dates</p>
                        <p>
                            {booking.pickup_date} → {booking.return_date}
                        </p>
                        <p className="text-muted-foreground">
                            {booking.pickup_location} →{' '}
                            {booking.return_location}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>Customer: {booking.customer?.name ?? 'N/A'}</span>
                    <span>Owner: {booking.owner?.name ?? 'N/A'}</span>
                    <span>Total: ETB {booking.total_price}</span>
                    {booking.security_deposit_amount && (
                        <span>
                            Security deposit: ETB{' '}
                            {Number(
                                booking.security_deposit_amount,
                            ).toLocaleString()}
                        </span>
                    )}
                </div>

                {inspectionType === 'pickup' && (
                    <DeliveryPanel booking={booking} />
                )}

                {inspectionType === 'return' && (
                    <ReturnArrivalPanel booking={booking} />
                )}

                <InspectionBadges inspections={booking.inspections} />

                {showForm && (
                    <div className="pt-2">
                        {inspectionType === 'pickup' &&
                            booking.car_delivery_status === 'pending' && (
                                <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                                    <p className="flex items-center gap-1.5 font-medium">
                                        <TriangleAlert className="h-4 w-4" />
                                        Waiting for the car to arrive at the branch
                                    </p>
                                    <p className="mt-1 text-yellow-700">
                                        Confirm delivery above before conducting the
                                        pickup inspection.
                                    </p>
                                </div>
                            )}

                        {(inspectionType === 'return' || pickupDone) && (
                            <>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => setInspectOpen(true)}
                                    disabled={
                                        inspectionType === 'pickup' &&
                                        booking.car_delivery_status === 'pending'
                                    }
                                >
                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                    Conduct{' '}
                                    {inspectionType === 'pickup'
                                        ? 'Pickup'
                                        : 'Return'}{' '}
                                    Inspection
                                </Button>

                                <Dialog
                                    open={inspectOpen}
                                    onOpenChange={setInspectOpen}
                                >
                                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Record{' '}
                                                {inspectionType === 'pickup'
                                                    ? 'Pickup'
                                                    : 'Return'}{' '}
                                                Inspection (Booking #{booking.id})
                                            </DialogTitle>
                                        </DialogHeader>
                                        <InspectionForm
                                            booking={booking}
                                            type={inspectionType}
                                            onClose={() => setInspectOpen(false)}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                )}

                {inspectionType === 'pickup' &&
                    booking.status === 'paid' &&
                    pickupApproved && (
                        <Button
                            className="w-full"
                            disabled={processingAction !== null}
                            onClick={() => {
                                setProcessingAction('handover');

                                router.post(
                                    inspections.handover.url({
                                        booking: booking.id,
                                    }),
                                    {},
                                    {
                                        preserveScroll: true,
                                        onFinish: () =>
                                            setProcessingAction(null),
                                    },
                                );
                            }}
                        >
                            <KeyRound className="mr-1.5 h-4 w-4" />
                            {processingAction === 'handover'
                                ? 'Handing over...'
                                : 'Hand Over Keys (Mark Picked Up)'}
                        </Button>
                    )}

                {inspectionType === 'return' &&
                    booking.status === 'picked_up' &&
                    hasReturnInspection && (
                        <Button
                            className="w-full"
                            variant="secondary"
                            disabled={processingAction !== null}
                            onClick={() => {
                                setProcessingAction('returned');

                                router.post(
                                    inspections.returned.url({
                                        booking: booking.id,
                                    }),
                                    {},
                                    {
                                        preserveScroll: true,
                                        onFinish: () =>
                                            setProcessingAction(null),
                                    },
                                );
                            }}
                        >
                            <PackageCheck className="mr-1.5 h-4 w-4" />
                            {processingAction === 'returned'
                                ? 'Marking...'
                                : 'Mark Returned'}
                        </Button>
                    )}
            </CardContent>
        </Card>
    );
}

function CompletionCard({ booking }: { booking: Booking }) {
    const [repairCost, setRepairCost] = useState('');
    const [processing, setProcessing] = useState(false);

    const returnInspection = booking.inspections.find(
        (inspection) => inspection.type === 'return',
    );
    const hasIssues = returnInspection?.status === 'issues_found';

    const handleComplete = () => {
        if (hasIssues && !repairCost.trim()) {
            return;
        }

        setProcessing(true);

        router.post(
            inspections.complete.url({ booking: booking.id }),
            hasIssues ? { repair_cost: repairCost } : {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    return (
        <div className="space-y-4">
            <InspectionBadges inspections={booking.inspections} />
            <div className="flex flex-wrap items-end justify-end gap-3">
                {hasIssues && (
                    <div className="space-y-1">
                        <Label>
                            Repair cost (deducted from security deposit)
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            value={repairCost}
                            onChange={(e) => setRepairCost(e.target.value)}
                            placeholder="e.g. 2000"
                            className="w-56"
                        />
                        {!repairCost.trim() && (
                            <p className="text-xs text-red-600">
                                Required when damages are found.
                            </p>
                        )}
                    </div>
                )}
                <Button
                    onClick={handleComplete}
                    disabled={
                        !returnInspection ||
                        (hasIssues && !repairCost.trim()) ||
                        processing
                    }
                >
                    <Check className="mr-2 h-4 w-4" /> Mark Completed
                </Button>
            </div>
        </div>
    );
}

export default function Inspections({
    pickup_queue,
    return_queue,
    awaiting_completion,
}: Props) {
    const [tab, setTab] = useState<'pickup' | 'return' | 'completion'>(
        'pickup',
    );

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

    const active = tabs.find((item) => item.key === tab) ?? tabs[0];

    return (
        <>
            <Head title="Booking Inspections" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">Booking Inspections</h1>
                    <p className="mt-2 text-muted-foreground">
                        Confirm owner car delivery, inspect vehicles before
                        handover and at return, then mark returned bookings as
                        completed.
                    </p>
                </div>

                <div className="flex gap-2">
                    {tabs.map((item) => (
                        <Button
                            key={item.key}
                            variant={tab === item.key ? 'default' : 'outline'}
                            onClick={() => setTab(item.key)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>

                {active.queue.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Check className="mx-auto h-12 w-12 text-green-500" />
                            <p className="mt-4 text-lg font-semibold">
                                No bookings in this queue.
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {tab === 'pickup' &&
                                    'Bookings with a paid deposit awaiting the pre-handover inspection will appear here.'}
                                {tab === 'return' &&
                                    'Picked up bookings awaiting the return inspection will appear here.'}
                                {tab === 'completion' &&
                                    'Returned bookings awaiting final completion will appear here.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {active.queue.map((booking) => (
                            <div key={booking.id} className="space-y-4">
                                <BookingCard
                                    booking={booking}
                                    inspectionType={
                                        tab === 'completion' ? 'return' : tab
                                    }
                                />
                                {tab === 'completion' && (
                                    <CompletionCard booking={booking} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Inspections.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Inspections', href: '/inspections' },
    ],
};
