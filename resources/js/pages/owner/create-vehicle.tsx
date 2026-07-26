import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function CreateVehicle() {
    const { data, setData, processing, errors } = useForm({
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

    const [step, setStep] = useState(1);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
    const [ownershipDocument, setOwnershipDocument] = useState<File | null>(null);
    const [ownershipExpiry, setOwnershipExpiry] = useState('');
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

    const step1Fields = ['brand', 'model', 'year', 'plate_number', 'category', 'color', 'fuel_type', 'transmission', 'daily_price'];

    function handlePhotosChange(files: FileList | null) {
        if (!files) {
            setPhotos([]);
            setPhotoPreviews([]);
            setPrimaryPhotoIndex(0);
            return;
        }

        const fileArray: File[] = [];
        const previews: string[] = [];

        for (let i = 0; i < files.length; i++) {
            fileArray.push(files[i]);
            previews.push(URL.createObjectURL(files[i]));
        }

        setPhotos(fileArray);
        setPhotoPreviews(previews);
        setPrimaryPhotoIndex(0);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setServerErrors({});

        const formData = new FormData();
        formData.append('brand', data.brand);
        formData.append('model', data.model);
        formData.append('year', data.year);
        formData.append('plate_number', data.plate_number);
        formData.append('category', data.category);
        formData.append('color', data.color);
        formData.append('fuel_type', data.fuel_type);
        formData.append('transmission', data.transmission);
        formData.append('daily_price', data.daily_price);

        if (data.engine_size) formData.append('engine_size', data.engine_size);
        if (data.mileage) formData.append('mileage', data.mileage);
        if (data.seats) formData.append('seats', data.seats);
        if (data.description) formData.append('description', data.description);

        photos.forEach((file) => {
            formData.append('photos[]', file);
        });
        formData.append('primary_photo_index', String(primaryPhotoIndex));

        if (ownershipDocument) {
            formData.append('ownership_document', ownershipDocument);
        }
        if (ownershipExpiry) {
            formData.append('ownership_expiry', ownershipExpiry);
        }

        router.post('/owner/vehicles', formData, {
            forceFormData: true,
            preserveState: true,
            onStart: () => {},
            onError: (err) => {
                setServerErrors(err);
                if (step1Fields.some((field) => err[field])) {
                    setStep(1);
                }
            },
            onSuccess: () => {
                setServerErrors({});
            },
        });
    }

    return (
        <>
            <Head title="Add Vehicle" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Add Vehicle</h1>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={step === 1 ? 'font-medium text-foreground' : ''}>1. Vehicle Info</span>
                        <span>&rarr;</span>
                        <span className={step === 2 ? 'font-medium text-foreground' : ''}>2. Photos & Document</span>
                    </div>
                </div>

                {Object.keys(serverErrors).length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <p className="font-medium">Please fix the following errors:</p>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                            {Object.entries(serverErrors).map(([field, message]) => (
                                <li key={field}>{String(message)}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Information</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="brand">Brand</Label>
                                        <Input
                                            id="brand"
                                            placeholder="e.g. Toyota"
                                            value={data.brand}
                                            onChange={(e) => setData('brand', e.target.value)}
                                        />
                                        <InputError message={serverErrors.brand ?? errors.brand} />
                                    </div>

                                    <div>
                                        <Label htmlFor="model">Model</Label>
                                        <Input
                                            id="model"
                                            placeholder="e.g. Corolla"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                        />
                                        <InputError message={serverErrors.model ?? errors.model} />
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
                                        <InputError message={serverErrors.year ?? errors.year} />
                                    </div>

                                    <div>
                                        <Label htmlFor="plate_number">Plate Number</Label>
                                        <Input
                                            id="plate_number"
                                            placeholder="e.g. A1234B"
                                            value={data.plate_number}
                                            onChange={(e) => setData('plate_number', e.target.value)}
                                        />
                                        <InputError message={serverErrors.plate_number ?? errors.plate_number} />
                                    </div>

                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            placeholder="e.g. Sedan"
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                        />
                                        <InputError message={serverErrors.category ?? errors.category} />
                                    </div>

                                    <div>
                                        <Label htmlFor="color">Color</Label>
                                        <Input
                                            id="color"
                                            placeholder="e.g. White"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                        />
                                        <InputError message={serverErrors.color ?? errors.color} />
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
                                        <InputError message={serverErrors.fuel_type ?? errors.fuel_type} />
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
                                        <InputError message={serverErrors.transmission ?? errors.transmission} />
                                    </div>

                                    <div>
                                        <Label htmlFor="engine_size">Engine Size</Label>
                                        <Input
                                            id="engine_size"
                                            placeholder="e.g. 1.8L"
                                            value={data.engine_size}
                                            onChange={(e) => setData('engine_size', e.target.value)}
                                        />
                                        <InputError message={serverErrors.engine_size ?? errors.engine_size} />
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
                                        <InputError message={serverErrors.mileage ?? errors.mileage} />
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
                                        <InputError message={serverErrors.seats ?? errors.seats} />
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
                                        <InputError message={serverErrors.daily_price ?? errors.daily_price} />
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
                                    <InputError message={serverErrors.description ?? errors.description} />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vehicle Photos</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="photos">Upload photos</Label>
                                        <Input
                                            id="photos"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="mt-1"
                                            onChange={(e) => handlePhotosChange(e.target.files)}
                                        />
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Upload one or more photos. Pick the main photo below.
                                        </p>
                                        <InputError message={serverErrors.photos} />
                                    </div>

                                    {photoPreviews.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">Pick the main photo</p>

                                            <div className="grid gap-4 md:grid-cols-3">
                                                {photoPreviews.map((src, index) => (
                                                    <label
                                                        key={src}
                                                        className={`group cursor-pointer rounded-lg border-2 p-2 transition-colors ${
                                                            primaryPhotoIndex === index
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-muted hover:border-primary/50'
                                                        }`}
                                                    >
                                                        <img
                                                            src={src}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-32 w-full rounded-md object-cover"
                                                        />
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name="primary_photo_index"
                                                                value={index}
                                                                checked={primaryPhotoIndex === index}
                                                                onChange={() => setPrimaryPhotoIndex(index)}
                                                            />
                                                            <span className="text-sm">
                                                                {primaryPhotoIndex === index ? 'Main photo' : 'Select as main'}
                                                            </span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ownership Document</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div>
                                        <Label htmlFor="ownership_document">Upload ownership document</Label>
                                        <Input
                                            id="ownership_document"
                                            type="file"
                                            accept="image/*,application/pdf"
                                            className="mt-1"
                                            onChange={(e) =>
                                                setOwnershipDocument(e.target.files?.[0] ?? null)
                                            }
                                        />
                                        <InputError message={serverErrors.ownership_document} />
                                    </div>

                                    <div>
                                        <Label htmlFor="ownership_expiry">Expiry Date</Label>
                                        <Input
                                            id="ownership_expiry"
                                            type="date"
                                            className="mt-1"
                                            value={ownershipExpiry}
                                            onChange={(e) => setOwnershipExpiry(e.target.value)}
                                        />
                                        <InputError message={serverErrors.ownership_expiry} />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    <div className="flex items-center justify-between">
                        <div>
                            {step === 2 && (
                                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                    &larr; Back
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {step === 1 && (
                                <Button type="button" onClick={() => setStep(2)}>
                                    Next &rarr;
                                </Button>
                            )}

                            {step === 2 && (
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Vehicle'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
