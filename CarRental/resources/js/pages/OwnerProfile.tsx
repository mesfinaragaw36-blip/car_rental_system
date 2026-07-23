import { Head, useForm } from '@inertiajs/react';

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

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Owner Profile
                </h1>

                <form
                    onSubmit={submit}
                    className="mt-6 space-y-4 rounded-lg border p-6"
                >
                    <div>
                        <label className="block font-semibold">
                            Business Name
                        </label>

                        <input
                            type="text"
                            className="mt-1 w-full rounded border p-2"
                            value={data.business_name}
                            onChange={(e) =>
                                setData(
                                    'business_name',
                                    e.target.value
                                )
                            }
                        />

                        {errors.business_name && (
                            <p className="text-red-500">
                                {errors.business_name}
                            </p>
                        )}
                    </div>


                    <div>
                        <label className="block font-semibold">
                            National ID
                        </label>

                        <input
                            type="text"
                            className="mt-1 w-full rounded border p-2"
                            value={data.national_id}
                            onChange={(e) =>
                                setData(
                                    'national_id',
                                    e.target.value
                                )
                            }
                        />

                        {errors.national_id && (
                            <p className="text-red-500">
                                {errors.national_id}
                            </p>
                        )}
                    </div>


                    <div>
                        <label className="block font-semibold">
                            Trade License Number
                        </label>

                        <input
                            type="text"
                            className="mt-1 w-full rounded border p-2"
                            value={data.trade_license_number}
                            onChange={(e) =>
                                setData(
                                    'trade_license_number',
                                    e.target.value
                                )
                            }
                        />

                        {errors.trade_license_number && (
                            <p className="text-red-500">
                                {errors.trade_license_number}
                            </p>
                        )}
                    </div>


                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-5 py-2 text-white"
                    >
                        {processing ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>


                <div className="mt-6 rounded-lg border p-4">
                    <h2 className="font-bold">
                        Verification Status
                    </h2>

                    <p>
                        {profile?.verification_status ?? 'Pending'}
                    </p>
                </div>

            </div>
        </>
    );
}