import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlareCard } from '@/components/ui/glare-card';
import { Input } from '@/components/ui/input';
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
        if (confirm('Reject this vehicle?')) {
            router.post(
                `/admin/vehicles/${id}/reject`,
                {},
                { preserveScroll: true },
            );
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
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${APPROVAL_STYLES[v.approval_status] ?? 'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        {v.approval_status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/vehicles/${v.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {v.approval_status ===
                                                            'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            v.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            v.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
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
