import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { SearchableCombobox } from '@/components/searchable-combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { store } from '@/routes/vehicles';

interface CarTypeTemplate {
    id: number;
    brand: string;
    model: string;
    year: string | null;
    categories: string[];
    fuel_types: string[];
    transmissions: string[];
    engine_sizes: string[] | null;
    seats: number[] | null;
    colors: string[] | null;
}

interface Props {
    carTypes: CarTypeTemplate[];
    rejectedRequest?: {
        brand: string;
        model: string;
        year: string;
        admin_note: string;
    } | null;
}

function unionOptions(...lists: (string | null | undefined)[][]): string[] {
    return Array.from(
        new Set(
            lists.flatMap((list) =>
                (list ?? []).filter(
                    (value): value is string => value != null && value !== '',
                ),
            ),
        ),
    ).sort();
}

export default function CreateVehicle({ carTypes, rejectedRequest }: Props) {
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
        availability_status: 'available',
        description: '',
        available_periods: [] as { start_date: string; end_date: string }[],
    });

    const [step, setStep] = useState(1);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
    const [ownershipDocument, setOwnershipDocument] = useState<File | null>(
        null,
    );
    const [serverErrors, setServerErrors] = useState<Record<string, string>>(
        {},
    );

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

    function yearInRange(configYear: string | null, year: string): boolean {
        const target = Number(year);

        if (!target || !configYear) {
            return false;
        }

        if (configYear.includes('-')) {
            const [start, end] = configYear.split('-').map(Number);

            return target >= start && target <= end;
        }

        return Number(configYear) === target;
    }

    // Cascading options derived from carTypes
    const availableBrands = useMemo(
        () => Array.from(new Set(carTypes.map((t) => t.brand))).sort(),
        [carTypes],
    );

    const availableModels = useMemo(
        () =>
            Array.from(
                new Set(
                    carTypes
                        .filter((t) => !data.brand || t.brand === data.brand)
                        .map((t) => t.model),
                ),
            ).sort(),
        [carTypes, data.brand],
    );

    const matchedConfig = useMemo(
        () =>
            carTypes.find(
                (t) =>
                    t.brand === data.brand &&
                    t.model === data.model &&
                    yearInRange(t.year, data.year),
            ),
        [carTypes, data.brand, data.model, data.year],
    );

    // Narrow option lists to the admin-created configurations that match the
    // selected brand/model (and the exact configuration when a year is set).
    const scopedTemplates = useMemo(() => {
        let templates = carTypes;

        if (data.brand) {
            templates = templates.filter((t) => t.brand === data.brand);
        }

        if (data.model) {
            templates = templates.filter((t) => t.model === data.model);
        }

        if (data.year && matchedConfig) {
            return [matchedConfig];
        }

        return templates;
    }, [carTypes, data.brand, data.model, data.year, matchedConfig]);

    const fuelOptions = useMemo(
        () => unionOptions(scopedTemplates.flatMap((t) => t.fuel_types)),
        [scopedTemplates],
    );

    const transmissionOptions = useMemo(
        () => unionOptions(scopedTemplates.flatMap((t) => t.transmissions)),
        [scopedTemplates],
    );

    const categoryOptions = useMemo(
        () => unionOptions(scopedTemplates.flatMap((t) => t.categories)),
        [scopedTemplates],
    );

    const engineOptions = useMemo(
        () =>
            unionOptions(scopedTemplates.flatMap((t) => t.engine_sizes ?? [])),
        [scopedTemplates],
    );

    const seatOptions = useMemo(
        () =>
            unionOptions(
                scopedTemplates.flatMap((t) => (t.seats ?? []).map(String)),
            ),
        [scopedTemplates],
    );

    const colorOptions = useMemo(
        () => unionOptions(scopedTemplates.flatMap((t) => t.colors ?? [])),
        [scopedTemplates],
    );

    const yearOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    carTypes
                        .filter(
                            (t) =>
                                (!data.brand || t.brand === data.brand) &&
                                (!data.model || t.model === data.model),
                        )
                        .map((t) => t.year)
                        .filter((y): y is string => y != null && y !== ''),
                ),
            ).sort(),
        [carTypes, data.brand, data.model],
    );

    function handleBrandChange(brand: string) {
        setData('brand', brand);
        setData('model', '');
        setData('year', '');
        setData('category', '');
        setData('color', '');
        setData('fuel_type', '');
        setData('transmission', '');
        setData('engine_size', '');
        setData('seats', '');
    }

    function handleModelChange(model: string) {
        setData('model', model);
        setData('year', '');
        setData('category', '');
        setData('color', '');
        setData('fuel_type', '');
        setData('transmission', '');
        setData('engine_size', '');
        setData('seats', '');
    }

    function handleYearChange(year: string) {
        setData('year', year);
        const config = carTypes.find(
            (t) =>
                t.brand === data.brand &&
                t.model === data.model &&
                yearInRange(t.year, year),
        );

        if (config) {
            setData('category', config.categories?.[0] ?? '');
            setData('color', config.colors?.[0] ?? '');
            setData('fuel_type', config.fuel_types?.[0] ?? '');
            setData('transmission', config.transmissions?.[0] ?? '');
            setData('engine_size', config.engine_sizes?.[0] ?? '');
            setData(
                'seats',
                config.seats?.[0] != null ? String(config.seats[0]) : '',
            );
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
        formData.append('car_type_id', matchedConfig ? String(matchedConfig.id) : '');
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

        router.post(store.url(), formData, {
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

                {rejectedRequest && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <p className="font-medium">
                            Your previous request for &quot;
                            {rejectedRequest.brand} {rejectedRequest.model} (
                            {rejectedRequest.year})&quot; was rejected.
                        </p>
                        <p className="mt-1">{rejectedRequest.admin_note}</p>
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
                                        <Label>Brand</Label>
                                        <SearchableCombobox
                                            value={data.brand}
                                            onValueChange={handleBrandChange}
                                            options={availableBrands}
                                            placeholder="Search or type brand"
                                            emptyText="No brands found"
                                            allowCustom
                                        />
                                        <InputError
                                            message={
                                                serverErrors.brand ??
                                                errors.brand
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Model</Label>
                                        <SearchableCombobox
                                            value={data.model}
                                            onValueChange={handleModelChange}
                                            options={availableModels}
                                            placeholder="Search or type model"
                                            emptyText="No models for this brand"
                                            allowCustom
                                            disabled={!data.brand}
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
                                        <SearchableCombobox
                                            value={data.year}
                                            onValueChange={handleYearChange}
                                            options={yearOptions}
                                            placeholder="Search or type year"
                                            emptyText="No years found"
                                            allowCustom
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
                                        <Label htmlFor="category">
                                            Category (Car Type)
                                        </Label>
                                        <SearchableCombobox
                                            value={data.category}
                                            onValueChange={(value) =>
                                                setData('category', value)
                                            }
                                            options={categoryOptions}
                                            placeholder="Select or type a category"
                                            emptyText="No categories found"
                                            allowCustom
                                        />
                                        <InputError
                                            message={
                                                serverErrors.category ??
                                                errors.category
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="color">Color</Label>
                                        <SearchableCombobox
                                            value={data.color}
                                            onValueChange={(value) =>
                                                setData('color', value)
                                            }
                                            options={colorOptions}
                                            placeholder="Select or type a color"
                                            emptyText="No colors found"
                                            allowCustom
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
                                        <SearchableCombobox
                                            value={data.fuel_type}
                                            onValueChange={(value) =>
                                                setData('fuel_type', value)
                                            }
                                            options={fuelOptions}
                                            placeholder="Select or type fuel type"
                                            emptyText="No fuel types found"
                                            allowCustom
                                        />
                                        <InputError
                                            message={
                                                serverErrors.fuel_type ??
                                                errors.fuel_type
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Transmission</Label>
                                        <SearchableCombobox
                                            value={data.transmission}
                                            onValueChange={(value) =>
                                                setData('transmission', value)
                                            }
                                            options={transmissionOptions}
                                            placeholder="Select or type transmission"
                                            emptyText="No transmissions found"
                                            allowCustom
                                        />
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
                                        <SearchableCombobox
                                            value={data.engine_size}
                                            onValueChange={(value) =>
                                                setData('engine_size', value)
                                            }
                                            options={engineOptions}
                                            placeholder="Select or type an engine size"
                                            emptyText="No engine sizes found"
                                            allowCustom
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
                                        <SearchableCombobox
                                            value={data.seats}
                                            onValueChange={(value) =>
                                                setData('seats', value)
                                            }
                                            options={seatOptions}
                                            placeholder="Select or type seat count"
                                            emptyText="No seat counts found"
                                            allowCustom
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
                                            Customers can only book the car
                                            during these date ranges. You can
                                            add or edit these later too.
                                        </p>
                                    </div>
                                    {data.available_periods.map(
                                        (period, index) => (
                                            <div
                                                key={index}
                                                className="grid gap-2 rounded-lg border p-4 md:grid-cols-2"
                                            >
                                                <div>
                                                    <Label>Start Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            period.start_date
                                                        }
                                                        onChange={(e) => {
                                                            const periods = [
                                                                ...data.available_periods,
                                                            ];
                                                            periods[index] = {
                                                                ...periods[
                                                                    index
                                                                ],
                                                                start_date:
                                                                    e.target
                                                                        .value,
                                                            };
                                                            setData(
                                                                'available_periods',
                                                                periods,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>End Date</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="date"
                                                            value={
                                                                period.end_date
                                                            }
                                                            onChange={(e) => {
                                                                const periods =
                                                                    [
                                                                        ...data.available_periods,
                                                                    ];
                                                                periods[index] =
                                                                    {
                                                                        ...periods[
                                                                            index
                                                                        ],
                                                                        end_date:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                setData(
                                                                    'available_periods',
                                                                    periods,
                                                                );
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
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) =>
                                                                            i !==
                                                                            index,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setData('available_periods', [
                                                ...data.available_periods,
                                                {
                                                    start_date: '',
                                                    end_date: '',
                                                },
                                            ])
                                        }
                                    >
                                        + Add Available Range
                                    </Button>
                                    <InputError
                                        message={
                                            serverErrors.available_periods ??
                                            errors.available_periods
                                        }
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
                                    {processing
                                        ? 'Saving...'
                                        : matchedConfig
                                          ? 'Save Vehicle'
                                          : 'Submit for Review'}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateVehicle.layout = {
    breadcrumbs: [
        { title: 'Vehicles', href: '/vehicles' },
        { title: 'Add Vehicle', href: '' },
    ],
};
