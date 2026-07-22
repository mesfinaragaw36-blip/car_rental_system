import { Head, Link, usePage } from '@inertiajs/react';
import { login, register } from '@/routes';
import type { Auth } from '@/types';

function getDashboardUrl(role: string): string {
    switch (role) {
        case 'admin':  return '/admin/dashboard';
        case 'owner':  return '/owner/dashboard';
        case 'driver': return '/driver/dashboard';
        default:       return '/customer/dashboard';
    }
}

export default function Welcome() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const dashboardUrl = auth.user ? getDashboardUrl(auth.user.role) : null;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
                <div className="w-full max-w-md space-y-6 px-6 text-center">
                    <h1 className="text-4xl font-bold">Car Rental</h1>
                    <p className="text-muted-foreground">
                        Rent a car or list your vehicle on our marketplace.
                    </p>
                    <div className="flex justify-center gap-4">
                        {dashboardUrl ? (
                            <Link
                                href={dashboardUrl}
                                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-accent"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
