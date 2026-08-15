import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DriverProfile {
    id: number;
    license_number: string;
    license_type: string;
    experience_years: number;
    location: string;
    license_file_path?: string | null;
    verification_status?: string;
    average_rating?: number;
    review_count?: number;
    recent_reviews?: Array<{
        id: number;
        reviewer: { id: number; name: string };
        rating: number;
        review_text: string | null;
        created_at: string;
    }>;
}

interface Props {
    profile: DriverProfile | null;
}

function verificationBanner(status: string | undefined) {
    switch (status) {
        case 'pending':
            return {
                classes: 'bg-amber-50 text-amber-800 border border-amber-200',
                title: 'Your profile is under review',
                message:
                    "Thanks for submitting your details. An admin is reviewing your profile and will approve it shortly. You'll be able to receive trip assignments once approved.",
            };

        case 'approved':
            return {
                classes:
                    'bg-emerald-50 text-emerald-800 border border-emerald-200',
                title: 'Your profile is verified',
                message:
                    "You're all set. You can now receive chauffeur trip assignments.",
            };

        case 'rejected':
            return {
                classes: 'bg-red-50 text-red-800 border border-red-200',
                title: 'Your profile needs changes',
                message:
                    'Your submission was not approved. Please review your details below and resubmit.',
            };

        default:
            return null;
    }
}

export default function DriverProfilePage({ profile }: Props) {
    const { props: p } = usePage<{
        toast?: { type: string; message: string };
    }>();
    const toast = p.toast;
    const isNew = !profile;
    const banner = profile
        ? verificationBanner(profile.verification_status)
        : null;

    const [licenseNumber, setLicenseNumber] = useState(
    profile?.license_number && profile.license_number !== 'PENDING'
        ? profile.license_number
        : '',
);
    const [licenseType, setLicenseType] = useState(profile?.license_type ?? '');
    const [experienceYears, setExperienceYears] = useState(
        String(profile?.experience_years ?? ''),
    );
    const [location, setLocation] = useState(profile?.location ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        router.post(
            '/driver/profile',
            {
                license_number: licenseNumber,
                license_type: licenseType,
                experience_years: experienceYears,
                location,
            },
            {
                forceFormData: true,
                onFinish: () => setProcessing(false),
                onError: (errs) => setErrors(errs),
                onSuccess: () => setErrors({}),
            },
        );
    }

    return (
        <>
            <Head title="Driver Profile" />
            <div className="mx-auto max-w-lg space-y-6 p-6">
                <h1 className="text-3xl font-bold">
                    {isNew ? 'Complete Your Profile' : 'Driver Profile'}
                </h1>

                {toast && (
                    <div
                        className={`rounded-lg p-4 ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                {!isNew && banner && (
                    <div className={`rounded-lg p-4 ${banner.classes}`}>
                        <p className="font-semibold">{banner.title}</p>
                        <p className="mt-1 text-sm">{banner.message}</p>
                    </div>
                )}

                {!isNew && profile && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {profile.average_rating !== undefined && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Rating:
                                </span>
                                <span className="font-semibold">
                                    {profile.average_rating} ★
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    ({profile.review_count ?? 0})
                                </span>
                            </div>
                        )}
                        {profile.recent_reviews &&
                            profile.recent_reviews.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold">
                                        Recent Reviews
                                    </h3>
                                    <div className="mt-3 space-y-3">
                                        {profile.recent_reviews.map((r) => (
                                            <div
                                                key={r.id}
                                                className="rounded-lg border p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">
                                                            {r.reviewer.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(
                                                                r.created_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="font-semibold">
                                                        {r.rating} ★
                                                    </div>
                                                </div>
                                                {r.review_text && (
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {r.review_text}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Driver Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="license_number">
                                    License Number
                                </Label>
                                <Input
                                    id="license_number"
                                    placeholder="e.g. DL-123456"
                                    value={licenseNumber}
                                    onChange={(e) =>
                                        setLicenseNumber(e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.license_number} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>License Type</Label>
                                <Select
                                    value={licenseType}
                                    onValueChange={setLicenseType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select license type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="አውቶ">
                                            አውቶ
                                        </SelectItem>
                                        <SelectItem value="ህዝብ">
                                            ህዝብ
                                        </SelectItem>
                                        <SelectItem value="ደረቅ ጭነት">
                                            ደረቅ ጭነት
                                        </SelectItem>
                                        <SelectItem value="ፈሳሽ ጭነት">
                                            ፈሳሽ ጭነት
                                        </SelectItem>
                                        <SelectItem value="ግንባታ መሣሪያዎች / ኮንስትራክሽን">
                                            ግንባታ መሣሪያዎች / ኮንስትራክሽን
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.license_type} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="experience_years">
                                    Experience (Years)
                                </Label>
                                <Input
                                    id="experience_years"
                                    type="number"
                                    min="0"
                                    max="50"
                                    placeholder="e.g. 3"
                                    value={experienceYears}
                                    onChange={(e) =>
                                        setExperienceYears(e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.experience_years} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="location">
                                    Location / City
                                </Label>
                                <Input
                                    id="location"
                                    placeholder="e.g. Addis Ababa"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.location} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Saving...'
                                    : isNew
                                      ? 'Create Profile'
                                      : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DriverProfilePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Driver Profile', href: '' },
    ],
};
