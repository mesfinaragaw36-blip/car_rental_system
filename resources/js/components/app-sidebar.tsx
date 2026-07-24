import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Car,
    Users,
    FileText,
    CreditCard,
    UserCircle,
    List,
    Plus,
    CheckCircle,
    ClipboardList,
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

function getNavItems(role: string): NavItem[] {
    switch (role) {
        case 'admin':
            return [
                { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
                { title: 'Vehicles', href: '/admin/vehicles', icon: Car },
                { title: 'Vehicle Images', href: '/admin/vehicle-images', icon: FileText },
                { title: 'Vehicle Documents', href: '/admin/vehicle-documents', icon: ClipboardList },
            ];

        case 'owner':
            return [
                { title: 'Dashboard', href: '/owner/dashboard', icon: LayoutGrid },
                { title: 'My Vehicles', href: '/owner/vehicles', icon: Car },
                { title: 'Add Vehicle', href: '/owner/vehicles/create', icon: Plus },
            ];

        case 'driver':
            return [
                { title: 'Dashboard', href: '/driver/dashboard', icon: LayoutGrid },
            ];

        default:
            return [
                { title: 'Dashboard', href: '/customer/dashboard', icon: LayoutGrid },
                { title: 'Browse Cars', href: '/customer/cars', icon: Car },
                { title: 'My Bookings', href: '/customer/bookings', icon: List },
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
    const dashboardUrl = getDashboardUrl(role);
    const navItems = getNavItems(role);

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
