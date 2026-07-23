import { Head, useForm } from '@inertiajs/react';

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

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Driver Profile
                </h1>

                <form
                    onSubmit={submit}
                    className="mt-6 space-y-4 rounded-lg border p-6"
                >

                    <div>
                        <label className="font-semibold">
                            License Number
                        </label>

                        <input
                            className="mt-1 w-full rounded border p-2"
                            value={data.license_number}
                            onChange={(e) =>
                                setData(
                                    'license_number',
                                    e.target.value
                                )
                            }
                        />

                        {errors.license_number && (
                            <p className="text-red-500">
                                {errors.license_number}
                            </p>
                        )}
                    </div>


                    <div>
                        <label className="font-semibold">
                            Experience Years
                        </label>

                        <input
                            type="number"
                            className="mt-1 w-full rounded border p-2"
                            value={data.experience_years}
                            onChange={(e) =>
                                setData(
                                    'experience_years',
                                    Number(e.target.value)
                                )
                            }
                        />

                        {errors.experience_years && (
                            <p className="text-red-500">
                                {errors.experience_years}
                            </p>
                        )}
                    </div>


                    <div>
                        <label className="font-semibold">
                            Availability
                        </label>

                        <select
                            className="mt-1 w-full rounded border p-2"
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


                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-black px-5 py-2 text-white"
                    >
                        {processing ? 'Saving...' : 'Save Profile'}
                    </button>

                </form>


                <div className="mt-6 rounded border p-4">
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