import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { book } from '@/routes/cars';

interface Car {
    id: number; brand: string; model: string; year: number;
    daily_rate: string; fuel_type: string; transmission: string;
    category: string; color: string; engine_size?: string; mileage?: number;
    seats?: number; description?: string; availability_status: string; photo: string | null;
    car_type_name?: { name: string };
    owner: { id: number; name: string; phone: string; email: string };
    images?: { id: number; image_path: string; is_primary: boolean }[];
}

interface Props { car: Car; role: string; }

export default function CarDetails({ car, role }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    const { data, setData, post, processing, errors } = useForm({
        pickup_date: '',
        return_date: '',
        pickup_location: '',
        return_location: '',
        need_driver: false,
        notes: '',
    });

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        post(book.url({ car: car.id }), {
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    return (
        <>
            <Head title={`${car.brand} ${car.model}`} />
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        {car.images && car.images.length > 0 ? (
                            <img
                                src={`/storage/${car.images.find((i) => i.is_primary)?.image_path ?? car.images[0].image_path}`}
                                alt={`${car.brand} ${car.model}`}
                                className="w-full rounded-lg object-cover"
                            />
                        ) : car.photo ? (
                            <img src={`/storage/${car.photo}`} alt={`${car.brand} ${car.model}`}
                                className="w-full rounded-lg object-cover" />
                        ) : (
                            <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                No image
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold">{car.brand} {car.model} ({car.year})</h1>
                        <p className="text-2xl font-bold text-primary">ETB {car.daily_rate}/day</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Fuel:</span><span>{car.fuel_type}</span>
                            <span className="text-muted-foreground">Transmission:</span><span>{car.transmission}</span>
                            <span className="text-muted-foreground">Category:</span><span>{car.category}</span>
                            <span className="text-muted-foreground">Color:</span><span>{car.color}</span>
                            {car.engine_size && <><span className="text-muted-foreground">Engine:</span><span>{car.engine_size}</span></>}
                            {car.seats && <><span className="text-muted-foreground">Seats:</span><span>{car.seats}</span></>}
                            {car.mileage && <><span className="text-muted-foreground">Mileage:</span><span>{car.mileage} km</span></>}
                            {car.car_type_name && <><span className="text-muted-foreground">Type:</span><span>{car.car_type_name.name}</span></>}
                        </div>
                        {car.description && <p className="text-sm text-muted-foreground">{car.description}</p>}
                        <p className="text-sm text-muted-foreground">Owner: {car.owner.name} ({car.owner.phone})</p>
                    </div>
                </div>

                {role === 'customer' && car.availability_status === 'available' && (
                    <Card>
                        <CardHeader><CardTitle>Book This Car</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleBook} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="pickup_date">Pickup Date</Label>
                                        <Input id="pickup_date" type="date" value={data.pickup_date}
                                            onChange={(e) => setData('pickup_date', e.target.value)} />
                                        <InputError message={errors.pickup_date} />
                                    </div>
                                    <div>
                                        <Label htmlFor="return_date">Return Date</Label>
                                        <Input id="return_date" type="date" value={data.return_date}
                                            onChange={(e) => setData('return_date', e.target.value)} />
                                        <InputError message={errors.return_date} />
                                    </div>
                                    <div>
                                        <Label htmlFor="pickup_location">Pickup Location</Label>
                                        <Input id="pickup_location" value={data.pickup_location}
                                            onChange={(e) => setData('pickup_location', e.target.value)} />
                                        <InputError message={errors.pickup_location} />
                                    </div>
                                    <div>
                                        <Label htmlFor="return_location">Return Location</Label>
                                        <Input id="return_location" value={data.return_location}
                                            onChange={(e) => setData('return_location', e.target.value)} />
                                        <InputError message={errors.return_location} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="need_driver" checked={data.need_driver}
                                        onChange={(e) => setData('need_driver', e.target.checked)} />
                                    <Label htmlFor="need_driver">I need a driver</Label>
                                </div>
                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)} />
                                    <InputError message={errors.notes} />
                                </div>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Booking...' : 'Book Now'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

CarDetails.layout = {
    breadcrumbs: [
        { title: 'Browse Cars', href: '/browse-cars' },
        { title: 'Car Details', href: '' },
    ],
};
