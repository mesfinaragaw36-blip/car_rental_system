import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Car,
    Users,
    CreditCard,
    Shield,
    UserCog,
    BookOpen,
    Settings,
    Wrench,
    Search,
    MapPin,
    ClipboardCheck,
    Bell,
    ReceiptText,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';

const PERMISSION_ROUTE_MAP: Record<string, string[]> = {
    'bookings.view': ['/bookings'],
    'bookings.inspect': ['/inspections'],
    'vehicles.view': ['/admin/vehicles'],
    'vehicles.documents': ['/admin/vehicle-documents'],
    'users.view': ['/admin/users'],
    'staff.view': ['/admin/staff'],
    'payments.view': ['/admin/transactions'],
    'disputes.view': ['/disputes'],
    'roles.view': ['/admin/roles'],
    'locations.view': ['/admin/locations'],
    'car-types.view': ['/admin/car-types/type-names'],
    'driver.access': ['/assignments', '/driver/trip-history'],
};

function getNavItems(
    role: string,
    staffRoleId: number | null,
    permissions: string[] | null,
): NavItem[] {
    if (role === 'admin' && staffRoleId !== null && permissions) {
        const allowedRoutes = new Set<string>();

        for (const perm of permissions) {
            const routes = PERMISSION_ROUTE_MAP[perm];

            if (routes) {
                routes.forEach((r) => allowedRoutes.add(r));
            }
        }

        const items: NavItem[] = [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        ];

        if (allowedRoutes.has('/admin/users')) {
            items.push({ title: 'Users', href: '/admin/users', icon: Users });
        }

        if (allowedRoutes.has('/admin/vehicles')) {
            items.push({
                title: 'Cars',
                href: '/admin/vehicles',
                icon: Car,
            });
        }

        if (allowedRoutes.has('/bookings')) {
            items.push({ title: 'Bookings', href: '/bookings', icon: BookOpen });
        }

        if (allowedRoutes.has('/inspections')) {
            items.push({
                title: 'Inspections',
                href: '/inspections',
                icon: ClipboardCheck,
            });
        }

        if (allowedRoutes.has('/admin/transactions')) {
            items.push({
                title: 'Transactions',
                href: '/admin/transactions',
                icon: ReceiptText,
            });
        }

        if (allowedRoutes.has('/disputes')) {
            items.push({ title: 'Disputes', href: '/disputes', icon: Wrench });
        }

        if (allowedRoutes.has('/admin/roles')) {
            items.push({
                title: 'Roles & Permissions',
                href: '/admin/roles',
                icon: Shield,
            });
        }

        if (allowedRoutes.has('/admin/staff')) {
            items.push({ title: 'Staff', href: '/admin/staff', icon: UserCog });
        }

        if (allowedRoutes.has('/admin/locations')) {
            items.push({
                title: 'Locations',
                href: '/admin/locations',
                icon: MapPin,
            });
        }

        if (allowedRoutes.has('/admin/car-types/type-names')) {
            items.push({
                title: 'Car Types',
                href: '/admin/car-types/type-names',
                icon: Settings,
            });
        }

        if (allowedRoutes.has('/assignments')) {
            items.push({
                title: 'My Assignments',
                href: '/assignments',
                icon: Wrench,
            });
        }

        if (allowedRoutes.has('/driver/trip-history')) {
            items.push({
                title: 'Trip History',
                href: '/driver/trip-history',
                icon: BookOpen,
            });
        }

        return items;
    }

    switch (role) {
        case 'admin':
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                {
                    title: 'Car Types',
                    href: '/admin/car-types/type-names',
                    icon: Settings,
                },
                { title: 'Cars', href: '/admin/vehicles', icon: Car },
                { title: 'Browse Cars', href: '/browse-cars', icon: Search },
                { title: 'Bookings', href: '/bookings', icon: BookOpen },
                {
                    title: 'Inspections',
                    href: '/inspections',
                    icon: ClipboardCheck,
                },
                {
                    title: 'Transactions',
                    href: '/admin/transactions',
                    icon: ReceiptText,
                },
                { title: 'My Assignments', href: '/assignments', icon: Wrench },
                { title: 'Disputes', href: '/disputes', icon: Wrench },
                {
                    title: 'Roles & Permissions',
                    href: '/admin/roles',
                    icon: Shield,
                },
                { title: 'Staff', href: '/admin/staff', icon: UserCog },
                { title: 'Users', href: '/admin/users', icon: Users },
                { title: 'Locations', href: '/admin/locations', icon: MapPin },
            ];

        case 'owner':
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'My Cars', href: '/vehicles', icon: Car },
                { title: 'Bookings', href: '/bookings', icon: BookOpen },
                { title: 'My Assignments', href: '/assignments', icon: Wrench },
                {
                    title: 'Received Payments',
                    href: '/payments',
                    icon: CreditCard,
                },
            ];
        case 'driver':
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'My Assignments', href: '/assignments', icon: Wrench },
                {
                    title: 'Trip History',
                    href: '/driver/trip-history',
                    icon: BookOpen,
                },
            ];

        default: // customer
            return [
                { title: 'Browse Cars', href: '/browse-cars', icon: Search },
                { title: 'My Bookings', href: '/bookings', icon: BookOpen },
                {
                    title: 'Payment History',
                    href: '/payments',
                    icon: CreditCard,
                },
            ];
    }
}

function getDashboardUrl(): string {
    return '/dashboard';
}

export function AppSidebar() {
    const { auth, notifications } = usePage<{
        auth: Auth;
        notifications: { unread_count: number };
    }>().props;
    const role = auth.user?.role ?? 'customer';
    const staffRoleId = auth.user?.staff_role_id ?? null;
    const permissions = auth.user?.permissions ?? null;
    const dashboardUrl = getDashboardUrl();
    const navItems = [
        ...getNavItems(role, staffRoleId, permissions),
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
            badge: notifications.unread_count,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
