import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DriverProfile {
    id: number;
    license_number: string;
    license_type: string;
    experience_years: number;
    location: string;
    availability: string;
    verification_status: string;
    average_rating?: number;
    review_count?: number;
}

interface Props { profile: DriverProfile | null; }

export default function DriverProfilePage({ profile }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;
    const isNew = !profile;

    const [licenseNumber, setLicenseNumber] = useState(profile?.license_number ?? '');
    const [licenseType, setLicenseType] = useState(profile?.license_type ?? '');
    const [experienceYears, setExperienceYears] = useState(String(profile?.experience_years ?? ''));
    const [location, setLocation] = useState(profile?.location ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/driver/profile', {
            license_number: licenseNumber,
            license_type: licenseType,
            experience_years: experienceYears,
            location,
        }, {
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs),
            onSuccess: () => setErrors({}),
        });
    }

    return (
        <>
            <Head title="Driver Profile" />
            <div className="p-6 space-y-6 max-w-lg mx-auto">
                <h1 className="text-3xl font-bold">{isNew ? 'Complete Your Profile' : 'Driver Profile'}</h1>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{toast.message}</div>
                )}

                {!isNew && profile && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${profile.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {profile.availability}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Verification:</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${profile.verification_status === 'approved' ? 'bg-green-100 text-green-800' : profile.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {profile.verification_status}
                            </span>
                        </div>
                        {profile.average_rating !== undefined && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Rating:</span>
                                <span className="font-semibold">{profile.average_rating} ★</span>
                                <span className="text-sm text-muted-foreground">({profile.review_count ?? 0})</span>
                            </div>
                        )}
                        {profile.recent_reviews && profile.recent_reviews.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Recent Reviews</h3>
                                <div className="space-y-3 mt-3">
                                    {profile.recent_reviews.map((r) => (
                                        <div key={r.id} className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{r.reviewer.name}</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="font-semibold">{r.rating} ★</div>
                                            </div>
                                            {r.review_text && <p className="mt-2 text-sm text-muted-foreground">{r.review_text}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Card>
                    <CardHeader><CardTitle>Driver Information</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="license_number">License Number</Label>
                                <Input id="license_number" placeholder="e.g. DL-123456" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                                <InputError message={errors.license_number} />
                            </div>

                            <div className="space-y-1.5">
                                <Label>License Type</Label>
                                <Select value={licenseType} onValueChange={setLicenseType}>
                                    <SelectTrigger><SelectValue placeholder="Select license type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Light Vehicle">Light Vehicle</SelectItem>
                                        <SelectItem value="Heavy Vehicle">Heavy Vehicle</SelectItem>
                                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                                        <SelectItem value="Public Service">Public Service</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.license_type} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="experience_years">Experience (Years)</Label>
                                <Input id="experience_years" type="number" min="0" max="50" placeholder="e.g. 3" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} required />
                                <InputError message={errors.experience_years} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="location">Location / City</Label>
                                <Input id="location" placeholder="e.g. Addis Ababa" value={location} onChange={(e) => setLocation(e.target.value)} required />
                                <InputError message={errors.location} />
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
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Driver Profile', href: '' }],
};
