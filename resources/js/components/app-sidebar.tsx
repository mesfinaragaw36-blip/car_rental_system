import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Car,
    Users,
    CreditCard,
    List,
    ClipboardList,
    Shield,
    UserCog,
    BookOpen,
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
    users: ['/admin/users'],
    vehicles: ['/admin/vehicles', '/admin/vehicle-images', '/admin/vehicle-documents'],
    staff: ['/admin/staff'],
    payments: ['/admin/payments'],
};

function getNavItems(role: string, staffRoleId: number | null, permissions: string[] | null): NavItem[] {
    // Staff members see sidebar based on their role's permissions
    if (role === 'admin' && staffRoleId !== null && permissions) {
        const allowedRoutes = new Set<string>();

        for (const perm of permissions) {
            const routes = PERMISSION_ROUTE_MAP[perm];
            if (routes) {
                for (const route of routes) {
                    allowedRoutes.add(route);
                }
            }
        }

        const items: NavItem[] = [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid }];

        if (allowedRoutes.has('/admin/users')) {
            items.push({ title: 'Users', href: '/admin/users', icon: Users });
        }
        if (allowedRoutes.has('/admin/vehicles')) {
            items.push({ title: 'Vehicles', href: '/admin/vehicles', icon: Car });
        }
        if (allowedRoutes.has('/admin/payments')) {
            items.push({ title: 'Payments', href: '/admin/payments', icon: CreditCard });
        }

        return items;
    }

    switch (role) {
        case 'admin':
            return [
                { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
                { title: 'Users', href: '/admin/users', icon: Users },
                { title: 'Drivers', href: '/admin/drivers', icon: UserCog },
                { title: 'Staff', href: '/admin/staff', icon: UserCog },
                { title: 'Roles & Permissions', href: '/admin/roles', icon: Shield },
                { title: 'Vehicles', href: '/admin/vehicles', icon: Car },
                { title: 'Bookings', href: '/admin/bookings', icon: BookOpen },
                { title: 'Payments', href: '/admin/payments', icon: CreditCard },
            ];

        case 'owner':
            return [
                { title: 'Dashboard', href: '/owner/dashboard', icon: LayoutGrid },
                { title: 'My Vehicles', href: '/owner/vehicles', icon: Car },
                { title: 'Bookings', href: '/owner/bookings', icon: ClipboardList },
                { title: 'Received Payments', href: '/owner/payments', icon: CreditCard },
            ];

        case 'driver':
            return [
                { title: 'Dashboard', href: '/driver/dashboard', icon: LayoutGrid },
                { title: 'My Assignments', href: '/driver/assignments', icon: ClipboardList },
            ];

        default:
            return [
                { title: 'Dashboard', href: '/customer/dashboard', icon: LayoutGrid },
                { title: 'Browse Cars', href: '/customer/browse-cars', icon: Car },
                { title: 'My Bookings', href: '/customer/bookings', icon: List },
                { title: 'Payment History', href: '/customer/payments', icon: CreditCard },
            ];
    }
}

function getDashboardUrl(role: string): string {
    switch (role) {
        case 'admin':  return '/admin/dashboard';
        case 'owner':  return '/owner/dashboard';
        case 'driver': return '/driver/dashboard';
        default:       return '/customer/dashboard';
    }
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth.user?.role ?? 'customer';
    const staffRoleId = auth.user?.staff_role_id ?? null;
    const permissions = auth.user?.permissions ?? null;
    const dashboardUrl = getDashboardUrl(role);
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
