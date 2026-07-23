import { Head } from '@inertiajs/react';

export default function DriverProfile() {
    return (
        <>
            <Head title="Driver Profile" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Driver Profile
                </h1>

                <div className="mt-6 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold">
                        Driver Information
                    </h2>

                    <div className="mt-4 space-y-2">
                        <p>License Number:</p>
                        <p>Experience Years:</p>
                        <p>Availability:</p>
                        <p>Verification Status:</p>
                    </div>
                </div>
            </div>
        </>
    );
}