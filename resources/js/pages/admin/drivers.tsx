import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Ban, PlayCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCan } from '@/hooks/use-can';
import type { Auth } from '@/types';

interface DriverProfile {
    license_number: string;
    experience_years: number;
    availability: string;
    verification_status: string;
}

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
    driver_profile: DriverProfile | null;
    driver_assignments_count: number;
}

interface Paginated {
    data: Driver[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    drivers: Paginated;
    filters: { search?: string; status?: string; verification?: string };
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

const VERIFICATION_STYLES: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
};

export default function AdminDrivers({ drivers, filters }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;
    const can = useCan();

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [verification, setVerification] = useState(
        filters.verification ?? '',
    );

    function applyFilters() {
        router.get(
            '/admin/drivers',
            {
                search: search || undefined,
                status: status || undefined,
                verification: verification || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    function handleSuspend(id: number) {
        if (confirm('Suspend this driver?')) {
            router.post(`/admin/drivers/${id}/suspend`);
        }
    }

    function handleActivate(id: number) {
        router.post(`/admin/drivers/${id}/activate`);
    }

    return (
        <>
            <Head title="Drivers" />

            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Driver Management</h1>

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
                                    placeholder="Search by name or email..."
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
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            <select
                                value={verification}
                                onChange={(e) =>
                                    setVerification(e.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                            >
                                <option value="">All Verifications</option>
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
                        <CardTitle>All Drivers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {drivers.data.length === 0 ? (
                            <p className="text-muted-foreground">
                                No drivers found.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">
                                                Name
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Email
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Phone
                                            </th>
                                            <th className="pb-3 font-medium">
                                                License
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Experience
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Assignments
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Verification
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
                                        {drivers.data.map((d) => (
                                            <tr
                                                key={d.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 font-medium">
                                                    {d.name}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {d.email}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {d.phone}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {d.driver_profile
                                                        ?.license_number ?? '—'}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {d.driver_profile
                                                        ? `${d.driver_profile.experience_years} yrs`
                                                        : '—'}
                                                </td>
                                                <td className="py-3 text-center">
                                                    {d.driver_assignments_count}
                                                </td>
                                                <td className="py-3">
                                                    {d.driver_profile ? (
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VERIFICATION_STYLES[d.driver_profile.verification_status] ?? 'bg-gray-100 text-gray-800'}`}
                                                        >
                                                            {
                                                                d.driver_profile
                                                                    .verification_status
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            No profile
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${d.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                    >
                                                        {d.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            d.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={`/admin/users/${d.id}`}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {can('drivers.manage') &&
                                                            (d.status ===
                                                            'active' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleSuspend(
                                                                            d.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Ban className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleActivate(
                                                                            d.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <PlayCircle className="h-4 w-4" />
                                                                </Button>
                                                            ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {drivers.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {drivers.links.map((link) => (
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

AdminDrivers.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Drivers', href: '/admin/drivers' },
    ],
};
