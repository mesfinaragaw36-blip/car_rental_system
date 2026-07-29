import { Head, Link, router, usePage } from '@inertiajs/react';
import { User, Car, CheckCircle, XCircle, Trash2, Ban, PlayCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Auth } from '@/types';

interface OwnerProfile {
    id: number;
    business_name: string | null;
    national_id: string | null;
    trade_license_number: string | null;
    verification_status: string;
    verified_at: string | null;
}

interface DriverProfile {
    id: number;
    license_number: string;
    experience_years: number;
    availability: string;
    verification_status: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    address: string | null;
    created_at: string;
    updated_at: string;
    owner_profile: OwnerProfile | null;
    driver_profile: DriverProfile | null;
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
            return 'bg-blue-100 text-blue-800';
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
            return 'bg-yellow-100 text-yellow-800';
    }
}

export default function ShowUser({ user }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;

    function handleSuspend(): void {
        if (confirm('Are you sure you want to suspend this user?')) {
            router.post(`/admin/users/${user.id}/suspend`);
        }
    }

    function handleActivate(): void {
        router.post(`/admin/users/${user.id}/activate`);
    }

    function handleDelete(): void {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
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

            <div className="p-6 space-y-6 max-w-3xl">
                <Link href="/admin/users" className="text-sm text-muted-foreground hover:underline">
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
                        <CardTitle className="text-2xl">User Details</CardTitle>
                        <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClass(user.role)}`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(user.status)}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{user.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">{user.address ?? 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Joined</p>
                                <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t pt-4">
                            <Link href={`/admin/users/${user.id}/edit`}>
                                <Button size="sm" variant="outline">
                                    <Edit className="mr-1.5 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                            {user.status === 'active' ? (
                                <Button variant="destructive" size="sm" onClick={handleSuspend}>
                                    <Ban className="mr-1.5 h-4 w-4" />
                                    Suspend
                                </Button>
                            ) : (
                                <Button size="sm" onClick={handleActivate}>
                                    <PlayCircle className="mr-1.5 h-4 w-4" />
                                    Activate
                                </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={handleDelete}>
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
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${verificationBadgeClass(user.owner_profile.verification_status)}`}>
                                {user.owner_profile.verification_status.charAt(0).toUpperCase() +
                                    user.owner_profile.verification_status.slice(1)}
                            </span>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">Business Name</p>
                                    <p className="font-medium">{user.owner_profile.business_name ?? 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">National ID</p>
                                    <p className="font-medium">{user.owner_profile.national_id ?? 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Trade License</p>
                                    <p className="font-medium">{user.owner_profile.trade_license_number ?? 'Not provided'}</p>
                                </div>
                                {user.owner_profile.verified_at && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Verified At</p>
                                        <p className="font-medium">{new Date(user.owner_profile.verified_at).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            {user.owner_profile.verification_status === 'pending' && (
                                <div className="flex gap-3 border-t pt-4">
                                    <Button size="sm" onClick={handleVerifyOwner}>
                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={handleRejectOwner}>
                                        <XCircle className="mr-1.5 h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Driver Profile */}
                {user.role === 'driver' && user.driver_profile && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Driver Profile
                            </CardTitle>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${verificationBadgeClass(user.driver_profile.verification_status)}`}>
                                {user.driver_profile.verification_status.charAt(0).toUpperCase() +
                                    user.driver_profile.verification_status.slice(1)}
                            </span>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-muted-foreground">License Number</p>
                                    <p className="font-medium">{user.driver_profile.license_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Experience</p>
                                    <p className="font-medium">{user.driver_profile.experience_years} years</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Availability</p>
                                    <p className="font-medium">
                                        {user.driver_profile.availability.charAt(0).toUpperCase() +
                                            user.driver_profile.availability.slice(1)}
                                    </p>
                                </div>
                            </div>

                            {user.driver_profile.verification_status === 'pending' && (
                                <div className="flex gap-3 border-t pt-4">
                                    <Button size="sm" onClick={handleVerifyDriver}>
                                        <CheckCircle className="mr-1.5 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={handleRejectDriver}>
                                        <XCircle className="mr-1.5 h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ShowUser.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: 'Details', href: '#' },
    ],
};
