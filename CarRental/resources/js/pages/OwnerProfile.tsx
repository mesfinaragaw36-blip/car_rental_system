import { Head } from '@inertiajs/react';

export default function OwnerProfile({ profile }: any) {
    return (
        <>
            <Head title="Owner Profile" />

            <div className="p-6">
                <h1 className="text-2xl font-bold">
                    Owner Profile
                </h1>

                {profile ? (
                    <div className="mt-5 space-y-2">
                        <p>
                            Business Name: {profile.business_name}
                        </p>

                        <p>
                            National ID: {profile.national_id}
                        </p>

                        <p>
                            Trade License:
                            {profile.trade_license_number}
                        </p>

                        <p>
                            Status: {profile.verification_status}
                        </p>
                    </div>
                ) : (
                    <p>No owner profile found.</p>
                )}
            </div>
        </>
    );
}