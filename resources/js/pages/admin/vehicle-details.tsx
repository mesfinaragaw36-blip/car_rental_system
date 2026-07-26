import { Head, Link, router } from '@inertiajs/react';
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
    engine_size: string;
    mileage: number;
    seats: number;
    daily_price: number;
    description: string | null;
    approval_status: string;
    availability_status: string;
    owner: {
        name: string;
        email: string;
    };
    images: {
        id: number;
        image_path: string;
    }[];
}

interface Props {
    vehicle: Vehicle;
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

export default function VehicleDetails({ vehicle }: Props) {
    const handleApprove = () => {
        router.post(`/admin/vehicles/${vehicle.id}/approve`);
    };

    const handleReject = () => {
        if (confirm('Are you sure you want to reject this vehicle?')) {
            router.post(`/admin/vehicles/${vehicle.id}/reject`);
        }
    };

    return (
        <>
            <Head title={`${vehicle.brand} ${vehicle.model}`} />

            <div className="p-6 max-w-3xl mx-auto space-y-6">
                <Link href="/admin/vehicles" className="text-sm text-muted-foreground hover:underline">
                    &larr; Back to Vehicles
                </Link>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </CardTitle>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                                vehicle.approval_status
                            )}`}
                        >
                            {vehicle.approval_status}
                        </span>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {vehicle.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {vehicle.images.map((img) => (
                                    <img
                                        key={img.id}
                                        src={`/storage/${img.image_path}`}
                                        alt="Vehicle"
                                        className="h-32 w-full rounded-md object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <p><strong>Owner:</strong> {vehicle.owner.name}</p>
                            <p><strong>Email:</strong> {vehicle.owner.email}</p>
                            <p><strong>Plate Number:</strong> {vehicle.plate_number}</p>
                            <p><strong>Category:</strong> {vehicle.category}</p>
                            <p><strong>Color:</strong> {vehicle.color}</p>
                            <p><strong>Fuel Type:</strong> {vehicle.fuel_type}</p>
                            <p><strong>Transmission:</strong> {vehicle.transmission}</p>
                            <p><strong>Engine Size:</strong> {vehicle.engine_size}</p>
                            <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
                            <p><strong>Seats:</strong> {vehicle.seats}</p>
                            <p><strong>Daily Price:</strong> ${vehicle.daily_price}</p>
                            <p><strong>Availability:</strong> {vehicle.availability_status}</p>
                        </div>

                        <div>
                            <p className="font-medium">Description</p>
                            <p className="text-muted-foreground text-sm">
                                {vehicle.description || 'No description provided.'}
                            </p>
                        </div>

                        {vehicle.approval_status === 'pending' && (
                            <div className="flex gap-3 pt-4">
                                <Button onClick={handleApprove}>Approve</Button>
                                <Button variant="destructive" onClick={handleReject}>Reject</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}