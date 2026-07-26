import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CarImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Car {
    id: number;
    owner_id: number;
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

export default function CarDetails({ car }: Props) {
    const primaryImage = car.images?.find((img) => img.is_primary) ?? car.images?.[0];

    const form = useForm({
        pickup_date: '',
        return_date: '',
        pickup_location: '',
        return_location: '',
        need_driver: false,
    });

    const totalPrice = useMemo(() => {
        if (!form.data.pickup_date || !form.data.return_date) {
            return '0.00';
        }

        const pickup = new Date(form.data.pickup_date);
        const returnDate = new Date(form.data.return_date);
        const diff = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) {
            return '0.00';
        }

        const dailyPrice = Number(car.daily_price);
        return (dailyPrice * (diff + 1)).toFixed(2);
    }, [form.data.pickup_date, form.data.return_date, car.daily_price]);

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post(`/customer/cars/${car.id}/bookings`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('pickup_date', 'return_date', 'pickup_location', 'return_location', 'need_driver');
            },
        });
    }

    return (
        <>
            <Head title={`${car.brand} ${car.model}`} />

            <div className="p-6 space-y-6">
                <Link href="/customer/browse-cars">
                    <Button variant="outline" size="sm">&larr; Back to Browse</Button>
                </Link>

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

                        <p className="text-2xl font-bold">
                            {car.daily_price} ETB / day
                        </p>

                        <p className="text-muted-foreground">
                            {car.description || 'No description available.'}
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

                <Card>
                    <CardContent className="space-y-4 p-6">
                        <h2 className="text-2xl font-semibold">Book this vehicle</h2>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="pickup_date">Pickup Date</Label>
                                    <Input
                                        id="pickup_date"
                                        type="date"
                                        value={form.data.pickup_date}
                                        onChange={(event) => form.setData('pickup_date', event.target.value)}
                                    />
                                    {form.errors.pickup_date && <p className="text-sm text-destructive">{form.errors.pickup_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="return_date">Return Date</Label>
                                    <Input
                                        id="return_date"
                                        type="date"
                                        value={form.data.return_date}
                                        onChange={(event) => form.setData('return_date', event.target.value)}
                                    />
                                    {form.errors.return_date && <p className="text-sm text-destructive">{form.errors.return_date}</p>}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="pickup_location">Pickup Location</Label>
                                    <Input
                                        id="pickup_location"
                                        value={form.data.pickup_location}
                                        onChange={(event) => form.setData('pickup_location', event.target.value)}
                                    />
                                    {form.errors.pickup_location && <p className="text-sm text-destructive">{form.errors.pickup_location}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="return_location">Return Location</Label>
                                    <Input
                                        id="return_location"
                                        value={form.data.return_location}
                                        onChange={(event) => form.setData('return_location', event.target.value)}
                                    />
                                    {form.errors.return_location && <p className="text-sm text-destructive">{form.errors.return_location}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={form.data.need_driver}
                                    onCheckedChange={(value) => form.setData('need_driver', value)}
                                />
                                <Label htmlFor="need_driver">Need a driver?</Label>
                            </div>

                            <div className="rounded-lg border border-border bg-muted p-4">
                                <p className="text-sm text-muted-foreground">Total price</p>
                                <p className="text-xl font-semibold">{totalPrice} ETB</p>
                            </div>

                            <Button type="submit" disabled={form.processing}>Submit Booking Request</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
