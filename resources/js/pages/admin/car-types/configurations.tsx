import { Head, router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Inbox,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { MultiCombobox } from '@/components/multi-combobox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCan } from '@/hooks/use-can';

interface Configuration {
    id: number;
    brand: string;
    model: string;
    year: string;
    categories: string[];
    fuel_types: string[];
    transmissions: string[];
    engine_sizes: string[] | null;
    seats: number[] | null;
    colors: string[] | null;
    is_active: boolean;
    cars_count: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page: number | null;
    next_page: number | null;
}

interface RequestItem {
    id: number;
    brand: string;
    model: string;
    year: string;
    category: string | null;
    fuel_type: string | null;
    transmission: string | null;
    engine_size: string | null;
    seats: number | null;
    note: string | null;
    requested_by: string;
    created_at: string | null;
}

interface Props {
    items: Configuration[];
    pagination: Pagination;
    requests: RequestItem[];
}

const DEFAULT_FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
const DEFAULT_TRANSMISSIONS = ['Manual', 'Automatic', 'Semi'];
const DEFAULT_CATEGORIES = [
    'Sedan',
    'SUV',
    'Hatchback',
    'Pickup',
    'Van',
    'Truck',
    'Coupe',
    'Convertible',
];
const DEFAULT_ENGINE_SIZES = [
    '1.0L',
    '1.2L',
    '1.4L',
    '1.5L',
    '1.6L',
    '1.8L',
    '2.0L',
    '2.4L',
    '2.5L',
    '2.8L',
    '3.0L',
    '3.2L',
    '4.0L',
    '4.2L',
    '4.5L',
    '4.8L',
];
const DEFAULT_SEATS = ['2', '4', '5', '7', '8', '9', '12'];
const DEFAULT_COLORS = [
    'White',
    'Black',
    'Silver',
    'Grey',
    'Red',
    'Blue',
    'Green',
    'Yellow',
];

export default function ConfigurationsIndex({
    items,
    pagination,
    requests,
}: Props) {
    const can = useCan();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [showOpen, setShowOpen] = useState(false);
    const [detailItem, setDetailItem] = useState<Configuration | null>(null);
    const [editingItem, setEditingItem] = useState<Configuration | null>(null);
    const { data, setData, processing, errors, reset } = useForm({
        brand: '',
        model: '',
        year_start: '',
        year_end: '',
        categories: [] as string[],
        fuel_types: [] as string[],
        transmissions: [] as string[],
        engine_sizes: [] as string[],
        seats: [] as number[],
        colors: [] as string[],
        is_active: true,
    });

    function unionOptions(...lists: (string | null | undefined)[][]): string[] {
        return Array.from(
            new Set(
                lists.flatMap((list) =>
                    (list ?? []).filter(
                        (value): value is string =>
                            value != null && value !== '',
                    ),
                ),
            ),
        ).sort();
    }

    const categoryOptions = unionOptions(
        items.flatMap((item) => item.categories),
        DEFAULT_CATEGORIES,
    );

    const fuelOptions = unionOptions(
        items.flatMap((item) => item.fuel_types),
        DEFAULT_FUEL_TYPES,
    );

    const transmissionOptions = unionOptions(
        items.flatMap((item) => item.transmissions),
        DEFAULT_TRANSMISSIONS,
    );

    const engineOptions = unionOptions(
        items.flatMap((item) => item.engine_sizes ?? []),
        DEFAULT_ENGINE_SIZES,
    );

    const seatOptions = unionOptions(
        items.flatMap((item) => (item.seats ?? []).map(String)),
        DEFAULT_SEATS,
    );

    const colorOptions = unionOptions(
        items.flatMap((item) => item.colors ?? []),
        DEFAULT_COLORS,
    );

    function openCreate() {
        setEditingItem(null);
        reset();
        setDialogOpen(true);
    }

    function openShow(item: Configuration) {
        setDetailItem(item);
        setShowOpen(true);
    }

    function openEdit(item: Configuration) {
        const [start, end] = item.year.includes('-')
            ? item.year.split('-')
            : [item.year, ''];

        setEditingItem(item);
        setData({
            brand: item.brand,
            model: item.model,
            year_start: start,
            year_end: end,
            categories: [...(item.categories ?? [])],
            fuel_types: [...(item.fuel_types ?? [])],
            transmissions: [...(item.transmissions ?? [])],
            engine_sizes: [...(item.engine_sizes ?? [])],
            seats: [...(item.seats ?? [])],
            colors: [...(item.colors ?? [])],
            is_active: item.is_active,
        });
        setDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            brand: data.brand,
            model: data.model,
            year_start: data.year_start,
            year_end: data.year_end || null,
            categories: data.categories,
            fuel_types: data.fuel_types,
            transmissions: data.transmissions,
            engine_sizes: data.engine_sizes,
            seats: data.seats,
            colors: data.colors,
            is_active: data.is_active,
        };

        if (editingItem) {
            router.put(
                `/admin/car-types/configurations/${editingItem.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDialogOpen(false);
                        setEditingItem(null);
                        reset();
                    },
                },
            );
        } else {
            router.post('/admin/car-types/configurations', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
            });
        }
    }

    function handleToggle(item: Configuration) {
        router.patch(
            `/admin/car-types/configurations/${item.id}/toggle`,
            {},
            {
                preserveScroll: true,
                only: ['items', 'pagination'],
            },
        );
    }

    function handleDelete(item: Configuration) {
        if (
            confirm(
                `Are you sure you want to delete "${item.brand} ${item.model} (${item.year})"?`,
            )
        ) {
            router.delete(`/admin/car-types/configurations/${item.id}`, {
                only: ['items', 'pagination'],
            });
        }
    }

    function handleApprove(item: RequestItem) {
        if (
            confirm(
                `Approve request and add "${item.brand} ${item.model} (${item.year})" as an active configuration?`,
            )
        ) {
            router.post(
                `/admin/car-types/configurations/requests/${item.id}/approve`,
                {},
                {
                    preserveScroll: true,
                    only: ['items', 'pagination', 'requests'],
                },
            );
        }
    }

    function handleReject(item: RequestItem) {
        const note = prompt(
            `Reject request for "${item.brand} ${item.model} (${item.year})"?\n\nRejection note (optional):`,
        );

        if (note === null) {
            return;
        }

        router.post(
            `/admin/car-types/configurations/requests/${item.id}/reject`,
            { admin_note: note },
            { preserveScroll: true, only: ['items', 'pagination', 'requests'] },
        );
    }

    function goToPage(page: number | null) {
        if (!page) {
            return;
        }

        router.get(`/admin/car-types/configurations?page=${page}`, undefined, {
            preserveScroll: true,
            only: ['items', 'pagination'],
        });
    }

    return (
        <>
            <Head title="Vehicle Configurations" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Vehicle Configurations
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Hierarchical vehicle configurations (brand + model +
                            year + category + specs).
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {can('car-types.manage') && (
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Configuration
                            </Button>
                        )}
                    </div>
                </div>

                {can('car-types.manage') && requests.length > 0 && (
                    <Card>
                        <CardContent className="space-y-3 p-5">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Pending Configuration Requests
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Owners requested these configurations.
                                    Approving adds them to the available
                                    templates.
                                </p>
                            </div>
                            <div className="divide-y">
                                {requests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium">
                                                {request.brand} {request.model}{' '}
                                                ({request.year})
                                            </p>
                                            <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                                                <span>
                                                    {request.requested_by}
                                                </span>
                                                {request.created_at && (
                                                    <span>
                                                        {request.created_at}
                                                    </span>
                                                )}
                                                <span>
                                                    {request.category ??
                                                        'Category unspecified'}
                                                </span>
                                                <span>
                                                    {request.fuel_type ??
                                                        'Fuel unspecified'}{' '}
                                                    ·{' '}
                                                    {request.transmission ??
                                                        'Transmission unspecified'}
                                                </span>
                                            </p>
                                            {request.note && (
                                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                                    &quot;{request.note}&quot;
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    handleReject(request)
                                                }
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleApprove(request)
                                                }
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="p-10 text-center">
                            <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="mt-3 font-medium">
                                No configurations created yet.
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add your first vehicle configuration to start.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {items.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="space-y-3 p-5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-lg font-semibold">
                                                    {item.brand} {item.model} (
                                                    {item.year})
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Category:{' '}
                                                    {item.categories.join(
                                                        ' / ',
                                                    )}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">
                                                {item.cars_count}{' '}
                                                {item.cars_count === 1
                                                    ? 'car'
                                                    : 'cars'}
                                            </Badge>
                                        </div>
                                        {can('car-types.manage') && (
                                            <div className="flex items-center justify-between gap-2 border-t pt-3">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={item.is_active}
                                                        onCheckedChange={() =>
                                                            handleToggle(item)
                                                        }
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            openShow(item)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            openEdit(item)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            handleDelete(item)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {pagination.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.prev_page}
                                    onClick={() =>
                                        goToPage(pagination.prev_page)
                                    }
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {pagination.current_page} of{' '}
                                    {pagination.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!pagination.next_page}
                                    onClick={() =>
                                        goToPage(pagination.next_page)
                                    }
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog
                open={showOpen}
                onOpenChange={(v) => {
                    setShowOpen(v);

                    if (!v) {
                        setDetailItem(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Configuration Details</DialogTitle>
                    </DialogHeader>
                    {detailItem && (
                        <dl className="space-y-3">
                            {[
                                ['Brand', detailItem.brand],
                                ['Model', detailItem.model],
                                ['Year', detailItem.year],
                                [
                                    'Categories',
                                    detailItem.categories.join(' / '),
                                ],
                                [
                                    'Fuel Types',
                                    detailItem.fuel_types.join(' / '),
                                ],
                                [
                                    'Transmissions',
                                    detailItem.transmissions.join(' / '),
                                ],
                                [
                                    'Engine Sizes',
                                    detailItem.engine_sizes?.length
                                        ? detailItem.engine_sizes.join(' / ')
                                        : '—',
                                ],
                                [
                                    'Seats',
                                    detailItem.seats?.length
                                        ? detailItem.seats.join(' / ')
                                        : '—',
                                ],
                                [
                                    'Colors',
                                    detailItem.colors?.length
                                        ? detailItem.colors.join(' / ')
                                        : '—',
                                ],
                                [
                                    'Status',
                                    detailItem.is_active
                                        ? 'Active'
                                        : 'Inactive',
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <dt className="text-sm text-muted-foreground">
                                        {label}
                                    </dt>
                                    <dd className="text-right text-sm font-medium">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={dialogOpen}
                onOpenChange={(v) => {
                    setDialogOpen(v);

                    if (!v) {
                        setEditingItem(null);
                        reset();
                    }
                }}
            >
                <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem
                                ? 'Edit Configuration'
                                : 'Add Configuration'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="brand">Brand</Label>
                                <Input
                                    id="brand"
                                    value={data.brand}
                                    onChange={(e) =>
                                        setData('brand', e.target.value)
                                    }
                                    placeholder="e.g. Toyota"
                                />
                                {errors.brand && (
                                    <InputError message={errors.brand} />
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={data.model}
                                    onChange={(e) =>
                                        setData('model', e.target.value)
                                    }
                                    placeholder="e.g. Corolla"
                                />
                                {errors.model && (
                                    <InputError message={errors.model} />
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="year_start">Start Year</Label>
                                <Input
                                    id="year_start"
                                    inputMode="numeric"
                                    value={data.year_start}
                                    onChange={(e) =>
                                        setData('year_start', e.target.value)
                                    }
                                    placeholder="e.g. 2002"
                                />
                                {errors.year_start && (
                                    <InputError message={errors.year_start} />
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="year_end">End Year</Label>
                                <Input
                                    id="year_end"
                                    inputMode="numeric"
                                    value={data.year_end}
                                    onChange={(e) =>
                                        setData('year_end', e.target.value)
                                    }
                                    placeholder="e.g. 2005 (optional)"
                                />
                                {errors.year_end && (
                                    <InputError message={errors.year_end} />
                                )}
                            </div>
                        </div>
                        <p className="-mt-2 text-xs text-muted-foreground">
                            Leave the end year empty for a single year. Owners
                            will be able to pick any year within this range.
                        </p>

                        <div className="space-y-1.5">
                            <Label htmlFor="category">
                                Categories (Car Types)
                            </Label>
                            <MultiCombobox
                                values={data.categories}
                                onValuesChange={(values) =>
                                    setData('categories', values)
                                }
                                options={categoryOptions}
                                placeholder="Select one or more, or type a custom one"
                                createLabel="Add category"
                            />
                            {errors.categories && (
                                <InputError message={errors.categories} />
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="fuel_type">Fuel Types</Label>
                                <MultiCombobox
                                    values={data.fuel_types}
                                    onValuesChange={(values) =>
                                        setData('fuel_types', values)
                                    }
                                    options={fuelOptions}
                                    placeholder="Select one or more fuel types"
                                    createLabel="Add fuel type"
                                />
                                {errors.fuel_types && (
                                    <InputError message={errors.fuel_types} />
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="transmission">
                                    Transmissions
                                </Label>
                                <MultiCombobox
                                    values={data.transmissions}
                                    onValuesChange={(values) =>
                                        setData('transmissions', values)
                                    }
                                    options={transmissionOptions}
                                    placeholder="Select one or more transmissions"
                                    createLabel="Add transmission"
                                />
                                {errors.transmissions && (
                                    <InputError
                                        message={errors.transmissions}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="engine_size">
                                    Engine Sizes
                                </Label>
                                <MultiCombobox
                                    values={data.engine_sizes}
                                    onValuesChange={(values) =>
                                        setData('engine_sizes', values)
                                    }
                                    options={engineOptions}
                                    placeholder="Select one or more engine sizes"
                                    createLabel="Add engine size"
                                />
                                {errors.engine_sizes && (
                                    <InputError message={errors.engine_sizes} />
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="seats">Seats</Label>
                                <MultiCombobox
                                    values={data.seats.map(String)}
                                    onValuesChange={(values) =>
                                        setData(
                                            'seats',
                                            values.map((value) =>
                                                Number(value),
                                            ),
                                        )
                                    }
                                    options={seatOptions}
                                    placeholder="Select one or more seat counts"
                                    createLabel="Add seats"
                                />
                                {errors.seats && (
                                    <InputError message={errors.seats} />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="colors">Colors</Label>
                            <MultiCombobox
                                values={data.colors}
                                onValuesChange={(values) =>
                                    setData('colors', values)
                                }
                                options={colorOptions}
                                placeholder="Select one or more colors, or type a custom one"
                                createLabel="Add color"
                            />
                            {errors.colors && (
                                <InputError message={errors.colors} />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                            <Label
                                htmlFor="is_active"
                                className="cursor-pointer"
                            >
                                Active
                            </Label>
                        </div>
                        {errors.is_active && (
                            <InputError message={errors.is_active} />
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setDialogOpen(false);
                                    setEditingItem(null);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving…'
                                    : editingItem
                                      ? 'Update'
                                      : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

ConfigurationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Car Types', href: '/admin/car-types/configurations' },
        { title: 'Configurations', href: '/admin/car-types/configurations' },
    ],
};
