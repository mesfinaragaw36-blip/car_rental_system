import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import customerBookings from '@/routes/customer/bookings';

interface CarImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    category: string;
    color: string;
    fuel_type: string;
    transmission: string;
    engine_size: string;
    mileage: number;
    seats: number;
    daily_price: string;
    description: string | null;
    images: CarImage[];
}

interface Props {
    car: Car;
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

interface FormData {
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    need_driver: boolean;
    notes: string;
}

interface FormErrors {
    pickup_date?: string;
    return_date?: string;
    pickup_location?: string;
    return_location?: string;
    notes?: string;
}

function calculateTotal(dailyPrice: string, pickupDate: string, returnDate: string): string | null {
    if (!pickupDate || !returnDate) {
        return null;
    }
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const days = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
        return null;
    }
    return (days * parseFloat(dailyPrice)).toFixed(2);
}

export default function CarDetails({ car }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    const primaryImage = car.images?.find((img) => img.is_primary) ?? car.images?.[0];

    const [form, setForm] = useState<FormData>({
        pickup_date: '',
        return_date: '',
        pickup_location: '',
        return_location: '',
        need_driver: false,
        notes: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    const estimatedTotal = calculateTotal(car.daily_price, form.pickup_date, form.return_date);

    function handleChange(field: keyof FormData, value: string | boolean): void {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function handleSubmit(): void {
        setSubmitting(true);
        router.post(
            customerBookings.store.url(car.id),
            { ...form },
            {
                onError: (errs) => {
                    setErrors(errs as FormErrors);
                    setSubmitting(false);
                },
                onFinish: () => setSubmitting(false),
            },
        );
    }

    return (
        <>
            <Head title={`${car.brand} ${car.model}`} />

            <div className="p-6 space-y-6">
                <Link href="/customer/browse-cars">
                    <Button variant="outline" size="sm">&larr; Back to Browse</Button>
                </Link>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Car details */}
                <Card>
                    <CardContent className="space-y-6 p-6">
                        {primaryImage && (
                            <img
                                src={`/storage/${primaryImage.image_path}`}
                                alt={`${car.brand} ${car.model}`}
                                className="h-80 w-full rounded-lg object-cover"
                            />
                        )}

                        <h1 className="text-3xl font-bold">
                            {car.brand} {car.model}
                        </h1>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <p><span className="font-medium">Year:</span> {car.year}</p>
                                <p><span className="font-medium">Category:</span> {car.category}</p>
                                <p><span className="font-medium">Color:</span> {car.color}</p>
                                <p><span className="font-medium">Fuel:</span> {car.fuel_type}</p>
                                <p><span className="font-medium">Transmission:</span> {car.transmission}</p>
                            </div>

                            <div className="space-y-2">
                                <p><span className="font-medium">Engine:</span> {car.engine_size}</p>
                                <p><span className="font-medium">Mileage:</span> {car.mileage} km</p>
                                <p><span className="font-medium">Seats:</span> {car.seats}</p>
                            </div>
                        </div>

                        <p className="text-2xl font-bold">{car.daily_price} ETB / day</p>

                        <p className="text-muted-foreground">
                            {car.description ?? 'No description available.'}
                        </p>

                        {car.images && car.images.length > 1 && (
                            <div className="space-y-3">
                                <p className="font-medium">All Photos</p>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {car.images.map((image) => (
                                        <img
                                            key={image.id}
                                            src={`/storage/${image.image_path}`}
                                            alt={`${car.brand} ${car.model}`}
                                            className="h-40 w-full rounded-md object-cover"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Booking form */}
                <Card>
                    <CardContent className="space-y-5 p-6">
                        <h2 className="text-xl font-bold">Book This Car</h2>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Pickup date */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pickup_date">Pickup Date</Label>
                                <Input
                                    id="pickup_date"
                                    type="date"
                                    value={form.pickup_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => handleChange('pickup_date', e.target.value)}
                                />
                                {errors.pickup_date && (
                                    <p className="text-xs text-red-600">{errors.pickup_date}</p>
                                )}
                            </div>

                            {/* Return date */}
                            <div className="space-y-1.5">
                                <Label htmlFor="return_date">Return Date</Label>
                                <Input
                                    id="return_date"
                                    type="date"
                                    value={form.return_date}
                                    min={form.pickup_date || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => handleChange('return_date', e.target.value)}
                                />
                                {errors.return_date && (
                                    <p className="text-xs text-red-600">{errors.return_date}</p>
                                )}
                            </div>

                            {/* Pickup location */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pickup_location">Pickup Location</Label>
                                <Input
                                    id="pickup_location"
                                    placeholder="e.g. Bole, Addis Ababa"
                                    value={form.pickup_location}
                                    onChange={(e) => handleChange('pickup_location', e.target.value)}
                                />
                                {errors.pickup_location && (
                                    <p className="text-xs text-red-600">{errors.pickup_location}</p>
                                )}
                            </div>

                            {/* Return location */}
                            <div className="space-y-1.5">
                                <Label htmlFor="return_location">Return Location</Label>
                                <Input
                                    id="return_location"
                                    placeholder="e.g. Bole, Addis Ababa"
                                    value={form.return_location}
                                    onChange={(e) => handleChange('return_location', e.target.value)}
                                />
                                {errors.return_location && (
                                    <p className="text-xs text-red-600">{errors.return_location}</p>
                                )}
                            </div>
                        </div>

                        {/* Need driver toggle */}
                        <div className="flex items-center gap-3">
                            <input
                                id="need_driver"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={form.need_driver}
                                onChange={(e) => handleChange('need_driver', e.target.checked)}
                            />
                            <Label htmlFor="need_driver" className="cursor-pointer">
                                I need a driver
                            </Label>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <textarea
                                id="notes"
                                rows={3}
                                placeholder="Any special requests or instructions..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                value={form.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                            />
                            {errors.notes && (
                                <p className="text-xs text-red-600">{errors.notes}</p>
                            )}
                        </div>

                        {/* Estimated total */}
                        {estimatedTotal && (
                            <div className="rounded-lg bg-muted px-4 py-3 text-sm">
                                <span className="font-medium">Estimated Total: </span>
                                <span className="text-lg font-bold">{estimatedTotal} ETB</span>
                            </div>
                        )}

                        <Button
                            className="w-full"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? 'Submitting…' : 'Submit Booking Request'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CarDetails.layout = {
    breadcrumbs: [
        { title: 'Browse Cars', href: '/customer/browse-cars' },
        { title: 'Car Details', href: '#' },
    ],
};
