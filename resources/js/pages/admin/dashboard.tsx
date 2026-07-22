import { Head } from '@inertiajs/react';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="p-8">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="mt-2 text-muted-foreground">Welcome, Admin.</p>
            </div>
        </>
    );
}
