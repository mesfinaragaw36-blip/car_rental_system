import { Head, router, usePage } from '@inertiajs/react';
import { Building2, FileText, MapPin, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

type OwnerProfile = {
    id: number;
    owner_type: 'individual' | 'organization';
    business_name: string | null;
    organization_type: string | null;
    tin_number: string | null;
    address: string | null;
    national_id: string;
    national_id_front_file_path: string | null;
    national_id_back_file_path: string | null;
    trade_license_number: string | null;
    business_license_file_path: string | null;
    vehicle_ownership_certificate_file_path: string | null;
    profile_completed: boolean;
    verification_status: 'pending' | 'approved' | 'rejected';
};

type Props = {
    ownerProfile: OwnerProfile;
};

const organizationTypes = [
    { value: 'private_limited_company', label: 'Private Limited Company (PLC)' },
    { value: 'share_company', label: 'Share Company (S.C.)' },
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'cooperative', label: 'Cooperative' },
    {
        value: 'government_organization',
        label: 'Government Organization',
    },
    { value: 'ngo_non_profit', label: 'NGO / Non-Profit Organization' },
    { value: 'other', label: 'Other' },
];

export default function OwnerProfile({ ownerProfile }: Props) {
    const { errors, toast } = usePage<{ errors: Record<string, string>; toast?: { type: string; message: string } }>().props;
    const [formData, setFormData] = useState({
        organization_type: ownerProfile.organization_type || '',
        tin_number: ownerProfile.tin_number || '',
        address: ownerProfile.address || '',
    });
    const [businessLicense, setBusinessLicense] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('address', formData.address);

        if (ownerProfile.owner_type === 'organization') {
            data.append('organization_type', formData.organization_type);
            data.append('tin_number', formData.tin_number);

            if (businessLicense) {
                data.append('business_license', businessLicense);
            }
        }

        router.post('/owner/profile', data, {
            onFinish: () => setIsSubmitting(false),
            preserveScroll: true,
        });
    };

    const isOrganization = ownerProfile.owner_type === 'organization';

    return (
        <>
            <Head title="Complete Your Profile" />

            <div className="mx-auto max-w-4xl space-y-6 py-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">
                        Complete Your{' '}
                        {isOrganization ? 'Organization' : 'Owner'} Profile
                    </h1>
                    <p className="text-muted-foreground">
                        {isOrganization
                            ? 'Please provide your organization details and required documents to start listing your vehicles.'
                            : 'Please complete your profile to start listing your vehicles.'}
                    </p>
                </div>

                {toast && (
                    <div
                        className={`rounded-lg p-4 ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Profile Status */}
                {ownerProfile.verification_status === 'pending' && ownerProfile.profile_completed && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <FileText className="mt-0.5 h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900">
                                    Profile Under Review
                                </h3>
                                <p className="mt-1 text-sm text-blue-800">
                                    Your profile has been submitted and is currently under review by an administrator. You will be notified once it is approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!ownerProfile.profile_completed && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <FileText className="mt-0.5 h-5 w-5 text-amber-600" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900">
                                    Profile Incomplete
                                </h3>
                                <p className="mt-1 text-sm text-amber-800">
                                    You need to complete your profile before
                                    you can add vehicles to the platform.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-6 text-xl font-semibold">
                            {isOrganization
                                ? 'Organization Information'
                                : 'Owner Information'}
                        </h2>

                        <div className="space-y-6">
                            {/* Organization Type - Only for organizations */}
                            {isOrganization && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="organization_type">
                                            Organization Type{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <select
                                            id="organization_type"
                                            value={formData.organization_type}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    organization_type:
                                                        e.target.value,
                                                });
                                                const otherInput = document.getElementById('organization_type_other') as HTMLInputElement;
                                                if (otherInput) {
                                                    otherInput.style.display = e.target.value === 'other' ? 'block' : 'none';
                                                }
                                            }}
                                            required
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        >
                                            <option value="">
                                                Select organization type
                                            </option>
                                            {organizationTypes.map((type) => (
                                                <option
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.organization_type && (
                                            <p className="text-sm text-destructive">
                                                {errors.organization_type}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <Input
                                        id="organization_type_other"
                                        type="text"
                                        name="organization_type_other"
                                        placeholder="Please specify organization type"
                                        className="mt-2"
                                        style={{display: formData.organization_type === 'other' ? 'block' : 'none'}}
                                    />
                                </>
                            )}

                            {/* TIN Number - Only for organizations */}
                            {isOrganization && (
                                <div className="space-y-2">
                                    <Label htmlFor="tin_number">
                                        TIN Number{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Building2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="tin_number"
                                            type="text"
                                            value={formData.tin_number}
                                            onChange={(e) => {
                                                const value =
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    );
                                                // if (value.length <= 10) {
                                                    setFormData({
                                                        ...formData,
                                                        tin_number: value,
                                                    });
                                                // }
                                            }}
                                            required
                                            // maxLength={10}
                                            placeholder="0123456789"
                                            className="pl-9"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {/* 10 digits, numbers only */}
                                        Numbers only
                                    </p>
                                    {errors.tin_number && (
                                        <p className="text-sm text-destructive">
                                            {errors.tin_number}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    {isOrganization
                                        ? 'Business Address'
                                        : 'Address'}
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                address: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        placeholder="Enter your full address (optional)"
                                        className="resize-none pl-9"
                                    />
                                </div>
                                {errors.address && (
                                    <p className="text-sm text-destructive">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            {/* Document Uploads - Only for organizations */}
                            {isOrganization && (
                                <>
                                    {/* Business License */}
                                    <div className="space-y-2">
                                        <Label htmlFor="business_license">
                                            Business License{' '}
                                            {!ownerProfile.business_license_file_path && (
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            )}
                                        </Label>
                                        {ownerProfile.business_license_file_path && (
                                            <p className="text-sm text-muted-foreground">
                                                ✓ Document uploaded
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <label
                                                htmlFor="business_license"
                                                className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border transition-colors hover:border-primary"
                                            >
                                                <div className="text-center">
                                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {businessLicense
                                                            ? businessLicense.name
                                                            : 'Click to upload business license'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        PDF, JPG, PNG (max 5MB)
                                                    </p>
                                                </div>
                                                <input
                                                    id="business_license"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) =>
                                                        setBusinessLicense(
                                                            e.target.files?.[0] ||
                                                                null,
                                                        )
                                                    }
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        {errors.business_license && (
                                            <p className="text-sm text-destructive">
                                                {errors.business_license}
                                            </p>
                                        )}
                                    </div>

                                </>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting || ownerProfile.verification_status === 'pending'}
                            size="lg"
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : ownerProfile.verification_status === 'pending'
                                  ? 'Profile Under Review'
                                  : ownerProfile.profile_completed
                                    ? 'Update Profile'
                                    : 'Submit Profile'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

OwnerProfile.layout = (page: React.ReactNode) => (
    <AppLayout>{page}</AppLayout>
);
