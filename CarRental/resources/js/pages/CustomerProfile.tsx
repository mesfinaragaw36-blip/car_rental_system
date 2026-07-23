import { Head, useForm } from '@inertiajs/react';

interface User {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    profile_photo?: string;
}

interface Props {
    user: User;
}

export default function CustomerProfile({ user }: Props) {

    const { data, setData, put, processing, errors } = useForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        put('/customer/profile');
    }

    return (
        <>
            <Head title="Customer Profile" />

            <div className="p-6">

                <h1 className="text-2xl font-bold">
                    Customer Profile
                </h1>

                <form
                    onSubmit={submit}
                    className="mt-6 space-y-4 rounded-lg border p-6"
                >

                    <div>
                        <label className="font-semibold">
                            Name
                        </label>

                        <input
                            className="mt-1 w-full rounded border p-2"
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                        />

                        {errors.name && (
                            <p className="text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>


                    <div>
                        <label className="font-semibold">
                            Phone
                        </label>

                        <input
                            className="mt-1 w-full rounded border p-2"
                            value={data.phone}
                            onChange={(e) =>
                                setData('phone', e.target.value)
                            }
                        />
                    </div>


                    <div>
                        <label className="font-semibold">
                            Address
                        </label>

                        <textarea
                            className="mt-1 w-full rounded border p-2"
                            value={data.address}
                            onChange={(e) =>
                                setData('address', e.target.value)
                            }
                        />
                    </div>


                    <button
                        disabled={processing}
                        className="rounded bg-black px-5 py-2 text-white"
                    >
                        {processing ? 'Saving...' : 'Save Profile'}
                    </button>

                </form>

            </div>
        </>
    );
}