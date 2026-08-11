import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Option {
    id: number;
    name: string;
}

interface CarTypeTemplate {
    id: number;
    brand: string;
    model: string;
    car_type_name_id: number | null;
    fuel_type: string;
    transmission: string;
    engine_size: string | null;
    seats: number | null;
    car_type_name?: { id: number; name: string } | null;
}

interface Props {
    carTypeNames: Option[];
    carTypes: CarTypeTemplate[];
}

export default function AdminCreateVehicle({
    carTypeNames,
    carTypes,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        brand: '',
        model: '',
        year: '',
        plate_number: '',
        category: '',
        color: '',
        fuel_type: '',
        transmission: '',
        car_type_name_id: '',
        engine_size: '',
        mileage: '',
        seats: '',
        daily_price: '',
        availability_status: 'available',
        description: '',
        available_periods: [] as { start_date: string; end_date: string }[],
        ownership_expiry: '',
    });

    const [step, setStep] = useState(1);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
    const [ownershipDocument, setOwnershipDocument] = useState<File | null>(
        null,
    );
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    const [templateQuery, setTemplateQuery] = useState('');
    const [templateOpen, setTemplateOpen] = useState(false);
    const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');

    const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
    const MAX_DOC_SIZE = 10 * 1024 * 1024;
    const [photoErrors, setPhotoErrors] = useState<string[]>([]);
    const [uploadFailed, setUploadFailed] = useState(false);

    const step1Fields = [
        'brand',
        'model',
        'year',
        'plate_number',
        'category',
        'color',
        'fuel_type',
        'transmission',
        'daily_price',
    ];

    function templateLabel(template: CarTypeTemplate): string {
        return `${template.brand} ${template.model} (${template.car_type_name?.name ?? 'Other'})`;
    }

    const visibleTemplates = carTypes.filter((template) => {
        const query = templateQuery.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return [
            template.brand,
            template.model,
            template.car_type_name?.name ?? '',
        ]
            .join(' ')
            .toLowerCase()
            .includes(query);
    });

    function handleTemplatePick(template: CarTypeTemplate) {
        const label = templateLabel(template);

        setData('brand', template.brand);
        setData('model', template.model);

        if (template.car_type_name) {
            setData('car_type_name_id', String(template.car_type_name.id));
            setData('category', template.car_type_name.name);
        }

        setData('fuel_type', template.fuel_type);
        setData('transmission', template.transmission);
        setData('engine_size', template.engine_size ?? '');
        setData('seats', template.seats !== null ? String(template.seats) : '');

        setTemplateQuery(label);
        setSelectedTemplateLabel(label);
        setTemplateOpen(false);
    }

    function handleTemplateQueryChange(value: string) {
        setTemplateQuery(value);

        if (value !== selectedTemplateLabel) {
            setSelectedTemplateLabel('');
        }

        setTemplateOpen(true);
    }

    function handleTemplateKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Escape') {
            setTemplateOpen(false);
        }

        if (e.key === 'Enter' && templateOpen && visibleTemplates.length > 0) {
            e.preventDefault();
            handleTemplatePick(visibleTemplates[0]);
        }
    }

    function handlePhotosChange(files: FileList | null) {
        if (!files) {
            setPhotos([]);
            setPhotoPreviews([]);
            setPrimaryPhotoIndex(0);
            setPhotoErrors([]);

            return;
        }

        const fileArray: File[] = [];
        const previews: string[] = [];
        const errors: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > MAX_PHOTO_SIZE) {
                errors.push(`${file.name} exceeds 10MB`);
                continue;
            }

            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name} is not an image`);
                continue;
            }

            fileArray.push(file);
            previews.push(URL.createObjectURL(file));
        }

        setPhotos(fileArray);
        setPhotoPreviews(previews);
        setPrimaryPhotoIndex(0);
        setPhotoErrors(errors);
    }

    function formatSize(bytes: number): string {
        if (bytes >= 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        }

        return (bytes / 1024).toFixed(0) + 'KB';
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setServerErrors({});
        setUploadFailed(false);

        if (ownershipDocument && ownershipDocument.size > MAX_DOC_SIZE) {
            setServerErrors({
                ownership_document: `Document exceeds 10MB limit (${formatSize(ownershipDocument.size)})`,
            });
            setStep(2);

            return;
        }

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
        formData.append('availability_status', data.availability_status);

        if (data.car_type_name_id) {
            formData.append('car_type_name_id', data.car_type_name_id);
        }

        if (data.engine_size) {
            formData.append('engine_size', data.engine_size);
        }

        if (data.mileage) {
            formData.append('mileage', data.mileage);
        }

        if (data.seats) {
            formData.append('seats', data.seats);
        }

        if (data.description) {
            formData.append('description', data.description);
        }

        photos.forEach((file) => formData.append('photos[]', file));
        formData.append('primary_photo_index', String(primaryPhotoIndex));

        if (ownershipDocument) {
            formData.append('ownership_document', ownershipDocument);
        }
        if (data.ownership_expiry) {
            formData.append('ownership_expiry', data.ownership_expiry);
        }

        data.available_periods
            .filter((period) => period.start_date && period.end_date)
            .forEach((period, index) => {
                formData.append(
                    `available_periods[${index}][start_date]`,
                    period.start_date,
                );
                formData.append(
                    `available_periods[${index}][end_date]`,
                    period.end_date,
                );
            });

        post('/admin/vehicles', {
            forceFormData: true,
            preserveState: true,
            onError: (err) => {
                setServerErrors(err);

                if (Object.keys(err).length === 0) {
                    setUploadFailed(true);
                }

                if (step1Fields.some((field) => err[field])) {
                    setStep(1);
                }
            },
            onSuccess: () => setServerErrors({}),
        });
    }

    return (
        <>
            <Head title="Add Vehicle" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Add Vehicle</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span
                            className={
                                step === 1 ? 'font-medium text-foreground' : ''
                            }
                        >
                            1. Vehicle Info
                        </span>
                        <span>&rarr;</span>
                        <span
                            className={
                                step === 2 ? 'font-medium text-foreground' : ''
                            }
                        >
                            2. Photos & Document
                        </span>
                    </div>
                </div>

                {Object.keys(serverErrors).length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <p className="font-medium">
                            Please fix the following errors:
                        </p>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                            {Object.entries(serverErrors).map(
                                ([field, message]) => (
                                    <li key={field}>{String(message)}</li>
                                ),
                            )}
                        </ul>
                    </div>
                )}

                {uploadFailed && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <p className="font-medium">Upload failed</p>
                        <p className="mt-1">
                            The server rejected the upload. Try uploading fewer
                            or smaller images.
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border border-dashed p-4">
                                    <Label htmlFor="vehicle-template-search">
                                        Pick a vehicle model{' '}
                                        <span className="font-normal text-muted-foreground">
                                            (optional — type to filter, then
                                            select)
                                        </span>
                                    </Label>
                                    <div
                                        className="relative mt-1"
                                        onBlur={(e) => {
                                            if (
                                                !e.currentTarget.contains(
                                                    e.relatedTarget,
                                                )
                                            ) {
                                                setTemplateOpen(false);
                                            }
                                        }}
                                    >
                                        <Input
                                            id="vehicle-template-search"
                                            placeholder="Type to search, e.g. Toyota"
                                            value={templateQuery}
                                            onChange={(e) =>
                                                handleTemplateQueryChange(
                                                    e.target.value,
                                                )
                                            }
                                            onFocus={() =>
                                                setTemplateOpen(true)
                                            }
                                            onKeyDown={handleTemplateKeyDown}
                                        />
                                        {templateOpen && (
                                            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                                                {visibleTemplates.length > 0 ? (
                                                    <ul>
                                                        {visibleTemplates.map(
                                                            (template) => (
                                                                <li
                                                                    key={
                                                                        template.id
                                                                    }
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                                                        onMouseDown={(
                                                                            e,
                                                                        ) =>
                                                                            e.preventDefault()
                                                                        }
                                                                        onClick={() =>
                                                                            handleTemplatePick(
                                                                                template,
                                                                            )
                                                                        }
                                                                    >
                                                                        <span>
                                                                            {templateLabel(
                                                                                template,
                                                                            )}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {template
                                                                                .car_type_name
                                                                                ?.name ??
                                                                                'Other'}
                                                                            {' '}·{' '}
                                                                            {
                                                                                template.fuel_type
                                                                            }
                                                                            {' '}·{' '}
                                                                            {
                                                                                template.transmission
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <p className="px-3 py-2 text-sm text-muted-foreground">
                                                        No matching vehicles.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Fields below are filled automatically
                                        and can still be edited.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="brand">Brand</Label>
                                        <Input
                                            id="brand"
                                            placeholder="e.g. Toyota"
                                            value={data.brand}
                                            onChange={(e) =>
                                                setData('brand', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.brand ??
                                                errors.brand
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="model">Model</Label>
                                        <Input
                                            id="model"
                                            placeholder="e.g. Corolla"
                                            value={data.model}
                                            onChange={(e) =>
                                                setData('model', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.model ??
                                                errors.model
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="year">Year</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            placeholder="e.g. 2023"
                                            value={data.year}
                                            onChange={(e) =>
                                                setData('year', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.year ?? errors.year
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="plate_number">
                                            Plate Number
                                        </Label>
                                        <Input
                                            id="plate_number"
                                            placeholder="e.g. A1234B"
                                            value={data.plate_number}
                                            onChange={(e) =>
                                                setData(
                                                    'plate_number',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.plate_number ??
                                                errors.plate_number
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Car Type</Label>
                                        <Select
                                            value={data.car_type_name_id}
                                            onValueChange={(value) => {
                                                const option =
                                                    carTypeNames.find(
                                                        (t) =>
                                                            String(t.id) ===
                                                            value,
                                                    );
                                                setData(
                                                    'car_type_name_id',
                                                    value,
                                                );

                                                if (option) {
                                                    setData(
                                                        'category',
                                                        option.name,
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select car type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {carTypeNames.map((type) => (
                                                    <SelectItem
                                                        key={type.id}
                                                        value={String(type.id)}
                                                    >
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                serverErrors.car_type_name_id ??
                                                errors.car_type_name_id
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="color">Color</Label>
                                        <Input
                                            id="color"
                                            placeholder="e.g. White"
                                            value={data.color}
                                            onChange={(e) =>
                                                setData('color', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.color ??
                                                errors.color
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Fuel Type</Label>
                                        <Select
                                            value={data.fuel_type}
                                            onValueChange={(value) =>
                                                setData('fuel_type', value)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select fuel type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Petrol">
                                                    Petrol
                                                </SelectItem>
                                                <SelectItem value="Diesel">
                                                    Diesel
                                                </SelectItem>
                                                <SelectItem value="Hybrid">
                                                    Hybrid
                                                </SelectItem>
                                                <SelectItem value="Electric">
                                                    Electric
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                serverErrors.fuel_type ??
                                                errors.fuel_type
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Transmission</Label>
                                        <Select
                                            value={data.transmission}
                                            onValueChange={(value) =>
                                                setData('transmission', value)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select transmission" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Manual">
                                                    Manual
                                                </SelectItem>
                                                <SelectItem value="Automatic">
                                                    Automatic
                                                </SelectItem>
                                                <SelectItem value="Semi">
                                                    Semi
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                serverErrors.transmission ??
                                                errors.transmission
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="engine_size">
                                            Engine Size
                                        </Label>
                                        <Input
                                            id="engine_size"
                                            placeholder="e.g. 1.8L"
                                            value={data.engine_size}
                                            onChange={(e) =>
                                                setData(
                                                    'engine_size',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.engine_size ??
                                                errors.engine_size
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="mileage">
                                            Mileage (km)
                                        </Label>
                                        <Input
                                            id="mileage"
                                            type="number"
                                            placeholder="e.g. 50000"
                                            value={data.mileage}
                                            onChange={(e) =>
                                                setData(
                                                    'mileage',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.mileage ??
                                                errors.mileage
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="seats">Seats</Label>
                                        <Input
                                            id="seats"
                                            type="number"
                                            placeholder="e.g. 5"
                                            value={data.seats}
                                            onChange={(e) =>
                                                setData('seats', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.seats ??
                                                errors.seats
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="daily_price">
                                            Daily Price (ETB)
                                        </Label>
                                        <Input
                                            id="daily_price"
                                            type="number"
                                            placeholder="e.g. 3000"
                                            value={data.daily_price}
                                            onChange={(e) =>
                                                setData(
                                                    'daily_price',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.daily_price ??
                                                errors.daily_price
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Optional description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            serverErrors.description ??
                                            errors.description
                                        }
                                    />
                                </div>

                                <div className="space-y-4 border-t pt-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Available Date Ranges
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Customers can only book the car during these date
                                            ranges. You can add or edit these later too.
                                        </p>
                                    </div>
                                    {data.available_periods.map((period, index) => (
                                        <div
                                            key={index}
                                            className="grid gap-2 rounded-lg border p-4 md:grid-cols-2"
                                        >
                                            <div>
                                                <Label>Start Date</Label>
                                                <Input
                                                    type="date"
                                                    value={period.start_date}
                                                    onChange={(e) => {
                                                        const periods = [...data.available_periods];
                                                        periods[index] = {
                                                            ...periods[index],
                                                            start_date: e.target.value,
                                                        };
                                                        setData('available_periods', periods);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>End Date</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="date"
                                                        value={period.end_date}
                                                        onChange={(e) => {
                                                            const periods = [...data.available_periods];
                                                            periods[index] = {
                                                                ...periods[index],
                                                                end_date: e.target.value,
                                                            };
                                                            setData('available_periods', periods);
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setData(
                                                                'available_periods',
                                                                data.available_periods.filter(
                                                                    (_, i) => i !== index,
                                                                ),
                                                            );
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setData('available_periods', [
                                                ...data.available_periods,
                                                { start_date: '', end_date: '' },
                                            ])
                                        }
                                    >
                                        + Add Available Range
                                    </Button>
                                    <InputError
                                        message={serverErrors.available_periods ?? errors.available_periods}
                                    />
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
                                        <Label htmlFor="photos">
                                            Upload photos
                                        </Label>
                                        <Input
                                            id="photos"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            multiple
                                            className="mt-1"
                                            onChange={(e) =>
                                                handlePhotosChange(
                                                    e.target.files,
                                                )
                                            }
                                        />
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            JPEG, PNG, GIF, or WebP — max 10MB
                                            each.
                                        </p>
                                        {photoErrors.length > 0 && (
                                            <ul className="mt-2 list-inside list-disc space-y-0.5 text-sm text-red-600 dark:text-red-400">
                                                {photoErrors.map((err) => (
                                                    <li key={err}>{err}</li>
                                                ))}
                                            </ul>
                                        )}
                                        <InputError
                                            message={serverErrors.photos}
                                        />
                                    </div>
                                    {photoPreviews.length > 0 && (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">
                                                Pick the main photo
                                            </p>
                                            <div className="grid gap-4 md:grid-cols-3">
                                                {photoPreviews.map(
                                                    (src, index) => (
                                                        <label
                                                            key={src}
                                                            className={`group cursor-pointer rounded-lg border-2 p-2 transition-colors ${primaryPhotoIndex === index ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
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
                                                                    value={
                                                                        index
                                                                    }
                                                                    checked={
                                                                        primaryPhotoIndex ===
                                                                        index
                                                                    }
                                                                    onChange={() =>
                                                                        setPrimaryPhotoIndex(
                                                                            index,
                                                                        )
                                                                    }
                                                                />
                                                                <span className="text-sm">
                                                                    {primaryPhotoIndex ===
                                                                    index
                                                                        ? 'Main photo'
                                                                        : 'Select as main'}
                                                                </span>
                                                                <span className="ml-auto text-xs text-muted-foreground">
                                                                    {formatSize(
                                                                        photos[
                                                                            index
                                                                        ]
                                                                            ?.size ??
                                                                            0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    ),
                                                )}
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
                                        <Label htmlFor="ownership_document">
                                            Upload ownership document
                                        </Label>
                                        <Input
                                            id="ownership_document"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                            className="mt-1"
                                            onChange={(e) =>
                                                setOwnershipDocument(
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            JPEG, PNG, WebP, GIF, or PDF — max
                                            10MB.
                                        </p>
                                        {ownershipDocument &&
                                            ownershipDocument.size >
                                                MAX_DOC_SIZE && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {ownershipDocument.name}{' '}
                                                    exceeds 10MB
                                                </p>
                                            )}
                                        <InputError
                                            message={
                                                serverErrors.ownership_document
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="ownership_expiry">
                                            Ownership Document Expiry Date
                                        </Label>
                                        <Input
                                            id="ownership_expiry"
                                            type="date"
                                            value={data.ownership_expiry}
                                            onChange={(e) =>
                                                setData(
                                                    'ownership_expiry',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                serverErrors.ownership_expiry ??
                                                errors.ownership_expiry
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    <div className="flex items-center justify-between">
                        <div>
                            {step === 2 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    &larr; Back
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {step === 1 && (
                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                >
                                    Next &rarr;
                                </Button>
                            )}
                            {step === 2 && (
                                <Button
                                    type="submit"
                                    disabled={
                                        processing || photoErrors.length > 0
                                    }
                                >
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

AdminCreateVehicle.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Vehicles', href: '/admin/vehicles' },
        { title: 'Add Vehicle', href: '#' },
    ],
};
