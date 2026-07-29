import { Head, Link, router, usePage } from '@inertiajs/react';
import { Car, Fuel, Settings2, Users, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    approval_status: string;
    availability_status: string;
    images: CarImage[];
    car_type_name: CarTypeName | null;
}

interface Props { role: string; vehicles: Vehicle[]; }

export default function Vehicles({ role, vehicles = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

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
                    <div className="grid gap-6 lg:grid-cols-2">
                        {vehicles.map((vehicle) => {
                            const image = vehicle.images?.find(i => i.is_primary)?.image_path ?? vehicle.images?.[0]?.image_path;

                            return (
                                <Card key={vehicle.id} className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="h-56 w-full bg-slate-100 md:w-64">
                                                {image ? (
                                                    <img src={`/storage/${image}`} alt={`${vehicle.brand} ${vehicle.model}`} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Car className="h-12 w-12 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between p-6">
                                                <div>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h2 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h2>
                                                            <p className="mt-1 text-sm text-muted-foreground">{vehicle.year} &bull; {vehicle.plate_number}</p>
                                                        </div>
                                                        <p className="text-xl font-bold text-blue-900">
                                                            ETB {vehicle.daily_price}<span className="text-sm font-normal text-muted-foreground">/day</span>
                                                        </p>
                                                    </div>
                                                    <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Settings2 className="h-4 w-4" /> {vehicle.transmission}</span>
                                                        <span className="flex items-center gap-1"><Fuel className="h-4 w-4" /> {vehicle.fuel_type}</span>
                                                        {vehicle.seats && (
                                                            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {vehicle.seats} Seats</span>
                                                        )}
                                                    </div>
                                                    <div className="mt-5 flex gap-2">
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            vehicle.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            vehicle.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                            {vehicle.approval_status}
                                                        </span>
                                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            vehicle.availability_status === 'available' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-200 text-slate-700'
                                                        }`}>
                                                            {vehicle.availability_status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex gap-3">
                                                    <Button variant="outline" onClick={() => router.get(`/vehicles/${vehicle.id}/edit`)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </Button>
                                                    <Button variant="destructive" onClick={() => handleDelete(vehicle.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
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

Vehicles.layout = {
    breadcrumbs: [{ title: 'Vehicles', href: '/vehicles' }],
};