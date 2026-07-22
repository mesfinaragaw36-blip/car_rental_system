import { Head } from '@inertiajs/react';

export default function CustomerDashboard() {
    return (
        <>
            <Head title="Customer Dashboard" />
            <div className="p-8">
                <h1 className="text-2xl font-bold">Customer Dashboard</h1>
                <p className="mt-2 text-muted-foreground">Welcome, Customer.</p>
            </div>
        </>
    );
}
