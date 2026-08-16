import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Plus,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Auth } from '@/types';

interface CarImage {
    id: number;
    is_primary: boolean;
    image_path: string;
}
interface Owner {
    name: string;
}

interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    category: string;
    daily_price: string;
    approval_status: string;
    availability_status: string;
    owner: Owner;
    images: CarImage[];
}

interface Paginated {
    data: Vehicle[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    vehicles: Paginated;
    filters: { status?: string; search?: string };
    requests: ConfigurationRequest[];
}

interface ConfigurationRequest {
    id: number;
    brand: string;
    model: string;
    year: string;
    category: string | null;
    color: string | null;
    fuel_type: string | null;
    transmission: string | null;
    engine_size: string | null;
    seats: number | null;
    plate_number: string | null;
    daily_price: string | number | null;
    mileage: number | null;
    description: string | null;
    availability_status: string | null;
    note: string | null;
    photos: string[];
    document_path: string | null;
    requester: string;
    created_at: string | null;
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

const APPROVAL_STYLES: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-brand-soft text-brand',
};

export default function AdminVehicles({ vehicles, filters, requests }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [selectedRequest, setSelectedRequest] =
        useState<ConfigurationRequest | null>(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approving, setApproving] = useState(false);

    function applyFilters() {
        router.get(
            '/admin/vehicles',
            { search: search || undefined, status: status || undefined },
            { preserveState: true, replace: true },
        );
    }

    function handleApprove(id: number) {
        if (
            !confirm(
                "Create this configuration and approve the owner's vehicle?",
            )
        ) {
            return;
        }

        setApproving(true);
        router.post(
            `/car-types/configurations/requests/${id}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setSelectedRequest(null),
                onFinish: () => setApproving(false),
            },
        );
    }

    function openRejectDialog() {
        setRejectReason('');
        setRejectDialogOpen(true);
    }

    function handleReject() {
        if (!selectedRequest || rejectReason.trim() === '') {
            return;
        }

        router.post(
            `/car-types/configurations/requests/${selectedRequest.id}/reject`,
            { admin_note: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectDialogOpen(false);
                    setSelectedRequest(null);
                },
            },
        );
    }

    function handleDelete(id: number) {
        if (
            confirm(
                'Are you sure you want to delete this car? This action cannot be undone.',
            )
        ) {
            router.delete(`/admin/vehicles/${id}`, { preserveScroll: true });
        }
    }

    function handleToggleStatus(id: number, currentStatus: string) {
        const isActive = currentStatus !== 'inactive';
        const msg = isActive
            ? 'Deactivate this vehicle? It will be hidden from bookings.'
            : 'Reactivate this vehicle?';

        if (confirm(msg)) {
            router.post(
                `/admin/vehicles/${id}/toggle-status`,
                {},
                { preserveScroll: true },
            );
        }
    }

    return (
        <>
            <Head title="Cars" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cars</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage all cars in one page, including owner
                            listings and admin approvals.
                        </p>
                    </div>
                    <Link href="/vehicles/create">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Car
                        </Button>
                    </Link>
                </div>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                applyFilters();
                            }}
                            className="flex flex-col gap-3 md:flex-row md:items-end"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by brand, model, plate or owner..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <Button type="submit" variant="secondary">
                                Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Configuration Requests */}
                {requests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Configuration Requests
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                    {requests.length}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {requests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium">
                                                {req.brand} {req.model}{' '}
                                                <span className="font-normal text-muted-foreground">
                                                    ({req.year})
                                                </span>
                                            </p>
                                            <p className="mt-0.5 text-sm text-muted-foreground">
                                                {req.requester} ·{' '}
                                                {req.plate_number ?? 'no plate'}
                                                {req.category
                                                    ? ` · ${req.category}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3">
                                            {req.photos.length > 0 && (
                                                <img
                                                    src={`/storage/${req.photos[0]}`}
                                                    alt=""
                                                    className="h-10 w-14 rounded-md object-cover"
                                                />
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setSelectedRequest(req)
                                                }
                                            >
                                                <Eye className="mr-1 h-4 w-4" />
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Cars</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vehicles.data.length === 0 ? (
                            <p className="text-muted-foreground">
                                No cars found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">
                                                Cars
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Plate
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Owner
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Category
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Price/Day
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Availability
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Status
                                            </th>
                                            <th className="pb-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicles.data.map((v) => (
                                            <tr
                                                key={v.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 font-medium">
                                                    {v.brand} {v.model}{' '}
                                                    <span className="font-normal text-muted-foreground">
                                                        ({v.year})
                                                    </span>
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {v.plate_number}
                                                </td>
                                                <td className="py-3">
                                                    {v.owner.name}
                                                </td>
                                                <td className="py-3 text-muted-foreground capitalize">
                                                    {v.category}
                                                </td>
                                                <td className="py-3">
                                                    ETB {v.daily_price}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${v.availability_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        {v.availability_status}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${APPROVAL_STYLES[v.approval_status] ?? 'bg-gray-100 text-gray-800'}`}
                                                        >
                                                            {v.approval_status}
                                                        </span>
                                                        {v.approval_status ===
                                                            'pending' && (
                                                            <span
                                                                title="Awaiting admin approval"
                                                                className="inline-flex items-center text-brand"
                                                            >
                                                                <Clock className="h-3.5 w-3.5 animate-pulse" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/vehicles/${v.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                title="View vehicle"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <button
                                                            role="switch"
                                                            aria-checked={
                                                                v.availability_status !==
                                                                'inactive'
                                                            }
                                                            title={
                                                                v.availability_status ===
                                                                'inactive'
                                                                    ? 'Reactivate vehicle'
                                                                    : 'Deactivate vehicle'
                                                            }
                                                            className={cn(
                                                                'relative mx-1 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
                                                                v.availability_status !==
                                                                    'inactive'
                                                                    ? 'border-green-500 bg-green-50'
                                                                    : 'border-slate-300 bg-slate-100',
                                                            )}
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    v.id,
                                                                    v.availability_status,
                                                                )
                                                            }
                                                        >
                                                            <span
                                                                aria-hidden="true"
                                                                className={cn(
                                                                    'pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-sm transition duration-200 ease-in-out',
                                                                    v.availability_status !==
                                                                        'inactive'
                                                                        ? 'translate-x-5 bg-green-600'
                                                                        : 'translate-x-0.5 bg-slate-400',
                                                                )}
                                                            />
                                                        </button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            title="Delete Car"
                                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    v.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {vehicles.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {vehicles.links.map((link) => (
                                    <Button
                                        key={link.label}
                                        variant={
                                            link.active
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <a
                                            href={link.url ?? '#'}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={selectedRequest !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedRequest(null);
                    }
                }}
            >
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedRequest?.brand} {selectedRequest?.model}{' '}
                            <span className="font-normal text-muted-foreground">
                                ({selectedRequest?.year})
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                <span>
                                    Requested by {selectedRequest.requester}
                                </span>
                                {selectedRequest.created_at && (
                                    <span>{selectedRequest.created_at}</span>
                                )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    ['Category', selectedRequest.category],
                                    ['Color', selectedRequest.color],
                                    ['Fuel type', selectedRequest.fuel_type],
                                    [
                                        'Transmission',
                                        selectedRequest.transmission,
                                    ],
                                    [
                                        'Engine size',
                                        selectedRequest.engine_size,
                                    ],
                                    ['Seats', selectedRequest.seats],
                                    ['Plate', selectedRequest.plate_number],
                                    [
                                        'Daily price',
                                        selectedRequest.daily_price
                                            ? `ETB ${selectedRequest.daily_price}`
                                            : null,
                                    ],
                                    [
                                        'Mileage',
                                        selectedRequest.mileage != null
                                            ? `${selectedRequest.mileage} km`
                                            : null,
                                    ],
                                    [
                                        'Availability',
                                        selectedRequest.availability_status,
                                    ],
                                ].map(
                                    ([label, value]) =>
                                        value != null &&
                                        value !== '' && (
                                            <div
                                                key={String(label)}
                                                className="flex items-center justify-between gap-3 border-b pb-1.5"
                                            >
                                                <span className="text-sm text-muted-foreground">
                                                    {label}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {String(value)}
                                                </span>
                                            </div>
                                        ),
                                )}
                            </div>

                            {selectedRequest.description && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedRequest.description}
                                </p>
                            )}

                            {selectedRequest.note && (
                                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                    <span className="font-medium">
                                        Owner&apos;s note:{' '}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {selectedRequest.note}
                                    </span>
                                </div>
                            )}

                            {selectedRequest.photos.length > 0 && (
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Photos
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-4">
                                        {selectedRequest.photos.map(
                                            (path, index) => (
                                                <a
                                                    key={path}
                                                    href={`/storage/${path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <img
                                                        src={`/storage/${path}`}
                                                        alt={`Photo ${index + 1}`}
                                                        className="h-24 w-full rounded-md object-cover"
                                                    />
                                                </a>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRequest.document_path && (
                                <div>
                                    <p className="mb-2 text-sm font-medium">
                                        Ownership Document
                                    </p>
                                    <a
                                        href={`/storage/${selectedRequest.document_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                                    >
                                        <FileText className="h-4 w-4" />
                                        View document
                                    </a>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:justify-between">
                                <div className="flex gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={openRejectDialog}
                                    >
                                        <XCircle className="mr-1 h-4 w-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedRequest(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                                <Button
                                    onClick={() =>
                                        handleApprove(selectedRequest.id)
                                    }
                                    disabled={approving}
                                >
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                    {approving
                                        ? 'Creating...'
                                        : 'Create Configuration & Approve'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Configuration Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Provide a reason for rejecting this request. The
                            owner will see it.
                        </p>
                        <div className="space-y-1.5">
                            <Label htmlFor="reject_reason">
                                Reason (required)
                            </Label>
                            <Textarea
                                id="reject_reason"
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                placeholder="e.g. The year range is already covered by an existing configuration."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRejectDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={rejectReason.trim() === ''}
                            onClick={handleReject}
                        >
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminVehicles.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Cars', href: '/admin/vehicles' },
    ],
};
