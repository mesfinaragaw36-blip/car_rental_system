import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CreateVehicle() {
    const { data, setData, post, processing } = useForm({
        brand: '',
        model: '',
        year: '',
        plate_number: '',
        category: '',
        color: '',
        fuel_type: '',
        transmission: '',
        engine_size: '',
        mileage: '',
        seats: '',
        daily_price: '',
        description: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/owner/vehicles');
    }

    return (
        <>
            <Head title="Add Vehicle" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Add Vehicle</h1>

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
                                {processing ? 'Saving...' : 'Save Vehicle'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
