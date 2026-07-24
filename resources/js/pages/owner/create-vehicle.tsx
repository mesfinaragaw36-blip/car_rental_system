import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function CreateVehicle() {
    const { data, setData, post, processing, errors } = useForm({
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
                                <div>
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        placeholder="e.g. Toyota"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                    />
                                    <InputError message={errors.brand} />
                                </div>

                                <div>
                                    <Label htmlFor="model">Model</Label>
                                    <Input
                                        id="model"
                                        placeholder="e.g. Corolla"
                                        value={data.model}
                                        onChange={(e) => setData('model', e.target.value)}
                                    />
                                    <InputError message={errors.model} />
                                </div>

                                <div>
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        placeholder="e.g. 2023"
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                    />
                                    <InputError message={errors.year} />
                                </div>

                                <div>
                                    <Label htmlFor="plate_number">Plate Number</Label>
                                    <Input
                                        id="plate_number"
                                        placeholder="e.g. A1234B"
                                        value={data.plate_number}
                                        onChange={(e) => setData('plate_number', e.target.value)}
                                    />
                                    <InputError message={errors.plate_number} />
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        placeholder="e.g. Sedan"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                    />
                                    <InputError message={errors.category} />
                                </div>

                                <div>
                                    <Label htmlFor="color">Color</Label>
                                    <Input
                                        id="color"
                                        placeholder="e.g. White"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                    />
                                    <InputError message={errors.color} />
                                </div>

                                <div>
                                    <Label>Fuel Type</Label>
                                    <Select value={data.fuel_type} onValueChange={(value) => setData('fuel_type', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select fuel type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Petrol">Petrol</SelectItem>
                                            <SelectItem value="Diesel">Diesel</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                            <SelectItem value="Electric">Electric</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.fuel_type} />
                                </div>

                                <div>
                                    <Label>Transmission</Label>
                                    <Select value={data.transmission} onValueChange={(value) => setData('transmission', value)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select transmission" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Manual">Manual</SelectItem>
                                            <SelectItem value="Automatic">Automatic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.transmission} />
                                </div>

                                <div>
                                    <Label htmlFor="engine_size">Engine Size</Label>
                                    <Input
                                        id="engine_size"
                                        placeholder="e.g. 1.8L"
                                        value={data.engine_size}
                                        onChange={(e) => setData('engine_size', e.target.value)}
                                    />
                                    <InputError message={errors.engine_size} />
                                </div>

                                <div>
                                    <Label htmlFor="mileage">Mileage (km)</Label>
                                    <Input
                                        id="mileage"
                                        type="number"
                                        placeholder="e.g. 50000"
                                        value={data.mileage}
                                        onChange={(e) => setData('mileage', e.target.value)}
                                    />
                                    <InputError message={errors.mileage} />
                                </div>

                                <div>
                                    <Label htmlFor="seats">Seats</Label>
                                    <Input
                                        id="seats"
                                        type="number"
                                        placeholder="e.g. 5"
                                        value={data.seats}
                                        onChange={(e) => setData('seats', e.target.value)}
                                    />
                                    <InputError message={errors.seats} />
                                </div>

                                <div>
                                    <Label htmlFor="daily_price">Daily Price (ETB)</Label>
                                    <Input
                                        id="daily_price"
                                        type="number"
                                        placeholder="e.g. 3000"
                                        value={data.daily_price}
                                        onChange={(e) => setData('daily_price', e.target.value)}
                                    />
                                    <InputError message={errors.daily_price} />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Optional description about the vehicle"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Vehicle'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
