import { Head } from '@inertiajs/react';

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
}

interface Props {
    vehicles: Vehicle[];
}

export default function Vehicles({ vehicles = [] }: Props) {
    return (
        <>
            <Head title="Vehicles" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Vehicle Management
                </h1>

                <div className="mt-6 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold">
                        Vehicle List
                    </h2>

                    {vehicles.length === 0 ? (
                        <p className="mt-4">
                            No vehicles available.
                        </p>
                    ) : (
                        vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="mt-4 rounded border p-4"
                            >
                                <p>Brand: {vehicle.brand}</p>
                                <p>Model: {vehicle.model}</p>
                                <p>Year: {vehicle.year}</p>
                                <p>Plate Number: {vehicle.plate_number}</p>
                                <p>Category: {vehicle.category}</p>
                                <p>Color: {vehicle.color}</p>
                                <p>Fuel Type: {vehicle.fuel_type}</p>
                                <p>Transmission: {vehicle.transmission}</p>
                                <p>Engine Size: {vehicle.engine_size}</p>
                                <p>Mileage: {vehicle.mileage}</p>
                                <p>Seats: {vehicle.seats}</p>
                                <p>Daily Price: {vehicle.daily_price}</p>
                                <p>Description: {vehicle.description}</p>
                                <p>Approval Status: {vehicle.approval_status}</p>
                                <p>
                                    Availability Status: {vehicle.availability_status}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold">
                        Vehicle Images
                    </h2>

                    <p className="mt-3">
                        Upload and manage vehicle images.
                    </p>
                </div>

                <div className="mt-6 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold">
                        Vehicle Documents
                    </h2>

                    <p className="mt-3">
                        Manage registration and ownership documents.
                    </p>
                </div>
            </div>
        </>
    );
}