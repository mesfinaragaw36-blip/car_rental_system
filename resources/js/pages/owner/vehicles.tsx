import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    approval_status: string;
    availability_status: string;
}

interface Props {
    vehicles: Vehicle[];
}

export default function OwnerVehicles({ vehicles = [] }: Props) {
    return (
        <>
            <Head title="My Vehicles" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Vehicles</h1>

                    <Link href="/owner/vehicles/create">
                        <Button>Add Vehicle</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle List</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {vehicles.length === 0 ? (
                            <p className="text-muted-foreground">
                                You have no vehicles yet.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {vehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {vehicle.brand} {vehicle.model}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {vehicle.year} &middot;{' '}
                                                {vehicle.plate_number}
                                            </p>
                                        </div>

                          <div className="flex items-center gap-4">
    <div className="flex gap-2">
       <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${
        vehicle.approval_status === 'approved'
            ? 'bg-green-100 text-green-800'
            : vehicle.approval_status === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
    }`}
>
    {vehicle.approval_status}
</span>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            {vehicle.availability_status}
        </span>
    </div>

    <Button
    variant="outline"
    size="sm"
    onClick={() => {
        console.log(vehicle.id);
        router.get(`/owner/vehicles/${vehicle.id}/edit`);
    }}
>
    Edit
</Button>

    <Button
        variant="destructive"
        size="sm"
        onClick={() => {
            if (confirm('Are you sure you want to delete this vehicle?')) {
             router.delete(`/owner/vehicles/${vehicle.id}`);   
            }
        }}
    >
        Delete
    </Button>
</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
