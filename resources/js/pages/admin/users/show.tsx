import React from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    User,
    Car,
    CheckCircle,
    XCircle,
    Trash2,
    Ban,
    PlayCircle,
    Edit,
    IdCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useCan } from '@/hooks/use-can';
import type { Auth } from '@/types';

interface OwnerProfile {
    id: number;
    business_name: string | null;
    national_id: string | null;
    national_id_front_file_path: string | null;
    national_id_back_file_path: string | null;
    trade_license_number: string | null;
    verification_status: string;
    verified_at: string | null;
}

interface DriverProfile {
    id: number;
    license_number: string;
    license_type: string;
    experience_years: number;
    location: string;
    availability: string;
    verification_status: string;
    license_file_path?: string | null;
}

interface CustomerIdentity {
    id: number;
    national_id_number: string;
    verification_status: string;
    verified_at: string | null;
    verified_by_name?: string | null;
    national_id_front_path: string | null;
    national_id_back_path: string | null;
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
    customer_identity: CustomerIdentity | null;
    reviews?: Array<{
        id: number;
        reviewer: {
            id: number;
            name: string;
        };
        rating: number;
        review_text: string | null;
        created_at: string;
    }>;
}

interface Props {
    user: UserData;
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

function roleBadgeClass(role: string): string {
    switch (role) {
        case 'owner':
            return 'bg-accent text-primary';
        case 'driver':
        return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
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

function verificationBadgeClass(status: string): string {
    switch (status) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-brand-soft text-brand';
    }
}
function DocumentLink({ path, label }: { path: string; label: string }) {
    return React.createElement(
        'a',
        {
            href: `/storage/${path}`,
            target: '_blank',
            rel: 'noreferrer',
            className: 'text-primary underline',
        },
        label,
    );
}
export default function ShowUser({ user }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;
    const can = useCan();

    function handleSuspend(): void {
        if (confirm('Are you sure you want to suspend this user?')) {
            router.post(`/admin/users/${user.id}/suspend`);
        }
    }

    function handleActivate(): void {
        router.post(`/admin/users/${user.id}/activate`);
    }

    function handleDelete(): void {
        if (
            confirm(
                'Are you sure you want to delete this user? This action cannot be undone.',
            )
        ) {
            router.delete(`/admin/users/${user.id}`);
        }
    }

    function handleVerifyOwner(): void {
        router.post(`/admin/users/${user.id}/verify-owner`);
    }

    function handleRejectOwner(): void {
        if (confirm('Are you sure you want to reject this owner profile?')) {
            router.post(`/admin/users/${user.id}/reject-owner`);
        }
    }

    function handleVerifyCustomerIdentity(): void {
        router.post(`/admin/users/${user.id}/verify-customer-identity`);
    }

    function handleRejectCustomerIdentity(): void {
        if (
            confirm(
                'Are you sure you want to reject this customer identity?',
            )
        ) {
            router.post(`/admin/users/${user.id}/reject-customer-identity`);
        }
    }

    function handleVerifyDriver(): void {
        router.post(`/admin/users/${user.id}/verify-driver`);
    }

    function handleRejectDriver(): void {
        if (confirm('Are you sure you want to reject this driver profile?')) {
            router.post(`/admin/users/${user.id}/reject-driver`);
        }
    }

    return (
        <>
            <Head title={`${user.name} - User Details`} />

            <div className="max-w-3xl space-y-6 p-6">
                <Link
                    href="/admin/users"
                    className="text-sm text-muted-foreground hover:underline"
                >
                    &larr; Back to Users
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

                {/* User Info Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl">
                            User Details
                        </CardTitle>

                        <div className="flex items-center gap-2">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClass(
                                    user.role,
                                )}`}
                            >
                                {user.role.charAt(0).toUpperCase() +
                                    user.role.slice(1)}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                                    user.status,
                                )}`}
                            >
                                {user.status.charAt(0).toUpperCase() +
                                    user.status.slice(1)}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Name
                                </p>
                                <p className="font-medium">{user.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Email
                                </p>
                                <p className="font-medium">{user.email}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Phone
                                </p>
                                <p className="font-medium">{user.phone}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Address
                                </p>
                                <p className="font-medium">
                                    {user.address ?? 'Not provided'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Joined
                                </p>
                                <p className="font-medium">
                                    {new Date(
                                        user.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t pt-4">
                            <Link href={`/admin/users/${user.id}/edit`}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!can('users.edit')}
                                >
                                    <Edit className="mr-1.5 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>

                            {user.status === 'active' ? (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleSuspend}
                                    disabled={!can('users.manage')}
                                >
                                    <Ban className="mr-1.5 h-4 w-4" />
                                    Suspend
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleActivate}
                                    disabled={!can('users.manage')}
                                >
                                    <PlayCircle className="mr-1.5 h-4 w-4" />
                                    Activate
                                </Button>
                            )}

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={!can('users.delete')}
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Owner Profile */}
                {user.role === 'owner' && user.owner_profile && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Owner Profile
                            </CardTitle>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${verificationBadgeClass(
                                    user.owner_profile.verification_status,
                                )}`}
                            >
                                {user.owner_profile.verification_status
                                    .charAt(0)
                                    .toUpperCase() +
                                    user.owner_profile.verification_status.slice(
                                        1,
                                    )}
                            </span>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Business Name
                                    </p>
                                    <p className="font-medium">
                                        {user.owner_profile.business_name ??
                                            'Not provided'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        National ID
                                    </p>
                                    <p className="font-medium">
                                        {user.owner_profile.national_id ??
                                            'Not provided'}
                                    </p>
                                </div>

                                {(
                                    user.owner_profile
                                        .national_id_front_file_path ||
                                    user.owner_profile
                                        .national_id_back_file_path
                                ) && (
                                    <div className="md:col-span-2 flex gap-4">
                                        {user.owner_profile
                                            .national_id_front_file_path && (
                                            <a
                                                href={`/storage/${user.owner_profile.national_id_front_file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary underline"
                                            >
                                                View front of ID
                                            </a>
                                        )}

                                        {user.owner_profile
                                            .national_id_back_file_path && (
                                            <a
                                                href={`/storage/${user.owner_profile.national_id_back_file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-primary underline"
                                            >
                                                View back of ID
                                            </a>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Trade License
                                    </p>
                                    <p className="font-medium">
                                        {user.owner_profile
                                            .trade_license_number ??
                                            'Not provided'}
                                    </p>
                                </div>

                                {user.owner_profile.verified_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Verified At
                                        </p>
                                        <p className="font-medium">
                                            {new Date(
                                                user.owner_profile.verified_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {user.owner_profile.verification_status ===
                                'pending' && (
                                <div className="flex gap-3 border-t pt-4">
                                    <Button
                                        size="sm"
                                        onClick={handleVerifyOwner}
                                        disabled={
                                            !can('owner_profiles.verify')
                                        }
                                    >
                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                        Approve
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleRejectOwner}
                                        disabled={
                                            !can('owner_profiles.verify')
                                        }
                                    >
                                        <XCircle className="mr-1.5 h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Customer Identity */}
                {user.customer_identity && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <IdCard className="h-5 w-5" />
                                Customer Identity
                            </CardTitle>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${verificationBadgeClass(user.customer_identity.verification_status)}`}
                            >
                                {user.customer_identity.verification_status
                                    .charAt(0)
                                    .toUpperCase() +
                                    user.customer_identity.verification_status.slice(
                                        1,
                                    )}
                            </span>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        National ID Number
                                    </p>
                                    <p className="font-medium">
                                        {user.customer_identity.national_id_number}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Verified By
                                    </p>
                                    <p className="font-medium">
                                        {user.customer_identity.verified_by_name ??
                                            'Not yet verified'}
                                    </p>
                                </div>
                                {user.customer_identity.verified_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Verified At
                                        </p>
                                        <p className="font-medium">
                                            {new Date(
                                                user.customer_identity.verified_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-muted p-4">
                                    <p className="text-sm text-muted-foreground">
                                        ID front
                                    </p>
                                    {user.customer_identity.national_id_front_path ? (
                                        <DocumentLink
                                            path={user.customer_identity.national_id_front_path}
                                            label="View front photo"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Not uploaded.
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-2xl border border-muted p-4">
                                    <p className="text-sm text-muted-foreground">
                                        ID back
                                    </p>
                                    {user.customer_identity.national_id_back_path ? (
                                        <DocumentLink
                                            path={user.customer_identity.national_id_back_path}
                                            label="View back photo"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Not uploaded.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {user.customer_identity.verification_status ===
                                'pending' && (
                                <div className="flex gap-3 border-t pt-4">
                                    <Button
                                        size="sm"
                                        onClick={
                                            handleVerifyCustomerIdentity
                                        }
                                        disabled={!can('customer_identities.verify')}
                                    >
                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={
                                            handleRejectCustomerIdentity
                                        }
                                        disabled={!can('customer_identities.verify')}
                                    >
                                        <XCircle className="mr-1.5 h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Driver Profile */}
                {user.driver_profile &&
                    (user.role === 'driver' ||
                        user.staff_role_id !== null) && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Driver Profile
                            </CardTitle>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${verificationBadgeClass(
                                        user.driver_profile
                                            .verification_status,
                                    )}`}
                                >
                                    {user.driver_profile.verification_status
                                        .charAt(0)
                                        .toUpperCase() +
                                        user.driver_profile.verification_status.slice(
                                            1,
                                        )}
                                </span>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            License Number
                                        </p>
                                        <p className="font-medium">
                                            {
                                                user.driver_profile
                                                    .license_number
                                            }
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            License Type
                                        </p>
                                        <p className="font-medium">
                                            {user.driver_profile.license_type}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Experience
                                        </p>
                                        <p className="font-medium">
                                            {
                                                user.driver_profile
                                                    .experience_years
                                            }{' '}
                                            years
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Location
                                        </p>
                                        <p className="font-medium">
                                            {user.driver_profile.location}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Availability
                                        </p>
                                        <p className="font-medium">
                                            {user.driver_profile.availability}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-muted p-4">
                                    <p className="text-sm text-muted-foreground">
                                        License document
                                    </p>
                                    {user.driver_profile.license_file_path ? (
    <DocumentLink
        path={user.driver_profile.license_file_path}
        label="View uploaded document"
    />
) : (
    <p className="text-sm text-muted-foreground">
        No license document uploaded yet.
    </p>
)}
                                </div>

                                {user.driver_profile.verification_status ===
                                    'pending' && (
                                    <div className="flex gap-3 border-t pt-4">
                                        <Button
                                            size="sm"
                                            onClick={handleVerifyDriver}
                                            disabled={
                                                !can('driver_profiles.verify')
                                            }
                                        >
                                            <CheckCircle className="mr-1.5 h-4 w-4" />
                                            Approve
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleRejectDriver}
                                            disabled={
                                                !can('driver_profiles.verify')
                                            }
                                        >
                                            <XCircle className="mr-1.5 h-4 w-4" />
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                {/* Driver Reviews */}
                {user.reviews && user.reviews.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Driver Reviews
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-3">
                                {user.reviews.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-start justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {r.reviewer.name}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {r.rating} ★ ·{' '}
                                                {new Date(
                                                    r.created_at,
                                                ).toLocaleDateString()}
                                            </p>

                                            {r.review_text && (
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {r.review_text}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            'Delete this review?',
                                                        )
                                                    ) {
                                                        router.delete(
                                                            `/admin/reviews/${r.id}`,
                                                        );
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ShowUser.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Users',
            href: '/admin/users',
        },
        {
            title: 'Details',
            href: '#',
        },
    ],
};