import { usePage } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import StorefrontLayout from '@/layouts/app/storefront-layout';
import type { Auth, BreadcrumbItem } from '@/types';

const STOREFRONT_PAGES = [
    'browse-cars',
    'car-details',
    'bookings',
    'booking-details',
    'payment',
    'payments',
    'receipt',
];

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const page = usePage<{ auth: Auth }>();
    const componentName = (page.component ?? '').split('/').pop() ?? '';
    const role = page.props.auth.user?.role;

    const isStorefrontPage = STOREFRONT_PAGES.includes(componentName);
    const isCustomer = role === 'customer';

    if (isCustomer && isStorefrontPage) {
        return <StorefrontLayout>{children}</StorefrontLayout>;
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
