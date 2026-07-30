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

                <div className="rounded-2xl border bg-white p-6 shadow-md space-y-6">
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

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                setSearch('');
                                setCategory('');
                                setFuelType('');
                                setTransmission('');
                                setMinPrice('');
                                setMaxPrice('');
                                router.get('/browse-cars');
                            }}
                        >
                            Reset
                        </Button>

                        <Button
                            size="lg"
                            className="px-8"
                            onClick={applyFilters}
                        >
                            Search Cars
                        </Button>
                    </div>
                </div>

                {cars.length === 0 ? (
                    <p className="text-muted-foreground">No cars available right now.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cars.map((car) => {
                            const image = getPrimaryImage(car);

                            return (
                                <Card key={car.id} className="overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition duration-300">
                                    {image && (
                                        <img
                                            src={`/storage/${image.image_path}`}
                                            alt={`${car.brand} ${car.model}`}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <CardContent className="space-y-4 p-4">
                                        <div className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                            Available
                                        </div>

                                        <h2 className="text-xl font-bold">
                                            {car.brand} {car.model}
                                        </h2>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="rounded-lg bg-gray-50 p-2.5">
                                                <p className="text-muted-foreground">Year</p>
                                                <p className="font-medium">{car.year}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-2.5">
                                                <p className="text-muted-foreground">Category</p>
                                                <p className="font-medium">{car.category}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-2.5">
                                                <p className="text-muted-foreground">Fuel</p>
                                                <p className="font-medium">{car.fuel_type}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-2.5">
                                                <p className="text-muted-foreground">Transmission</p>
                                                <p className="font-medium">{car.transmission}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Starting from</p>
                                            <p className="text-2xl font-bold text-green-600">ETB {car.daily_price}</p>
                                            <p className="text-sm text-muted-foreground">per day</p>
                                        </div>

                                        <Link href={`/cars/${car.id}`}>
                                            <Button className="w-full rounded-xl" size="lg">View Vehicle Details</Button>
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
