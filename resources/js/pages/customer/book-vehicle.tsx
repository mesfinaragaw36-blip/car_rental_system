import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemo } from 'react';

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    daily_price: number;
    description?: string;
}

interface Props {
    car: Car;
}

export default function BookVehicle({ car }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        pickup_date: '',
        return_date: '',
        pickup_location: '',
        return_location: '',
        need_driver: false,
    });

    const totalDays = useMemo(() => {
        if (!data.pickup_date || !data.return_date) return 0;
        const pickup = new Date(data.pickup_date);
        const returnD = new Date(data.return_date);
        const diff = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }, [data.pickup_date, data.return_date]);

    const totalPrice = totalDays * car.daily_price;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/customer/vehicles/${car.id}/book`);
    };

    return (
        <>
            <Head title={`Book ${car.brand} ${car.model}`} />

            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">
                    Book {car.brand} {car.model} ({car.year})
                </h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking Details</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="pickup_date">Pickup Date</Label>
                                <Input
                                    id="pickup_date"
                                    type="date"
                                    value={data.pickup_date}
                                    onChange={(e) => setData('pickup_date', e.target.value)}
                                />
                                {errors.pickup_date && (
                                    <p className="text-sm text-red-600 mt-1">{errors.pickup_date}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="return_date">Return Date</Label>
                                <Input
                                    id="return_date"
                                    type="date"
                                    value={data.return_date}
                                    onChange={(e) => setData('return_date', e.target.value)}
                                />
                                {errors.return_date && (
                                    <p className="text-sm text-red-600 mt-1">{errors.return_date}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="pickup_location">Pickup Location</Label>
                                <Input
                                    id="pickup_location"
                                    type="text"
                                    value={data.pickup_location}
                                    onChange={(e) => setData('pickup_location', e.target.value)}
                                />
                                {errors.pickup_location && (
                                    <p className="text-sm text-red-600 mt-1">{errors.pickup_location}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="return_location">Return Location</Label>
                                <Input
                                    id="return_location"
                                    type="text"
                                    value={data.return_location}
                                    onChange={(e) => setData('return_location', e.target.value)}
                                />
                                {errors.return_location && (
                                    <p className="text-sm text-red-600 mt-1">{errors.return_location}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="need_driver"
                                    type="checkbox"
                                    checked={data.need_driver}
                                    onChange={(e) => setData('need_driver', e.target.checked)}
                                />
                                <Label htmlFor="need_driver">I need a driver</Label>
                            </div>

                           {(errors as Record<string, string>).car && (
    <p className="text-sm text-red-600">{(errors as Record<string, string>).car}</p>
)}

                            <div className="rounded-lg border p-4 bg-muted/50">
                                <p className="text-sm text-muted-foreground">
                                    {totalDays} day(s) &times; ${car.daily_price}/day
                                </p>
                                <p className="text-xl font-bold">
                                    Total: ${totalPrice.toFixed(2)}
                                </p>
                            </div>

                            <Button type="submit" disabled={processing} className="w-full">
                                Submit Booking Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}