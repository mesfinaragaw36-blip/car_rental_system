import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    category: string;
    color: string;
    fuel_type: string;
    transmission: string;
    daily_price: number;
    approval_status: string;
    availability_status: string;
    owner: {
        name: string;
    };
}

interface Props {
    vehicles: Vehicle[];
}

function statusBadgeClass(status: string) {
    switch (status) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
}

export default function Vehicles({ vehicles = [] }: Props) {
    const handleApprove = (id: number) => {
        router.post(`/admin/vehicles/${id}/approve`, {}, { preserveScroll: true });
    };

    const handleReject = (id: number) => {
        if (confirm('Are you sure you want to reject this vehicle?')) {
            router.post(`/admin/vehicles/${id}/reject`, {}, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Vehicles" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Vehicle Management</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>All Vehicles</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {vehicles.length === 0 ? (
                            <p className="text-muted-foreground">
                                No vehicles available.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {vehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold">
                                                    {vehicle.brand}{' '}
                                                    {vehicle.model}
                                                </p>

                                                <p className="text-sm text-muted-foreground">
                                                    {vehicle.year} &middot;{' '}
                                                    {vehicle.plate_number}{' '}
                                                    &middot; Owner:{' '}
                                                    {vehicle.owner.name}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                                                        vehicle.approval_status
                                                    )}`}
                                                >
                                                    {vehicle.approval_status}
                                                </span>

                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                                    {vehicle.availability_status}
                                                </span>

                                                {vehicle.approval_status === 'pending' && (
                                                    <div className="flex gap-2 ml-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(vehicle.id)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleReject(vehicle.id)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
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