import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface VehicleImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    category: string;
    fuel_type: string;
    transmission: string;
    daily_price: string;
    images: VehicleImage[];
}

interface Props {
    vehicles: {
        data: Vehicle[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        category?: string;
        fuel_type?: string;
        transmission?: string;
        min_price?: string;
        max_price?: string;
    };
}

export default function BrowseCars({ vehicles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [fuelType, setFuelType] = useState(filters.fuel_type || '');
    const [transmission, setTransmission] = useState(filters.transmission || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');

    function applyFilters() {
        router.get('/customer/browse-cars', {
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

    function getPrimaryImage(vehicle: Vehicle) {
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
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sedan">Sedan</SelectItem>
                                    <SelectItem value="SUV">SUV</SelectItem>
                                    <SelectItem value="Hatchback">Hatchback</SelectItem>
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
                                placeholder="Minimum price"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Max Price (ETB)</Label>
                            <Input
                                type="number"
                                placeholder="Maximum price"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button onClick={applyFilters}>Search</Button>
                </div>

                {vehicles.data.length === 0 ? (
                    <p className="text-muted-foreground">No vehicles available.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {vehicles.data.map((vehicle) => {
                            const image = getPrimaryImage(vehicle);

                            return (
                                <Card key={vehicle.id}>
                                    <CardContent className="space-y-3 p-4">
                                        {image && (
                                            <img
                                                src={`/storage/${image.image_path}`}
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                className="h-48 w-full rounded-md object-cover"
                                            />
                                        )}

                                        <h2 className="text-xl font-semibold">
                                            {vehicle.brand} {vehicle.model}
                                        </h2>

                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>Year: {vehicle.year}</p>
                                            <p>Category: {vehicle.category}</p>
                                            <p>Fuel: {vehicle.fuel_type}</p>
                                            <p>Transmission: {vehicle.transmission}</p>
                                        </div>

                                        <p className="text-lg font-bold">
                                            {vehicle.daily_price} ETB / day
                                        </p>

                                        <Link href={`/customer/cars/${vehicle.id}`}>
                                            <Button className="w-full">View Details</Button>
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
