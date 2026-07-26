import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export default function CarDetails({ car }: Props) {
    const primaryImage = car.images?.find((img) => img.is_primary) ?? car.images?.[0];

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
            </div>
        </>
    );
}
