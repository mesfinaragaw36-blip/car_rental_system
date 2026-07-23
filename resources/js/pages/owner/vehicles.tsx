import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

                                        <div className="flex gap-2">
                                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                {vehicle.approval_status}
                                            </span>

                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                {vehicle.availability_status}
                                            </span>
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
