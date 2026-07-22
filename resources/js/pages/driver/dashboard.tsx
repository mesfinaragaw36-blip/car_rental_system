import { Head } from '@inertiajs/react';

export default function DriverDashboard() {
    return (
        <>
            <Head title="Driver Dashboard" />
            <div className="p-8">
                <h1 className="text-2xl font-bold">Driver Dashboard</h1>
                <p className="mt-2 text-muted-foreground">Welcome, Driver.</p>
            </div>
        </>
    );
}
