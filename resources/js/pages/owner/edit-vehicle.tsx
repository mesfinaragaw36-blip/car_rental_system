import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
    engine_size?: string;
    mileage?: number;
    seats?: number;
    daily_price: number;
    description?: string;
}

interface Props {
    vehicle: Vehicle;
}

export default function EditVehicle({ vehicle }: Props) {
    const { data, setData, put, processing } = useForm({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        plate_number: vehicle.plate_number || '',
        category: vehicle.category || '',
        color: vehicle.color || '',
        fuel_type: vehicle.fuel_type || '',
        transmission: vehicle.transmission || '',
        engine_size: vehicle.engine_size || '',
        mileage: vehicle.mileage?.toString() || '',
        seats: vehicle.seats?.toString() || '',
        daily_price: vehicle.daily_price?.toString() || '',
        description: vehicle.description || '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/owner/vehicles/${vehicle.id}`);
    }

    return (
        <>
            <Head title="Edit Vehicle" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Edit Vehicle</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Information</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Input
                                    placeholder="Brand (e.g. Toyota)"
                                    value={data.brand}
                                    onChange={(e) =>
                                        setData('brand', e.target.value)
                                    }
                                />

                                <Input
                                    placeholder="Model (e.g. Corolla)"
                                    value={data.model}
                                    onChange={(e) =>
                                        setData('model', e.target.value)
                                    }
                                />

                                <Input
                                    type="number"
                                    placeholder="Year"
                                    value={data.year}
                                    onChange={(e) =>
                                        setData('year', e.target.value)
                                    }
                                />

                                <Input
                                    placeholder="Plate Number"
                                    value={data.plate_number}
                                    onChange={(e) =>
                                        setData('plate_number', e.target.value)
                                    }
                                />

                                <Input
                                    placeholder="Category (e.g. Sedan)"
                                    value={data.category}
                                    onChange={(e) =>
                                        setData('category', e.target.value)
                                    }
                                />

                                <Input
                                    placeholder="Color"
                                    value={data.color}
                                    onChange={(e) =>
                                        setData('color', e.target.value)
                                    }
                                />

                                <Input
                                    placeholder="Fuel Type (Petrol/Diesel/Hybrid/Electric)"
                                    value={data.fuel_type}
                                    onChange={(e) =>
                                        setData('fuel_type', e.target.value)
                                    }
                                />

                                <Input
                                    placeholder="Transmission (Manual/Automatic)"
                                    value={data.transmission}
                                    onChange={(e) =>
                                        setData('transmission', e.target.value)
                                    }
                                />

                                <Input
                                    placeholder="Engine Size (e.g. 1.8L)"
                                    value={data.engine_size}
                                    onChange={(e) =>
                                        setData('engine_size', e.target.value)
                                    }
                                />

                                <Input
                                    type="number"
                                    placeholder="Mileage (km)"
                                    value={data.mileage}
                                    onChange={(e) =>
                                        setData('mileage', e.target.value)
                                    }
                                />

                                <Input
                                    type="number"
                                    placeholder="Seats"
                                    value={data.seats}
                                    onChange={(e) =>
                                        setData('seats', e.target.value)
                                    }
                                />

                                <Input
                                    type="number"
                                    placeholder="Daily Price"
                                    value={data.daily_price}
                                    onChange={(e) =>
                                        setData('daily_price', e.target.value)
                                    }
                                />
                            </div>

                            <Textarea
                                placeholder="Description (optional)"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />

                            <Button disabled={processing}>
                                {processing ? 'Updating...' : 'Update Vehicle'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}