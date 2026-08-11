import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, Eye, Plus, Power, PowerOff, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCan } from '@/hooks/use-can';
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
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

const APPROVAL_STYLES: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
};

export default function AdminVehicles({ vehicles, filters }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;
    const can = useCan();

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilters() {
        router.get(
            '/admin/vehicles',
            { search: search || undefined, status: status || undefined },
            { preserveState: true, replace: true },
        );
    }

    function handleApprove(id: number) {
        router.post(
            `/admin/vehicles/${id}/approve`,
            {},
            { preserveScroll: true },
        );
    }

    function handleReject(id: number) {
        const reason = prompt(
            'Please enter the reason for vehicle rejection:',
        );

        if (reason && reason.trim() !== '') {
            router.post(
                `/admin/vehicles/${id}/reject`,
                { rejection_reason: reason },
                { preserveScroll: true },
            );
        }
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
            router.delete(`/admin/vehicles/${id}`, { preserveScroll: true });
        }
    }

    function handleToggleStatus(id: number, currentStatus: string) {
        const isActive = currentStatus !== 'inactive';
        const msg = isActive
            ? 'Deactivate this vehicle? It will be hidden from bookings.'
            : 'Reactivate this vehicle?';
        if (confirm(msg)) {
            router.post(`/admin/vehicles/${id}/toggle-status`, {}, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Vehicles" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Vehicles</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage all vehicles in one page, including owner
                            listings and admin approvals.
                        </p>
                    </div>
                    <Link href="/vehicles/create">
                        <Button className="bg-blue-900 hover:bg-blue-950">
                            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
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

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Vehicles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {vehicles.data.length === 0 ? (
                            <p className="text-muted-foreground">
                                No vehicles found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">
                                                Vehicle
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
                                                        {v.approval_status === 'pending' && (
                                                            <span
                                                                title="Awaiting admin approval"
                                                                className="inline-flex items-center text-yellow-500"
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
                                                             aria-checked={v.availability_status !== 'inactive'}
                                                             title={v.availability_status === 'inactive' ? 'Reactivate vehicle' : 'Deactivate vehicle'}
                                                             className={cn(
                                                                 "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mx-1",
                                                                 v.availability_status !== 'inactive' ? "border-green-500 bg-green-50" : "border-slate-300 bg-slate-100"
                                                             )}
                                                             onClick={() => handleToggleStatus(v.id, v.availability_status)}
                                                         >
                                                             <span
                                                                 aria-hidden="true"
                                                                 className={cn(
                                                                     "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-sm transition duration-200 ease-in-out",
                                                                     v.availability_status !== 'inactive' ? "translate-x-5 bg-green-600" : "translate-x-0.5 bg-slate-400"
                                                                 )}
                                                             />
                                                         </button>
                                                         <Button
                                                             size="sm"
                                                             variant="outline"
                                                             title="Delete vehicle"
                                                             className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                             onClick={() => handleDelete(v.id)}
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
        </>
    );
}

AdminVehicles.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Vehicles', href: '/admin/vehicles' },
    ],
};
