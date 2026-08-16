import { usePage } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import StorefrontLayout from '@/layouts/app/storefront-layout';
import type { Auth, BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth.user?.role;

    const usesStorefront = !role || role === 'customer' || role === 'driver';

    if (usesStorefront) {
        return <StorefrontLayout>{children}</StorefrontLayout>;
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
