import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid, Car, Users, CreditCard,
    Shield, UserCog, BookOpen, Settings, Building2, Wrench, Search, MapPin,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';

const PERMISSION_ROUTE_MAP: Record<string, string[]> = {
    users: ['/admin/users'],
    vehicles: ['/admin/vehicles', '/admin/vehicle-images', '/admin/vehicle-documents'],
    staff: ['/admin/staff'],
    payments: ['/admin/payments'],
};

function getNavItems(role: string, staffRoleId: number | null, permissions: string[] | null): NavItem[] {
    if (role === 'admin' && staffRoleId !== null && permissions) {
        const allowedRoutes = new Set<string>();

        for (const perm of permissions) {
            const routes = PERMISSION_ROUTE_MAP[perm];

            if (routes) {
routes.forEach((r) => allowedRoutes.add(r));
}
        }

        const items: NavItem[] = [{ title: 'Dashboard', href: '/dashboard', icon: LayoutGrid }];

        if (allowedRoutes.has('/admin/users')) {
            items.push({ title: 'Users', href: '/admin/users', icon: Users });
        }

        if (allowedRoutes.has('/admin/vehicles')) {
            items.push({ title: 'Vehicles (Admin)', href: '/admin/vehicles', icon: Car });
        }

        items.push({ title: 'Bookings', href: '/bookings', icon: BookOpen });

        if (allowedRoutes.has('/admin/payments')) {
            items.push({ title: 'Payments', href: '/payments', icon: CreditCard });
        }

        return items;
    }

    switch (role) {
        case 'admin':
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Car Types', href: '/admin/car-types/type-names', icon: Settings },
                { title: 'My Vehicles', href: '/vehicles', icon: Car },
                { title: 'Vehicles (Admin)', href: '/admin/vehicles', icon: Building2 },
                { title: 'Browse Cars', href: '/browse-cars', icon: Search },
                { title: 'Bookings', href: '/bookings', icon: BookOpen },
                { title: 'Payments', href: '/payments', icon: CreditCard },
                { title: 'My Assignments', href: '/assignments', icon: Wrench },
                { title: 'Drivers', href: '/admin/drivers', icon: UserCog },
                { title: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
                { title: 'Staff', href: '/admin/staff', icon: UserCog },
                { title: 'Users', href: '/admin/users', icon: Users },
                { title: 'Locations', href: '/admin/locations', icon: MapPin },
            ];

        case 'owner':
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'My Vehicles', href: '/vehicles', icon: Car },
                { title: 'Bookings', href: '/bookings', icon: BookOpen },
                { title: 'My Assignments', href: '/assignments', icon: Wrench },
                { title: 'Received Payments', href: '/payments', icon: CreditCard },
            ];

        case 'driver':
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'My Assignments', href: '/assignments', icon: Wrench },
                { title: 'Available Trips', href: '/driver/available-bookings', icon: Search },
                { title: 'Trip History', href: '/driver/trip-history', icon: BookOpen },
            ];

        default: // customer
            return [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Browse Cars', href: '/browse-cars', icon: Search },
                { title: 'My Bookings', href: '/bookings', icon: BookOpen },
                { title: 'Payment History', href: '/payments', icon: CreditCard },
            ];
    }
}

function getDashboardUrl(): string {
    return '/dashboard';
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth.user?.role ?? 'customer';
    const staffRoleId = auth.user?.staff_role_id ?? null;
    const permissions = auth.user?.permissions ?? null;
    const dashboardUrl = getDashboardUrl();
    const navItems = getNavItems(role, staffRoleId, permissions);

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
