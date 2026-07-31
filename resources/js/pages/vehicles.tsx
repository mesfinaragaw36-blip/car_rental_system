import { Head, Link, router, usePage } from '@inertiajs/react';
import { Car, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CarDetailsModal } from '@/components/car-details-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GlareCard } from '@/components/ui/glare-card';
import { destroy } from '@/routes/vehicles';

interface CarImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface CarTypeName {
    id: number;
    name: string;
}

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    daily_price: string;
    fuel_type: string;
    transmission: string;
    seats: number | null;
    category: string;
    color: string;
    engine_size: string | null;
    mileage: number | null;
    description: string | null;
    approval_status: string;
    availability_status: string;
    images: CarImage[];
    car_type_name: CarTypeName | null;
}

interface Props { role: string; vehicles: Vehicle[]; }

export default function Vehicles({ role, vehicles = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            router.delete(destroy.url({ car: id }), { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="My Vehicles" />
            <div className="space-y-8 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Vehicles</h1>
                        <p className="mt-2 text-muted-foreground">Manage all your listed vehicles in one place.</p>
                    </div>
                    {(role === 'owner' || role === 'admin') && (
                        <Link href="/vehicles/create">
                            <Button className="bg-blue-900 hover:bg-blue-950">
                                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                            </Button>
                        </Link>
                    )}
                </div>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {vehicles.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Car className="mb-4 h-16 w-16 text-slate-400" />
                            <h2 className="text-xl font-semibold">No vehicles yet</h2>
                            <p className="mt-2 text-center text-muted-foreground">Start growing your fleet by adding your first vehicle.</p>
                            {(role === 'owner' || role === 'admin') && (
                                <Link href="/vehicles/create" className="mt-6">
                                    <Button className="bg-blue-900 hover:bg-blue-950">
                                        <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {vehicles.map((vehicle) => {
                            const image = vehicle.images?.find((img) => img.is_primary)?.image_path ?? vehicle.images?.[0]?.image_path;

                            return (
                                <GlareCard
                                    key={vehicle.id}
                                    className="w-full cursor-pointer"
                                    onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setDetailsOpen(true);
                                    }}
                                >
                                    <div className="w-full p-2.5">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-[14px]">
                                            {image ? (
                                                <img
                                                    src={`/storage/${image}`}
                                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Car className="h-12 w-12 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-start justify-between gap-3 px-1 pb-1">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                                                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                                                    <Settings2 className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                                                    {vehicle.transmission}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-lg font-bold text-slate-900">ETB {Number(vehicle.daily_price).toLocaleString()}</p>
                                                <p className="text-xs font-medium text-slate-400">per day</p>
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
                    car={selectedVehicle}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    if (selectedVehicle) {
                                        router.get(`/vehicles/${selectedVehicle.id}/edit`);
                                    }
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => {
                                    if (selectedVehicle) {
                                        handleDelete(selectedVehicle.id);
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </>
                    }
                />
            </div>
        </>
    );
}

Vehicles.layout = {
    breadcrumbs: [{ title: 'Vehicles', href: '/vehicles' }],
};