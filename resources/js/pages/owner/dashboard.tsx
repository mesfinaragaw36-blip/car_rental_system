import { Head } from '@inertiajs/react';

export default function OwnerDashboard() {
    return (
        <>
            <Head title="Owner Dashboard" />
            <div className="p-8">
                <h1 className="text-2xl font-bold">Owner Dashboard</h1>
                <p className="mt-2 text-muted-foreground">Welcome, Owner.</p>
            </div>
        </>
    );
}
