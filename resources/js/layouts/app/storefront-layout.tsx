import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AccountMenu } from '@/components/account-menu';
import BrandLogo from '@/components/brand-logo';
import { NotificationBell } from '@/components/notification-bell';
import {
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    Navbar,
    NavbarButton,
    NavBody,
    NavbarLogo,
    NavItems,
} from '@/components/ui/resizable-navbar';
import { home, login, register } from '@/routes';
import { index as bookingsIndex } from '@/routes/bookings';
import { index as browseCars } from '@/routes/cars';
import { index as assignmentsIndex } from '@/routes/driver/assignments';
import { index as paymentsIndex } from '@/routes/payments';
import type { Auth } from '@/types';

interface NavItem {
    name: string;
    link: string;
}

export default function StorefrontLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems: NavItem[] = [
        { name: 'Browse Cars', link: browseCars.url() },
    ];

    if (user?.role === 'customer') {
        navItems.push(
            { name: 'My Bookings', link: bookingsIndex.url() },
            { name: 'Payment History', link: paymentsIndex.url() },
        );
    } else if (user?.role === 'driver') {
        navItems.push({
            name: 'My Assignments',
            link: assignmentsIndex.url(),
        });
    }

    const accountMenu = user ? <AccountMenu user={user} /> : null;

    const rightSide = user ? (
        <div className="flex items-center gap-2">
            <NotificationBell />
            {accountMenu}
        </div>
    ) : (
        <>
            <NavbarButton variant="secondary" href={login.url()}>
                Log in
            </NavbarButton>
            <NavbarButton href={register.url()}>
                Get started <ArrowRight className="ml-1 inline h-4 w-4" />
            </NavbarButton>
        </>
    );

    return (
        <>
            <Navbar>
                <NavBody>
                    <NavbarLogo>
                        <Link href={home.url()} prefetch>
                            <BrandLogo />
                        </Link>
                    </NavbarLogo>

                    <NavItems items={navItems} />

                    <div className="flex items-center gap-3">{rightSide}</div>
                </NavBody>

                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo>
                            <Link href={home.url()} prefetch>
                                <BrandLogo />
                            </Link>
                        </NavbarLogo>
                        <div className="flex items-center gap-2">
                            {user && <NotificationBell />}
                            {accountMenu}
                            <MobileNavToggle
                                isOpen={isMobileMenuOpen}
                                onClick={() =>
                                    setIsMobileMenuOpen((open) => !open)
                                }
                            />
                        </div>
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="rounded-xl px-4 py-3 font-medium text-foreground/70 transition-colors hover:bg-neutral-100 hover:text-foreground"
                            >
                                {item.name}
                            </Link>
                        ))}
                        {!user && (
                            <div
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-4"
                            >
                                <NavbarButton
                                    href={register.url()}
                                    className="w-full"
                                >
                                    Get started
                                </NavbarButton>
                                <NavbarButton
                                    href={login.url()}
                                    variant="secondary"
                                    className="w-full"
                                >
                                    Log in
                                </NavbarButton>
                            </div>
                        )}
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-24 pb-16">
                {children}
            </main>
        </>
    );
}
