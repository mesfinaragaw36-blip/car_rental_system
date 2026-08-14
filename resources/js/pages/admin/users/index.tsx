import { Head, Link, router } from '@inertiajs/react';
import {
    Search,
    UserRound,
    ShieldCheck,
    Clock3,
    Users,
    MoreHorizontal,
    Eye,
    Pencil,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface OwnerProfile {
    id: number;
    user_id: number;
    business_name: string | null;
    verification_status: string;
    verified_at: string | null;
}

interface DriverProfile {
    id: number;
    user_id: number;
    license_number: string;
    verification_status: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    staff_role_id: number | null;
    status: string;
    address: string | null;
    created_at: string;
    updated_at: string;
    owner_profile: OwnerProfile | null;
    driver_profile: DriverProfile | null;
    customer_identity_status?: string | null;
    has_customer_identity?: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: UserData[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

interface Stats {
    total: number;
    owners: number;
    pending: number;
    approved: number;
}

interface Filters {
    search?: string;
    role?: string;
    status?: string;
}

interface Props {
    users: PaginatedUsers;
    filters: Filters;
    stats: Stats;
}
function getVerificationStatus(user: UserData): string | null {
    if (user.role === 'owner') {
        return user.owner_profile?.verification_status ?? null;
    }

    if (user.role === 'driver') {
        return user.driver_profile?.verification_status ?? null;
    }

    return null;
}

function getVerificationLabel(user: UserData): string {
    const status = getVerificationStatus(user);

    if (!status) {
        return 'Not required';
    }

    switch (status) {
        case 'approved':
            return 'Approved';
        case 'pending':
            return 'Pending';
        case 'rejected':
            return 'Rejected';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

function getVerificationClasses(user: UserData): string {
    const status = getVerificationStatus(user);

    switch (status) {
        case 'approved':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'pending':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        case 'rejected':
            return 'border-red-200 bg-red-50 text-red-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-500';
    }
}

function getVerificationIcon(user: UserData) {
    const status = getVerificationStatus(user);

    switch (status) {
        case 'approved':
            return <ShieldCheck className="h-3.5 w-3.5" />;
        case 'pending':
            return <Clock3 className="h-3.5 w-3.5" />;
        default:
            return null;
    }
}

function getRoleClasses(role: string): string {
    switch (role) {
        case 'owner':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'driver':
            return 'border-orange-200 bg-orange-50 text-orange-700';
        case 'admin':
            return 'border-purple-200 bg-purple-50 text-purple-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

function getRoleLabel(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

function getAccountClasses(status: string): string {
    switch (status) {
        case 'active':
            return 'bg-emerald-500';
        case 'suspended':
            return 'bg-red-500';
        case 'inactive':
            return 'bg-slate-400';
        default:
            return 'bg-slate-400';
    }
}

function getAccountLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function identityBadgeClass(status: string): string {
    switch (status) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
}

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export default function UsersIndex({ users, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? 'all');
    const [status, setStatus] = useState(filters.status ?? 'all');

    useEffect(() => {
        setSearch(filters.search ?? '');
        setRole(filters.role ?? 'all');
        setStatus(filters.status ?? 'all');
    }, [filters.search, filters.role, filters.status]);

    function applyFilters(
        nextSearch = search,
        nextRole = role,
        nextStatus = status,
    ) {
        router.get(
            '/admin/users',
            {
                search: nextSearch || undefined,
                role: nextRole !== 'all' ? nextRole : undefined,
                status: nextStatus !== 'all' ? nextStatus : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function clearFilters() {
        setSearch('');
        setRole('all');
        setStatus('all');

        router.get(
            '/admin/users',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    const hasFilters =
        search.trim() !== '' || role !== 'all' || status !== 'all';

   return (
    <>
        <Head title="Users" />

        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 p-8 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-100">
                            Administration
                        </p>

                        <h1 className="mt-1 text-3xl font-bold">
                            Users
                        </h1>

                        <p className="mt-2 max-w-xl text-sm text-blue-100">
                            Manage user accounts, verification status, and
                            access.
                        </p>
                    </div>

                    <div className="hidden rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:block">
                        <Users className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">
                                Total Users
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {stats.total}
                            </p>
                        </div>

                        <div className="rounded-xl bg-gradient-to-br from-blue-900 to-sky-600 p-3 text-white shadow-sm">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Owners
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {stats.owners}
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <UserRound className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Pending Verification
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {stats.pending}
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                                <Clock3 className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Approved
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {stats.approved}
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users table */}
                <Card className="overflow-hidden border-0 shadow-sm">
                    <CardHeader className="border-b bg-muted/20 px-6 py-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <CardTitle className="text-lg">
                                    All Users
                                </CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Review user accounts and verification
                                    status.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <div className="relative min-w-[240px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                applyFilters();
                                            }
                                        }}
                                        placeholder="Search users..."
                                        className="pl-9"
                                    />
                                </div>

                                <Select
                                    value={role}
                                    onValueChange={(value) => {
                                        setRole(value);
                                        applyFilters(search, value, status);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[140px]">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            All roles
                                        </SelectItem>
                                        <SelectItem value="customer">
                                            Customer
                                        </SelectItem>
                                        <SelectItem value="owner">
                                            Owner
                                        </SelectItem>
                                        <SelectItem value="driver">
                                            Driver
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        setStatus(value);
                                        applyFilters(search, role, value);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Account" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            All accounts
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
                                        <SelectItem value="suspended">
                                            Suspended
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {hasFilters && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearFilters}
                                        title="Clear filters"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="border-b bg-muted/10">
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            User
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Phone
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Role
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Verification
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            ID Verification
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Account
                                        </th>

                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                                    <div className="rounded-full bg-muted p-4">
                                                        <Users className="h-6 w-6 text-muted-foreground" />
                                                    </div>

                                                    <h3 className="mt-4 font-medium">
                                                        No users found
                                                    </h3>

                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Try changing your search
                                                        or filters.
                                                    </p>

                                                    {hasFilters && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-4"
                                                            onClick={
                                                                clearFilters
                                                            }
                                                        >
                                                            Clear filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                {/* User */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                                                            {initials(
                                                                user.name,
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                {user.name}
                                                            </p>

                                                            <p className="truncate text-sm text-muted-foreground">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Phone */}
                                                <td className="px-4 py-4 text-sm text-muted-foreground">
                                                    {user.phone || '—'}
                                                </td>

                                                {/* Role */}
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getRoleClasses(
                                                            user.role,
                                                        )}`}
                                                    >
                                                        {getRoleLabel(
                                                            user.role,
                                                        )}
                                                    </span>
                                                </td>

                                                {/* Verification */}
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getVerificationClasses(
                                                            user,
                                                        )}`}
                                                    >
                                                        {getVerificationIcon(
                                                            user,
                                                        )}

                                                        {getVerificationLabel(
                                                            user,
                                                        )}
                                                    </span>
                                                </td>

                                                {/* ID Verification */}
                                                <td className="px-4 py-4">
                                                    {user.has_customer_identity ? (
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${identityBadgeClass(user.customer_identity_status ?? 'pending')}`}
                                                        >
                                                            {(user.customer_identity_status ??
                                                                'pending') ===
                                                            'pending' && (
                                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                                            )}
                                                            {user.role ===
                                                            'customer'
                                                                ? 'ID '
                                                                : 'Verif. '}
                                                            {(
                                                                user.customer_identity_status ??
                                                                'pending'
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                (
                                                                    user.customer_identity_status ??
                                                                    'pending'
                                                                ).slice(1)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Not submitted
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Account */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`h-2 w-2 rounded-full ${getAccountClasses(
                                                                user.status,
                                                            )}`}
                                                        />

                                                        <span className="text-sm font-medium">
                                                            {getAccountLabel(
                                                                user.status,
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title="View user"
                                                        >
                                                            <Link
                                                                href={`/admin/users/${user.id}`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>

                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title="Edit user"
                                                        >
                                                            <Link
                                                                href={`/admin/users/${user.id}/edit`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title="More actions"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing{' '}
                                    <span className="font-medium text-foreground">
                                        {users.from ?? 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-foreground">
                                        {users.to ?? 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-foreground">
                                        {users.total}
                                    </span>{' '}
                                    users
                                </p>

                                <div className="flex items-center gap-1">
                                    {users.links.map((link, index) => {
                                        if (
                                            link.label.includes('Previous')
                                        ) {
                                            return (
                                                <Button
                                                    key={`prev-${index}`}
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={!link.url}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(
                                                                link.url,
                                                                {},
                                                                {
                                                                    preserveState:
                                                                        true,
                                                                    preserveScroll:
                                                                        true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            );
                                        }

                                        if (link.label.includes('Next')) {
                                            return (
                                                <Button
                                                    key={`next-${index}`}
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={!link.url}
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(
                                                                link.url,
                                                                {},
                                                                {
                                                                    preserveState:
                                                                        true,
                                                                    preserveScroll:
                                                                        true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            );
                                        }

                                        return (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className="h-8 min-w-8"
                                                disabled={!link.url}
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.get(
                                                            link.url,
                                                            {},
                                                            {
                                                                preserveState:
                                                                    true,
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        );
                                                    }
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
