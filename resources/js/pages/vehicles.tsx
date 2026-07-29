import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { destroy } from '@/routes/vehicles';

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    daily_rate: string;
    fuel_type: string;
    transmission: string;
    status: string;
    car_type_name?: { name: string };
}

interface Props { role: string; vehicles: Vehicle[]; }

const STATUS_STYLES: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    rented: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
};

export default function Vehicles({ role, vehicles = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this vehicle?')) {
            router.delete(destroy.url({ car: id }), {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Vehicles" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Vehicles</h1>
                    {(role === 'owner' || role === 'admin') && (
                        <Button asChild>
                            <Link href="/vehicles/create">Add Vehicle</Link>
                        </Button>
                    )}
                </div>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {vehicles.length === 0 ? (
                    <p className="text-muted-foreground">No vehicles found.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {vehicles.map((vehicle) => (
                            <Card key={vehicle.id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between">
                                        <span>{vehicle.brand} {vehicle.model} ({vehicle.year})</span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[vehicle.status] ?? 'bg-gray-100'}`}>
                                            {vehicle.status}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Plate: {vehicle.plate_number}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {vehicle.fuel_type} | {vehicle.transmission}
                                    </p>
                                    {vehicle.car_type_name && (
                                        <p className="text-sm text-muted-foreground">Type: {vehicle.car_type_name.name}</p>
                                    )}
                                    <p className="text-lg font-bold">ETB {vehicle.daily_rate}/day</p>
                                    <div className="flex gap-2 pt-2">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={`/vehicles/${vehicle.id}/edit`}>
                                                <Pencil className="h-4 w-4 mr-1" /> Edit
                                            </Link>
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(vehicle.id)}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Vehicles.layout = {
    breadcrumbs: [{ title: 'Vehicles', href: '/vehicles' }],
};
