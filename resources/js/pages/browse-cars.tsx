import { Head, router, Link } from '@inertiajs/react';
import { Car, Search, Settings2, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { CarDetailsModal } from '@/components/car-details-modal';
import { Button } from '@/components/ui/button';
import { GlareCard } from '@/components/ui/glare-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    color: string;
    engine_size: string | null;
    mileage: number | null;
    seats: number | null;
    description: string | null;
    availability_status: string;
    images: CarImage[];
    owner: { id: number; name: string; phone: string };
    car_type_name?: { id: number; name: string };
    average_rating?: number;
    review_count?: number;
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
        pickup_date?: string;
        return_date?: string;
    };
}

export default function BrowseCars({
    cars = [],
    carTypeNames = [],
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [fuelType, setFuelType] = useState(filters.fuel_type ?? '');
    const [transmission, setTransmission] = useState(
        filters.transmission ?? '',
    );
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const [pickupDate, setPickupDate] = useState(filters.pickup_date ?? '');
    const [returnDate, setReturnDate] = useState(filters.return_date ?? '');

    const activeFilterCount = [
        search,
        category,
        fuelType,
        transmission,
        pickupDate,
        returnDate,
    ].filter((value) => value !== '').length;

    function applyFilters() {
        router.get(
            '/browse-cars',
            {
                search,
                category,
                fuel_type: fuelType,
                transmission,
                pickup_date: pickupDate,
                return_date: returnDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function getPrimaryImage(vehicle: Car) {
        return (
            vehicle.images?.find((img) => img.is_primary) ?? vehicle.images?.[0]
        );
    }

    function resetFilters() {
        setSearch('');
        setCategory('');
        setFuelType('');
        setTransmission('');
        setPickupDate('');
        setReturnDate('');
        router.get('/browse-cars');
    }

    return (
        <>
            <Head title="Browse Cars" />

            <div className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Browse Available Cars
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {cars.length} vehicle{cars.length === 1 ? '' : 's'}{' '}
                            available
                        </p>
                    </div>

                    <Button
                        variant={activeFilterCount > 0 ? 'default' : 'outline'}
                        size="lg"
                        className={
                            activeFilterCount > 0
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : undefined
                        }
                        onClick={() => setFiltersOpen((open) => !open)}
                    >
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-primary">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </div>

                {filtersOpen && (
                    <div className="flex animate-in flex-wrap items-end gap-3 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl duration-200 zoom-in-95 fade-in slide-in-from-top-2">
                        <div className="min-w-52 flex-1">
                            <Label>Search</Label>
                            <Input
                                placeholder="Brand or model"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <div className="min-w-40">
                                <Label>Pickup Date</Label>
                                <Input
                                    type="date"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                />
                            </div>

                            <div className="min-w-40">
                                <Label>Return Date</Label>
                                <Input
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="min-w-40">
                            <Label>Car Type</Label>
                            <Select
                                value={category}
                                onValueChange={setCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    {carTypeNames.map((type) => (
                                        <SelectItem
                                            key={type.id}
                                            value={type.name}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-40">
                            <Label>Fuel Type</Label>
                            <Select
                                value={fuelType}
                                onValueChange={setFuelType}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Petrol">
                                        Petrol
                                    </SelectItem>
                                    <SelectItem value="Diesel">
                                        Diesel
                                    </SelectItem>
                                    <SelectItem value="Hybrid">
                                        Hybrid
                                    </SelectItem>
                                    <SelectItem value="Electric">
                                        Electric
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-40">
                            <Label>Transmission</Label>
                            <Select
                                value={transmission}
                                onValueChange={setTransmission}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Transmissions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Manual">
                                        Manual
                                    </SelectItem>
                                    <SelectItem value="Automatic">
                                        Automatic
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                className="bg-primary text-white hover:bg-primary/90"
                                onClick={() => {
                                    applyFilters();
                                    setFiltersOpen(false);
                                }}
                            >
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetFilters();
                                    setFiltersOpen(false);
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                )}

                {cars.length === 0 ? (
                    <p className="text-muted-foreground">
                        No cars available right now.
                    </p>
                ) : (
                    <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {cars.map((car) => {
                            const image = getPrimaryImage(car);

                            return (
                                <GlareCard
                                    key={car.id}
                                    className="w-full cursor-pointer"
                                    onClick={() => {
                                        setSelectedCar(car);
                                        setDetailsOpen(true);
                                    }}
                                >
                                    <div className="w-full p-2.5">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-[14px] p-2">
                                            {image ? (
                                                <img
                                                    src={`/storage/${image.image_path}`}
                                                    alt={`${car.brand} ${car.model}`}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Car className="h-12 w-12 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-start justify-between gap-3 px-1 pb-1">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-bold text-slate-900">
                                                    {car.brand} {car.model}
                                                </h3>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Settings2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    {car.transmission}
                                                </p>
                                                {car.average_rating !==
                                                    undefined && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {car.average_rating} ★ ·{' '}
                                                        {car.review_count ?? 0}{' '}
                                                        review
                                                        {(car.review_count ??
                                                            0) === 1
                                                            ? ''
                                                            : 's'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    ETB{' '}
                                                    {Number(
                                                        car.daily_price,
                                                    ).toLocaleString()}
                                                </p>
                                                <p className="text-xs font-medium text-slate-400">
                                                    per day
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </GlareCard>
                            );
                        })}
                    </div>
                )}

                <CarDetailsModal
                    open={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                    car={selectedCar}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDetailsOpen(false)}
                            >
                                Close
                            </Button>
                            <Button
                                asChild
                                className="flex-1 bg-primary text-white hover:bg-primary/90"
                            >
                                <Link
                                    href={
                                        selectedCar
                                            ? `/cars/${selectedCar.id}`
                                            : '#'
                                    }
                                >
                                    Book Now
                                </Link>
                            </Button>
                        </>
                    }
                />
            </div>
        </>
    );
}

BrowseCars.layout = {
    breadcrumbs: [{ title: 'Browse Cars', href: '/browse-cars' }],
};
