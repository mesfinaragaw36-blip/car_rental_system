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
    BarChart3,
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
    'reports.view': ['/admin/reports'],
    'disputes.view': ['/disputes'],
    'roles.view': ['/admin/roles'],
    'locations.view': ['/admin/locations'],
    'car-types.view': ['/admin/car-types/configurations'],

    // Driver permissions
    'driver.access': [
        '/driver/assignments',
        '/driver/trip-history',
    ],
};

function getNavItems(
    role: string,
    staffRoleId: number | null,
    permissions: string[] | null,
): NavItem[] {
    /*
     * Staff accounts with assigned permissions
     */
    if (role === 'admin' && staffRoleId !== null && permissions) {
        const allowedRoutes = new Set<string>();

        for (const permission of permissions) {
            const routes = PERMISSION_ROUTE_MAP[permission];

            if (routes) {
                routes.forEach((route) => {
                    allowedRoutes.add(route);
                });
            }
        }

        const items: NavItem[] = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
        ];

        if (allowedRoutes.has('/admin/users')) {
            items.push({
                title: 'Users',
                href: '/admin/users',
                icon: Users,
            });
        }

        if (allowedRoutes.has('/admin/vehicles')) {
            items.push({
                title: 'Cars',
                href: '/admin/vehicles',
                icon: Car,
            });
        }

        if (allowedRoutes.has('/bookings')) {
            items.push({
                title: 'Bookings',
                href: '/bookings',
                icon: BookOpen,
            });
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

        if (allowedRoutes.has('/admin/reports')) {
            items.push({
                title: 'Reports',
                href: '/admin/reports',
                icon: BarChart3,
            });
        }

        if (allowedRoutes.has('/disputes')) {
            items.push({
                title: 'Disputes',
                href: '/disputes',
                icon: Wrench,
            });
        }

        if (allowedRoutes.has('/admin/roles')) {
            items.push({
                title: 'Roles & Permissions',
                href: '/admin/roles',
                icon: Shield,
            });
        }

        if (allowedRoutes.has('/admin/staff')) {
            items.push({
                title: 'Staff',
                href: '/admin/staff',
                icon: UserCog,
            });
        }

        if (allowedRoutes.has('/admin/locations')) {
            items.push({
                title: 'Locations',
                href: '/admin/locations',
                icon: MapPin,
            });
        }

        if (allowedRoutes.has('/admin/car-types/configurations')) {
            items.push({
                title: 'Car Types',
                href: '/admin/car-types/configurations',
                icon: Settings,
            });
        }

        if (allowedRoutes.has('/driver/assignments')) {
            items.push({
                title: 'My Assignments',
                href: '/driver/assignments',
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

    /*
     * Regular roles
     */
    switch (role) {
        case 'admin':
            return [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'Car Types',
                    href: '/admin/car-types/configurations',
                    icon: Settings,
                },
                {
                    title: 'Cars',
                    href: '/admin/vehicles',
                    icon: Car,
                },
                {
                    title: 'Bookings',
                    href: '/bookings',
                    icon: BookOpen,
                },
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
                {
                    title: 'Reports',
                    href: '/admin/reports',
                    icon: BarChart3,
                },
                {
                    title: 'Disputes',
                    href: '/disputes',
                    icon: Wrench,
                },
                {
                    title: 'Roles & Permissions',
                    href: '/admin/roles',
                    icon: Shield,
                },
                {
                    title: 'Staff',
                    href: '/admin/staff',
                    icon: UserCog,
                },
                {
                    title: 'Users',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'Locations',
                    href: '/admin/locations',
                    icon: MapPin,
                },
                {
                    title: 'Driver Assignments',
                    href: '/admin/driver/assignments',
                    icon: Wrench,
                },
            ];

        case 'owner':
            return [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'My Cars',
                    href: '/vehicles',
                    icon: Car,
                },
                {
                    title: 'Bookings',
                    href: '/bookings',
                    icon: BookOpen,
                },
                {
                    title: 'Received Payments',
                    href: '/payments',
                    icon: CreditCard,
                },
            ];

        case 'driver':
            return [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutGrid,
                },
                {
                    title: 'My Assignments',
                    href: '/driver/assignments',
                    icon: Wrench,
                },
                {
                    title: 'Trip History',
                    href: '/driver/trip-history',
                    icon: BookOpen,
                },
            ];

        default:
            return [
                {
                    title: 'Browse Cars',
                    href: '/browse-cars',
                    icon: Search,
                },
                {
                    title: 'My Bookings',
                    href: '/bookings',
                    icon: BookOpen,
                },
                {
                    title: 'Payment History',
                    href: '/payments',
                    icon: CreditCard,
                },
            ];
    }
}

export function AppSidebar() {
    const { auth, notifications } = usePage<{
        auth: Auth;
        notifications: {
            unread_count: number;
        };
    }>().props;

    const role = auth.user?.role ?? 'customer';
    const staffRoleId = auth.user?.staff_role_id ?? null;
    const permissions = auth.user?.permissions ?? null;

    const navItems: NavItem[] = [
        ...getNavItems(role, staffRoleId, permissions),
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
            badge: notifications.unread_count,
        },
    ];

    /*
     * Drivers use /driver/assignments.
     * Admins use /admin/driver/assignments.
     * The old /assignments route is no longer used here.
     */
    const dashboardUrl = '/dashboard';

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