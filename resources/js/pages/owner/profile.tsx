import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface OwnerProfileData {
    business_name: string;
    national_id: string;
    trade_license_number: string;
    verification_status?: string;
}

interface Props {
    profile?: OwnerProfileData;
}

export default function OwnerProfile({ profile }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        business_name: profile?.business_name ?? '',
        national_id: profile?.national_id ?? '',
        trade_license_number: profile?.trade_license_number ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/owner/profile');
    }

    return (
        <>
            <Head title="Owner Profile" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Owner Profile</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Business Name
                                </label>

                                <Input
                                    value={data.business_name}
                                    onChange={(e) =>
                                        setData('business_name', e.target.value)
                                    }
                                />

                                {errors.business_name && (
                                    <p className="text-sm text-red-500">
                                        {errors.business_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    National ID
                                </label>

                                <Input
                                    value={data.national_id}
                                    onChange={(e) =>
                                        setData('national_id', e.target.value)
                                    }
                                />

                                {errors.national_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.national_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Trade License Number
                                </label>

                                <Input
                                    value={data.trade_license_number}
                                    onChange={(e) =>
                                        setData(
                                            'trade_license_number',
                                            e.target.value
                                        )
                                    }
                                />

                                {errors.trade_license_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.trade_license_number}
                                    </p>
                                )}
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
