import { Head, Link } from '@inertiajs/react';

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

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    My Vehicles
                </h1>

                <Link
                    href="/owner/vehicles/create"
                    className="mt-4 inline-block rounded bg-black px-4 py-2 text-white"
                >
                    Add Vehicle
                </Link>

                <div className="mt-6 rounded-lg border p-6">
                    {vehicles.length === 0 ? (
                        <p>
                            You have no vehicles.
                        </p>
                    ) : (
                        vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="border-b py-4"
                            >
                                <p>
                                    Brand: {vehicle.brand}
                                </p>

                                <p>
                                    Model: {vehicle.model}
                                </p>

                                <p>
                                    Year: {vehicle.year}
                                </p>

                                <p>
                                    Plate: {vehicle.plate_number}
                                </p>

                                <p>
                                    Approval: {vehicle.approval_status}
                                </p>

                                <p>
                                    Availability: {vehicle.availability_status}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}