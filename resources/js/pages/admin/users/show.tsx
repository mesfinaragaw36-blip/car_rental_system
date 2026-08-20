import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Car,
    CheckCircle2,
    ExternalLink,
    FileText,
    IdCard,
    MapPin,
    Phone,
    Shield,
    Trash2,
    XCircle,
    Ban,
    PlayCircle,
    Edit,
    Mail,
    Calendar,
    CreditCard,
    Star,
    BadgeCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCan } from '@/hooks/use-can';
import type { Auth } from '@/types';

interface OwnerProfile {
    id: number;
    owner_type: 'individual' | 'organization';
    business_name: string | null;
    organization_type: string | null;
    organization_type_other: string | null;
    tin_number: string | null;
    address: string | null;
    national_id: string | null;
    national_id_front_file_path: string | null;
    national_id_back_file_path: string | null;
    trade_license_number: string | null;
    business_license_file_path: string | null;
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
    proficient_language?: string | null;
    verification_status: string;
    license_file_path?: string | null;
    telebirr_phone?: string | null;
    cbe_account?: string | null;
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
        reviewer: { id: number; name: string };
        rating: number;
        review_text: string | null;
        created_at: string;
    }>;
}

interface Props {
    user: UserData;
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

function StatusBadge({ label, tone }: { label: string; tone: 'green' | 'red' | 'yellow' | 'blue' | 'slate' }) {
    const tones: Record<string, string> = {
        green: 'bg-green-100 text-green-700 ring-green-600/20',
        red: 'bg-red-100 text-red-700 ring-red-600/20',
        yellow: 'bg-brand-soft text-brand ring-brand/20',
        blue: 'bg-accent text-primary ring-primary/10',
        slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    };

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>
            {label}
        </span>
    );
}

function toneForStatus(status: string): 'green' | 'red' | 'yellow' | 'slate' {
    switch (status) {
        case 'active':
        case 'approved':
            return 'green';
        case 'suspended':
        case 'rejected':
            return 'red';
        case 'pending':
            return 'yellow';
        default:
            return 'slate';
    }
}

function toneForRole(role: string): 'blue' | 'yellow' | 'slate' {
    switch (role) {
        case 'owner':
            return 'blue';
        case 'driver':
            return 'yellow';
        default:
            return 'slate';
    }
}

function SpecTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <Icon className="h-4 w-4 text-primary" />
            <p className="mt-2 text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value || '—'}</p>
        </div>
    );
}

function DocumentCard({ path, label }: { path: string | null; label: string }) {
    if (!path) {
        return (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3 text-center">
                <FileText className="mx-auto h-5 w-5 text-slate-300" />
                <p className="mt-1 text-xs text-slate-400">Not uploaded</p>
            </div>
        );
    }

    return (
        <a
            href={`/storage/${path}`}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-lg border bg-slate-50/70 p-3 transition-colors hover:border-primary/30 hover:bg-accent/30"
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">Click to view</p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </a>
    );
}

function initials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function organizationTypeLabel(type: string | null): string {
    if (!type) return '—';
    const labels: Record<string, string> = {
        private_limited_company: 'Private Limited Company (PLC)',
        share_company: 'Share Company (S.C.)',
        sole_proprietorship: 'Sole Proprietorship',
        partnership: 'Partnership',
        cooperative: 'Cooperative',
        government_organization: 'Government Organization',
        ngo_non_profit: 'NGO / Non-Profit',
        other: 'Other',
    };
    return labels[type] ?? type;
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

    function handleVerifyCustomerIdentity(): void {
        router.post(`/admin/users/${user.id}/verify-customer-identity`);
    }

    function handleRejectCustomerIdentity(): void {
        if (confirm('Are you sure you want to reject this customer identity?')) {
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

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                {/* Back Link */}
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users
                </Link>

                {/* Toast */}
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

                {/* User Header Card */}
                <Card className="overflow-hidden">
                    <div className="border-b bg-slate-50 px-6 py-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                    <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                                        {initials(user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <StatusBadge label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} tone={toneForRole(user.role)} />
                                        <StatusBadge label={user.status.charAt(0).toUpperCase() + user.status.slice(1)} tone={toneForStatus(user.status)} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link href={`/admin/users/${user.id}/edit`}>
                                    <Button size="sm" variant="outline" disabled={!can('users.edit')}>
                                        <Edit className="mr-1.5 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>

                                {user.status === 'active' ? (
                                    <Button variant="destructive" size="sm" onClick={handleSuspend} disabled={!can('users.manage')}>
                                        <Ban className="mr-1.5 h-4 w-4" />
                                        Suspend
                                    </Button>
                                ) : (
                                    <Button size="sm" onClick={handleActivate} disabled={!can('users.manage')}>
                                        <PlayCircle className="mr-1.5 h-4 w-4" />
                                        Activate
                                    </Button>
                                )}

                                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={!can('users.delete')}>
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info Tiles */}
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            <SpecTile icon={Mail} label="Email" value={user.email} />
                            <SpecTile icon={Phone} label="Phone" value={user.phone} />
                            <SpecTile icon={MapPin} label="Location" value={user.address} />
                            <SpecTile icon={Calendar} label="Joined" value={formatDate(user.created_at)} />
                            <SpecTile icon={CreditCard} label="User ID" value={`#${user.id}`} />
                        </div>
                    </CardContent>
                </Card>

                {/* Owner Profile */}
                {user.role === 'owner' && user.owner_profile && (
                    <Card>
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                    Owner Profile
                                </CardTitle>
                                <StatusBadge
                                    label={user.owner_profile.verification_status.charAt(0).toUpperCase() + user.owner_profile.verification_status.slice(1)}
                                    tone={toneForStatus(user.owner_profile.verification_status)}
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            {/* Owner Type & Business Name */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Owner Type</p>
                                    <p className="mt-1 text-sm font-semibold capitalize">{user.owner_profile.owner_type}</p>
                                </div>
                                {user.owner_profile.business_name && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Business Name</p>
                                        <p className="mt-1 text-sm font-semibold">{user.owner_profile.business_name}</p>
                                    </div>
                                )}
                                {user.owner_profile.owner_type === 'organization' && user.owner_profile.organization_type && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Organization Type</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {organizationTypeLabel(user.owner_profile.organization_type)}
                                            {user.owner_profile.organization_type === 'other' && user.owner_profile.organization_type_other
                                                ? ` (${user.owner_profile.organization_type_other})`
                                                : ''}
                                        </p>
                                    </div>
                                )}
                                {user.owner_profile.tin_number && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">TIN Number</p>
                                        <p className="mt-1 font-mono text-sm font-semibold">{user.owner_profile.tin_number}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">National ID</p>
                                    <p className="mt-1 font-mono text-sm font-semibold">{user.owner_profile.national_id || '—'}</p>
                                </div>
                                {user.owner_profile.trade_license_number && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Trade License</p>
                                        <p className="mt-1 font-mono text-sm font-semibold">{user.owner_profile.trade_license_number}</p>
                                    </div>
                                )}
                                {user.owner_profile.address && (
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Address</p>
                                        <p className="mt-1 text-sm font-semibold">{user.owner_profile.address}</p>
                                    </div>
                                )}
                                {user.owner_profile.verified_at && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Verified At</p>
                                        <p className="mt-1 text-sm font-semibold">{formatDate(user.owner_profile.verified_at)}</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Documents */}
                            <div>
                                <p className="mb-3 text-sm font-semibold text-slate-700">Documents</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {user.owner_profile.owner_type === 'individual' ? (
                                        <>
                                            <DocumentCard path={user.owner_profile.national_id_front_file_path} label="National ID (Front)" />
                                            <DocumentCard path={user.owner_profile.national_id_back_file_path} label="National ID (Back)" />
                                        </>
                                    ) : (
                                        <DocumentCard path={user.owner_profile.business_license_file_path} label="Business License" />
                                    )}
                                </div>
                            </div>

                            {/* Approval Bar */}
                            {(user.owner_profile.verification_status === 'pending' || user.owner_profile.verification_status === 'incomplete') && (
                                <>
                                    <Separator />
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <div>
                                            <p className="font-semibold text-amber-900">Approve or reject this owner</p>
                                            <p className="mt-0.5 text-sm text-amber-700">
                                                Review the uploaded documents and approve to grant access, or reject if details are invalid.
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button size="sm" onClick={handleVerifyOwner} disabled={!can('owner_profiles.verify')}>
                                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={handleRejectOwner} disabled={!can('owner_profiles.verify')}>
                                                <XCircle className="mr-1.5 h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Customer Identity */}
                {user.customer_identity && (
                    <Card>
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <IdCard className="h-4 w-4 text-primary" />
                                    </div>
                                    Customer Identity
                                </CardTitle>
                                <StatusBadge
                                    label={user.customer_identity.verification_status.charAt(0).toUpperCase() + user.customer_identity.verification_status.slice(1)}
                                    tone={toneForStatus(user.customer_identity.verification_status)}
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">National ID Number</p>
                                    <p className="mt-1 font-mono text-sm font-semibold">{user.customer_identity.national_id_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Verified By</p>
                                    <p className="mt-1 text-sm font-semibold">{user.customer_identity.verified_by_name ?? 'Not yet verified'}</p>
                                </div>
                                {user.customer_identity.verified_at && (
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Verified At</p>
                                        <p className="mt-1 text-sm font-semibold">{formatDate(user.customer_identity.verified_at)}</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Documents */}
                            <div>
                                <p className="mb-3 text-sm font-semibold text-slate-700">Documents</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <DocumentCard path={user.customer_identity.national_id_front_path} label="National ID (Front)" />
                                    <DocumentCard path={user.customer_identity.national_id_back_path} label="National ID (Back)" />
                                </div>
                            </div>

                            {/* Approval Bar */}
                            {user.customer_identity.verification_status === 'pending' && (
                                <>
                                    <Separator />
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <div>
                                            <p className="font-semibold text-amber-900">Approve or reject this identity</p>
                                            <p className="mt-0.5 text-sm text-amber-700">
                                                Verify the uploaded ID matches the user. Approved customers can book vehicles.
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button size="sm" onClick={handleVerifyCustomerIdentity} disabled={!can('customer_identities.verify')}>
                                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={handleRejectCustomerIdentity} disabled={!can('customer_identities.verify')}>
                                                <XCircle className="mr-1.5 h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Driver Profile */}
                {user.driver_profile && (user.role === 'driver' || user.staff_role_id !== null) && (
                    <Card>
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                        <Car className="h-4 w-4 text-primary" />
                                    </div>
                                    Driver Profile
                                </CardTitle>
                                <StatusBadge
                                    label={user.driver_profile.verification_status.charAt(0).toUpperCase() + user.driver_profile.verification_status.slice(1)}
                                    tone={toneForStatus(user.driver_profile.verification_status)}
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            {/* Spec Tiles */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                <SpecTile icon={CreditCard} label="License Number" value={user.driver_profile.license_number} />
                                <SpecTile icon={Shield} label="License Type" value={user.driver_profile.license_type} />
                                <SpecTile icon={Calendar} label="Experience" value={`${user.driver_profile.experience_years} years`} />
                                <SpecTile icon={MapPin} label="Location" value={user.driver_profile.location} />
                                <SpecTile icon={BadgeCheck} label="Availability" value={user.driver_profile.availability} />
                                {user.driver_profile.proficient_language && (
                                    <SpecTile icon={BadgeCheck} label="Language" value={user.driver_profile.proficient_language} />
                                )}
                            </div>

                            {/* Payment Information */}
                            {(user.driver_profile.telebirr_phone || user.driver_profile.cbe_account) && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="mb-3 text-sm font-semibold text-slate-700">Payment Information</p>
                                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {user.driver_profile.telebirr_phone && (
                                                    <div>
                                                        <p className="text-xs font-medium text-blue-600">Telebirr Phone</p>
                                                        <p className="mt-1 font-mono text-sm font-semibold text-blue-900">{user.driver_profile.telebirr_phone}</p>
                                                    </div>
                                                )}
                                                {user.driver_profile.cbe_account && (
                                                    <div>
                                                        <p className="text-xs font-medium text-blue-600">CBE Account</p>
                                                        <p className="mt-1 font-mono text-sm font-semibold text-blue-900">{user.driver_profile.cbe_account}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* License Document */}
                            <div>
                                <p className="mb-3 text-sm font-semibold text-slate-700">Documents</p>
                                <DocumentCard path={user.driver_profile.license_file_path ?? null} label="Driving License" />
                            </div>

                            {/* Approval Bar */}
                            {user.driver_profile.verification_status === 'pending' && (
                                <>
                                    <Separator />
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <div>
                                            <p className="font-semibold text-amber-900">Approve or reject this driver</p>
                                            <p className="mt-0.5 text-sm text-amber-700">
                                                Review the license document and credentials before approving.
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button size="sm" onClick={handleVerifyDriver} disabled={!can('driver_profiles.verify')}>
                                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={handleRejectDriver} disabled={!can('driver_profiles.verify')}>
                                                <XCircle className="mr-1.5 h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Driver Reviews */}
                {user.reviews && user.reviews.length > 0 && (
                    <Card>
                        <CardHeader className="border-b bg-slate-50/50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <Star className="h-4 w-4 text-primary" />
                                </div>
                                Driver Reviews
                                <Badge variant="secondary" className="ml-1">{user.reviews.length}</Badge>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {user.reviews.map((r) => (
                                    <div key={r.id} className="flex items-start justify-between gap-3 rounded-lg border bg-slate-50/70 p-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{r.reviewer.name}</p>
                                                <span className="text-sm text-amber-500">{r.rating} ★</span>
                                                <span className="text-xs text-muted-foreground">· {formatDate(r.created_at)}</span>
                                            </div>
                                            {r.review_text && (
                                                <p className="mt-2 text-sm text-muted-foreground">{r.review_text}</p>
                                            )}
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm('Delete this review?')) {
                                                    router.delete(`/admin/reviews/${r.id}`);
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
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
