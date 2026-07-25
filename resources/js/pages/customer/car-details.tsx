import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';

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
    images: {
        id: number;
        image_path: string;
    }[];
}

interface Props {
    car: Car;
}

export default function CarDetails({ car }: Props) {
    return (
        <>
            <Head title={`${car.brand} ${car.model}`} />

            <div className="p-6">
                <Card>
                    <CardContent className="space-y-4 p-6">

                        <h1 className="text-3xl font-bold">
                            {car.brand} {car.model}
                        </h1>

                        <p>Year: {car.year}</p>
                        <p>Category: {car.category}</p>
                        <p>Color: {car.color}</p>
                        <p>Fuel: {car.fuel_type}</p>
                        <p>Transmission: {car.transmission}</p>
                        <p>Engine: {car.engine_size}</p>
                        <p>Mileage: {car.mileage}</p>
                        <p>Seats: {car.seats}</p>

                        <p className="text-xl font-bold">
                            {car.daily_price} / day
                        </p>

                        <p>
                            {car.description || 'No description available.'}
                        </p>

                    </CardContent>
                </Card>
            </div>
        </>
    );
}