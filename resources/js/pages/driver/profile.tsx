import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DriverProfileData {
    license_number: string;
    experience_years: number;
    availability: string;
    verification_status?: string;
}

interface Props {
    profile?: DriverProfileData;
}

export default function DriverProfile({ profile }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        license_number: profile?.license_number ?? '',
        experience_years: profile?.experience_years ?? 0,
        availability: profile?.availability ?? 'available',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/driver/profile');
    }

    return (
        <>
            <Head title="Driver Profile" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Driver Profile</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>License Information</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    License Number
                                </label>

                                <Input
                                    value={data.license_number}
                                    onChange={(e) =>
                                        setData(
                                            'license_number',
                                            e.target.value
                                        )
                                    }
                                />

                                {errors.license_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.license_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Experience Years
                                </label>

                                <Input
                                    type="number"
                                    value={data.experience_years}
                                    onChange={(e) =>
                                        setData(
                                            'experience_years',
                                            Number(e.target.value)
                                        )
                                    }
                                />

                                {errors.experience_years && (
                                    <p className="text-sm text-red-500">
                                        {errors.experience_years}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Availability
                                </label>

                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    value={data.availability}
                                    onChange={(e) =>
                                        setData(
                                            'availability',
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="available">
                                        Available
                                    </option>

                                    <option value="unavailable">
                                        Unavailable
                                    </option>
                                </select>
                            </div>

                            <Button disabled={processing}>
                                {processing ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Verification Status</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-lg font-semibold">
                            {profile?.verification_status ?? 'Pending'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
