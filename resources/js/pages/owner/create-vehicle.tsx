import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        photos: null,
        primary_photo_index: 0,
        registration_document: null,
        registration_expiry: '',
        ownership_document: null,
        ownership_expiry: '',
    });

    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const primaryPhotoIndex = Number(data.primary_photo_index ?? 0);

    const hasPhotos = photoPreviews.length > 0;

    const photoWarnings = useMemo(() => {
        if (!hasPhotos) {
            return null;
        }

        if (primaryPhotoIndex >= photoPreviews.length) {
            return 'Please select a main photo.';
        }

        return null;
    }, [hasPhotos, primaryPhotoIndex, photoPreviews.length]);

    function handlePhotosChange(files: FileList | null) {
        setData('photos', files);
        setData('primary_photo_index', 0);

        if (!files) {
            setPhotoPreviews([]);
            return;
        }

        const previews: string[] = [];

        for (let i = 0; i < files.length; i += 1) {
            const file = files[i];
            previews.push(URL.createObjectURL(file));
        }

        setPhotoPreviews(previews);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/owner/vehicles', {
            forceFormData: true,
        });
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
                        <form onSubmit={submit} className="space-y-6">
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

                            <div className="rounded-2xl border border-muted p-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="photos">
                                        Vehicle photos
                                    </Label>
                                    <input
                                        id="photos"
                                        name="photos"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(event) =>
                                            handlePhotosChange(
                                                event.currentTarget.files,
                                            )
                                        }
                                    />
                                </div>

                                {photoWarnings && (
                                    <p className="text-sm text-red-600">
                                        {photoWarnings}
                                    </p>
                                )}

                                {photoPreviews.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <p className="text-sm font-medium">
                                            Pick the main photo
                                        </p>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            {photoPreviews.map((src, index) => (
                                                <label
                                                    key={src}
                                                    className="group rounded-lg border p-2"
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
                                                            checked={
                                                                primaryPhotoIndex ===
                                                                index
                                                            }
                                                            onChange={() =>
                                                                setData(
                                                                    'primary_photo_index',
                                                                    index,
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm">
                                                            Main photo
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-muted p-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="registration_document">
                                        Registration document
                                    </Label>
                                    <input
                                        id="registration_document"
                                        name="registration_document"
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(event) =>
                                            setData(
                                                'registration_document',
                                                event.currentTarget.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid gap-2 mt-4">
                                    <Label htmlFor="registration_expiry">
                                        Registration expiry date
                                    </Label>
                                    <Input
                                        id="registration_expiry"
                                        type="date"
                                        value={data.registration_expiry}
                                        onChange={(event) =>
                                            setData(
                                                'registration_expiry',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-muted p-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="ownership_document">
                                        Ownership document
                                    </Label>
                                    <input
                                        id="ownership_document"
                                        name="ownership_document"
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(event) =>
                                            setData(
                                                'ownership_document',
                                                event.currentTarget.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid gap-2 mt-4">
                                    <Label htmlFor="ownership_expiry">
                                        Ownership expiry date
                                    </Label>
                                    <Input
                                        id="ownership_expiry"
                                        type="date"
                                        value={data.ownership_expiry}
                                        onChange={(event) =>
                                            setData(
                                                'ownership_expiry',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

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
