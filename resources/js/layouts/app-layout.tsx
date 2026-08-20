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
    const fullComponent = page.component ?? '';
    const componentName = fullComponent.split('/').pop() ?? '';
    const role = page.props.auth.user?.role;

    const isCustomer = role === 'customer';
    const isStorefrontPage = STOREFRONT_PAGES.includes(componentName);
    const isCustomerPage = isCustomer && (
        isStorefrontPage ||
        fullComponent.startsWith('settings/') ||
        fullComponent.startsWith('notifications/') ||
        componentName === 'car-type-request-status'
    );

    if (isCustomerPage) {
        return <StorefrontLayout>{children}</StorefrontLayout>;
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
