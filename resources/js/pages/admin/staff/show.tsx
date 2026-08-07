import { Head, Link, router, usePage } from '@inertiajs/react';
import { Trash2, Ban, PlayCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Auth } from '@/types';

interface StaffRole {
    id: number;
    name: string;
    permissions: string[];
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
    staff_role: StaffRole | null;
    branch: { id: number; name: string; city: string } | null;
}

interface Props {
    staff: StaffMember;
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

function formatPermission(perm: string): string {
    return perm
        .replace(/[._]/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'suspended':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

export default function ShowStaff({ staff }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;
    const isFullAdmin =
        props.auth.user.role === 'admin' &&
        props.auth.user.staff_role_id === null;

    function handleSuspend(): void {
        if (confirm('Suspend this staff member?')) {
            router.post(`/admin/staff/${staff.id}/suspend`);
        }
    }

    function handleActivate(): void {
        router.post(`/admin/staff/${staff.id}/activate`);
    }

    function handleDelete(): void {
        if (confirm(`Are you sure you want to delete "${staff.name}"?`)) {
            router.delete(`/admin/staff/${staff.id}`);
        }
    }

    return (
        <>
            <Head title={`${staff.name} - Staff Details`} />

            <div className="max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/staff"
                    className="text-sm text-muted-foreground hover:underline"
                >
                    &larr; Back to Staff
                </Link>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl">
                            Staff Details
                        </CardTitle>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(staff.status)}`}
                        >
                            {staff.status.charAt(0).toUpperCase() +
                                staff.status.slice(1)}
                        </span>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Name
                                </p>
                                <p className="font-medium">{staff.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p className="font-medium">{staff.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Phone
                                </p>
                                <p className="font-medium">{staff.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Joined
                                </p>
                                <p className="font-medium">
                                    {new Date(
                                        staff.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Branch
                                </p>
                                <p className="font-medium">
                                    {staff.branch?.name ?? 'N/A'}
                                </p>
                            </div>
                        </div>

                        {isFullAdmin && (
                            <div className="flex gap-3 border-t pt-4">
                                {staff.status === 'active' ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleSuspend}
                                    >
                                        <Ban className="mr-1.5 h-4 w-4" />
                                        Suspend
                                    </Button>
                                ) : (
                                    <Button size="sm" onClick={handleActivate}>
                                        <PlayCircle className="mr-1.5 h-4 w-4" />
                                        Activate
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {staff.staff_role && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Assigned Role: {staff.staff_role.name}
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-wrap gap-1.5">
                                {staff.staff_role.permissions.map((perm) => (
                                    <span
                                        key={perm}
                                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium"
                                    >
                                        {formatPermission(perm)}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ShowStaff.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Staff', href: '/admin/staff' },
        { title: 'Details', href: '#' },
    ],
};
