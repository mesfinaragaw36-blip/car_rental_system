import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    fuel_type: string;
    transmission: string;
    daily_price: string;
    category: string;
    images: CarImage[];
    owner: { id: number; name: string; phone: string };
    car_type_name?: { id: number; name: string };
}

interface CarTypeName {
    id: number;
    name: string;
}

interface Props {
    cars: Car[];
    carTypeNames: CarTypeName[];
    filters: {
        search?: string;
        category?: string;
        fuel_type?: string;
        transmission?: string;
        min_price?: string;
        max_price?: string;
    };
}

export default function BrowseCars({ cars = [], carTypeNames = [], filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [fuelType, setFuelType] = useState(filters.fuel_type ?? '');
    const [transmission, setTransmission] = useState(filters.transmission ?? '');
    const [minPrice, setMinPrice] = useState(filters.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? '');

    function applyFilters() {
        router.get('/browse-cars', {
            search,
            category,
            fuel_type: fuelType,
            transmission,
            min_price: minPrice,
            max_price: maxPrice,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function getPrimaryImage(vehicle: Car) {
        return vehicle.images?.find((img) => img.is_primary) ?? vehicle.images?.[0];
    }

    return (
        <>
            <Head title="Browse Cars" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Browse Available Cars</h1>

                <div className="rounded-lg border p-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label>Search</Label>
                            <Input
                                placeholder="Search brand or model"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Car Type</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    {carTypeNames.map((type) => (
                                        <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Fuel Type</Label>
                            <Select value={fuelType} onValueChange={setFuelType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Fuel Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Petrol">Petrol</SelectItem>
                                    <SelectItem value="Diesel">Diesel</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    <SelectItem value="Electric">Electric</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Transmission</Label>
                            <Select value={transmission} onValueChange={setTransmission}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Transmissions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Manual">Manual</SelectItem>
                                    <SelectItem value="Automatic">Automatic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Min Price (ETB)</Label>
                            <Input
                                type="number"
                                placeholder="Min price"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Max Price (ETB)</Label>
                            <Input
                                type="number"
                                placeholder="Max price"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button onClick={applyFilters}>Search</Button>
                </div>

                {cars.length === 0 ? (
                    <p className="text-muted-foreground">No cars available right now.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cars.map((car) => {
                            const image = getPrimaryImage(car);

                            return (
                                <Card key={car.id} className="overflow-hidden">
                                    {image && (
                                        <img
                                            src={`/storage/${image.image_path}`}
                                            alt={`${car.brand} ${car.model}`}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}

                                    <CardContent className="space-y-3 p-4">
                                        <h2 className="text-xl font-semibold">
                                            {car.brand} {car.model} ({car.year})
                                        </h2>

                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>Type: {car.category}</p>
                                            <p>Fuel: {car.fuel_type}</p>
                                            <p>Transmission: {car.transmission}</p>
                                        </div>

                                        <p className="text-lg font-bold">ETB {car.daily_price} / day</p>

                                        <p className="text-sm text-muted-foreground">
                                            Owner: {car.owner?.name}
                                        </p>

                                        <Link href={`/cars/${car.id}`}>
                                            <Button className="w-full">View Details & Book</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

BrowseCars.layout = {
    breadcrumbs: [{ title: 'Browse Cars', href: '/browse-cars' }],
};
