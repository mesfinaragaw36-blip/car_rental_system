import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
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
import { CheckCircle2, Clock, XCircle, ShieldCheck, FileText, Star, Pencil } from 'lucide-react';

const LANGUAGES = [
    'Amharic',
    'Oromo',
    'Tigrinya',
    'Somali',
    'Afar',
    'English',
    'Arabic',
    'French',
    'Swahili',
    'Chinese',
    'Hindi',
    'Turkish',
    'Spanish',
    'Other',
];

interface DriverProfile {
    id: number;
    license_number: string;
    license_type: string;
    experience_years: number;
    location: string;
    gender?: string | null;
    daily_rate?: number | null;
    proficient_language?: string | null;
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
    hasActiveAssignments: boolean;
}

function verificationBanner(status: string | undefined) {
    switch (status) {
        case 'pending':
            return {
                icon: Clock,
                classes: 'border-amber-200 bg-amber-50 text-amber-800',
                iconClass: 'text-amber-600',
                title: 'Profile Under Review',
                message:
                    "Your profile is being reviewed by an admin. You'll be able to accept assignments once approved.",
            };

        case 'approved':
            return {
                icon: CheckCircle2,
                classes: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                iconClass: 'text-emerald-600',
                title: 'Profile Verified',
                message:
                    "You're all set. You can receive chauffeur trip assignments.",
            };

        case 'rejected':
            return {
                icon: XCircle,
                classes: 'border-red-200 bg-red-50 text-red-800',
                iconClass: 'text-red-600',
                title: 'Profile Needs Changes',
                message:
                    'Your submission was not approved. Please review your details below and resubmit.',
            };

        default:
            return null;
    }
}

export default function DriverProfilePage({ profile, hasActiveAssignments = false }: Props) {
    const { props: p } = usePage<{
        toast?: { type: string; message: string };
    }>();
    const toast = p.toast;
    const isNew = !profile;
    const banner = profile ? verificationBanner(profile.verification_status) : null;

    const [licenseNumber, setLicenseNumber] = useState(profile?.license_number ?? '');
    const [licenseType, setLicenseType] = useState(profile?.license_type ?? '');
    const [experienceYears, setExperienceYears] = useState(String(profile?.experience_years ?? ''));
    const [location, setLocation] = useState(profile?.location ?? '');
    const [gender, setGender] = useState(profile?.gender ?? '');
    const [dailyRate, setDailyRate] = useState(String(profile?.daily_rate ?? ''));
    const [proficientLanguage, setProficientLanguage] = useState(profile?.proficient_language ?? '');
    const [languageSearch, setLanguageSearch] = useState('');
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const filteredLanguages = useMemo(() => {
        if (!languageSearch) return LANGUAGES;
        const q = languageSearch.toLowerCase();
        return LANGUAGES.filter((l) => l.toLowerCase().includes(q));
    }, [languageSearch]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (hasActiveAssignments && !isNew) {
            return;
        }

        setProcessing(true);

        const formData = {
            license_number: licenseNumber,
            license_type: licenseType,
            experience_years: experienceYears,
            location,
            gender,
            daily_rate: dailyRate,
            proficient_language: proficientLanguage,
            ...(licenseFile && { license_file: licenseFile }),
        };

        router.post('/driver/profile', formData, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs),
            onSuccess: () => setErrors({}),
        });
    }

    return (
        <>
            <Head title="Driver Profile" />

            <div className="space-y-6 p-6">
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

                {hasActiveAssignments && !isNew && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <p className="font-semibold text-amber-900">License Information Update Restricted</p>
                        <p className="mt-1 text-sm text-amber-700">
                            You cannot update your license information while you have active assignments.
                            Please complete or reject your current assignments first.
                        </p>
                    </div>
                )}

                {!isNew && banner && (
                    <div className={`flex items-start gap-3 rounded-lg border p-4 ${banner.classes}`}>
                        <banner.icon className={`mt-0.5 h-5 w-5 shrink-0 ${banner.iconClass}`} />
                        <div>
                            <p className="font-semibold">{banner.title}</p>
                            <p className="mt-1 text-sm">{banner.message}</p>
                        </div>
                    </div>
                )}

                {!isNew && profile && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {profile.average_rating !== undefined && (
                            <Card>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                                        <Star className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Average Rating</p>
                                        <p className="text-2xl font-bold">
                                            {profile.average_rating} ★
                                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                                                ({profile.review_count ?? 0})
                                            </span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {profile.recent_reviews && profile.recent_reviews.length > 0 && (
                            <Card>
                                <CardContent className="p-5">
                                    <p className="text-sm text-muted-foreground">Recent Reviews</p>
                                    <div className="mt-2 space-y-2">
                                        {profile.recent_reviews.slice(0, 3).map((r) => (
                                            <div key={r.id} className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{r.reviewer.name}</span>
                                                <span className="text-amber-500">{r.rating} ★</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            {isNew ? 'Profile Information' : 'Edit Profile'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="license_number">License Number</Label>
                                    <Input
                                        id="license_number"
                                        placeholder="e.g. DL-123456"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                        disabled={hasActiveAssignments && !isNew}
                                        required
                                    />
                                    <InputError message={errors.license_number} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>License Type</Label>
                                    <Select
                                        value={licenseType}
                                        onValueChange={setLicenseType}
                                        disabled={hasActiveAssignments && !isNew}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select license type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="አውቶ">አውቶ</SelectItem>
                                            <SelectItem value="ህዝብ">ህዝብ</SelectItem>
                                            <SelectItem value="ደረቅ ጭነት">ደረቅ ጭነት</SelectItem>
                                            <SelectItem value="ፈሳሽ ጭነት">ፈሳሽ ጭነት</SelectItem>
                                            <SelectItem value="ግንባታ መሣሪያዎች / ኮንስትራክሽን">
                                                ግንባታ መሣሪያዎች / ኮንስትራክሽን
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.license_type} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="experience_years">Experience (Years)</Label>
                                    <Input
                                        id="experience_years"
                                        type="number"
                                        min="0"
                                        max="50"
                                        placeholder="e.g. 3"
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.experience_years} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="location">Location / City</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. Addis Ababa"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.location} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Gender</Label>
                                    <Select value={gender} onValueChange={setGender}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.gender} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="daily_rate">Daily Rate (ETB)</Label>
                                    <Input
                                        id="daily_rate"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 500"
                                        value={dailyRate}
                                        onChange={(e) => setDailyRate(e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.daily_rate} />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label>Proficient Language</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Search languages..."
                                            value={showLanguageDropdown ? languageSearch : proficientLanguage}
                                            onChange={(e) => {
                                                setLanguageSearch(e.target.value);
                                                setShowLanguageDropdown(true);
                                            }}
                                            onFocus={() => setShowLanguageDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowLanguageDropdown(false), 200)}
                                        />
                                        {showLanguageDropdown && filteredLanguages.length > 0 && (
                                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                                                {filteredLanguages.map((lang) => (
                                                    <button
                                                        key={lang}
                                                        type="button"
                                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                                                            proficientLanguage === lang ? 'bg-accent font-medium' : ''
                                                        }`}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => {
                                                            setProficientLanguage(lang);
                                                            setLanguageSearch('');
                                                            setShowLanguageDropdown(false);
                                                        }}
                                                    >
                                                        {lang}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.proficient_language} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="license_file">
                                    License Document <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="license_file"
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                    disabled={hasActiveAssignments && !isNew}
                                    required={!profile?.license_file_path}
                                />
                                {profile?.license_file_path && (
                                    <p className="text-sm text-muted-foreground">
                                        Current:{' '}
                                        <a
                                            href={profile.license_file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View Document
                                        </a>
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Upload a clear photo or scan of your driving license (Required for verification)
                                </p>
                                <InputError message={errors.license_file} />
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Saving...' : isNew ? 'Create Profile' : 'Update Profile'}
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
