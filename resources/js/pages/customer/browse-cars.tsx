import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    category: string;
    fuel_type: string;
    transmission: string;
    daily_price: string;
}

interface Props {
    vehicles: {
        data: Vehicle[];
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
    return (
        <>
            <Head title="Browse Cars" />

            <div className="p-6">
                <h1 className="mb-6 text-3xl font-bold">
                    Browse Available Cars
                </h1>
                <div className="mb-6 grid gap-4 rounded-lg border p-4 md:grid-cols-3">

    <input
        className="rounded border p-2"
        placeholder="Search brand or model"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
    />

    <select
        className="rounded border p-2"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
    >
        <option value="">All Categories</option>
        <option value="Sedan">Sedan</option>
        <option value="SUV">SUV</option>
        <option value="Hatchback">Hatchback</option>
    </select>


    <select
        className="rounded border p-2"
        value={fuelType}
        onChange={(e) => setFuelType(e.target.value)}
    >
        <option value="">All Fuel Types</option>
        <option value="Petrol">Petrol</option>
        <option value="Diesel">Diesel</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Electric">Electric</option>
    </select>


    <select
        className="rounded border p-2"
        value={transmission}
        onChange={(e) => setTransmission(e.target.value)}
    >
        <option value="">All Transmissions</option>
        <option value="Manual">Manual</option>
        <option value="Automatic">Automatic</option>
    </select>


    <input
        className="rounded border p-2"
        type="number"
        placeholder="Minimum price"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
    />


    <input
        className="rounded border p-2"
        type="number"
        placeholder="Maximum price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
    />


    <Button onClick={applyFilters}>
        Search
    </Button>

</div>

                {vehicles.data.length === 0 ? (
                    <p>No vehicles available.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {vehicles.data.map((vehicle) => (
                            <Card key={vehicle.id}>
                                <CardContent className="space-y-3 p-4">
                                    <h2 className="text-xl font-semibold">
                                        {vehicle.brand} {vehicle.model}
                                    </h2>

                                    <p>Year: {vehicle.year}</p>
                                    <p>Category: {vehicle.category}</p>
                                    <p>Fuel: {vehicle.fuel_type}</p>
                                    <p>Transmission: {vehicle.transmission}</p>

                                    <p className="font-bold">
                                        {vehicle.daily_price} / day
                                    </p>

                                   <Link href={`/customer/cars/${vehicle.id}`}>
                                         <Button className="w-full">
                                                View Details
                                             </Button>
                                        </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}