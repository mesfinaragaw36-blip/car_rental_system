import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
    name: string;
    link: string;
}

const NavbarScrolledContext = createContext(false);

function useNavbarScrolled() {
    return useContext(NavbarScrolledContext);
}

export function Navbar({ children }: { children: ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 16);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <NavbarScrolledContext.Provider value={scrolled}>
            <header className="fixed inset-x-0 top-0 z-50 w-full px-4 text-sm">
                <div
                    className={cn(
                        'mx-auto max-w-7xl transition-all duration-300',
                        scrolled && 'mt-2 rounded-full border border-black/10 bg-background/80 shadow-lg shadow-black/5 backdrop-blur-xl',
                    )}
                >
                    {children}
                </div>
            </header>
        </NavbarScrolledContext.Provider>
    );
}

export function NavBody({ children }: { children: ReactNode }) {
    const scrolled = useNavbarScrolled();

    return (
        <div
            className={cn(
                'hidden items-center justify-between gap-4 transition-all duration-300 lg:flex',
                scrolled ? 'px-5 py-1.5' : 'px-6 py-3',
            )}
        >
            {children}
        </div>
    );
}

export function NavItems({ items }: { items: NavItem[] }) {
    return (
        <div className="hidden items-center gap-1 lg:flex">
            {items.map((item) => (
                <a
                    key={item.name}
                    href={item.link}
                    className="group relative rounded-full px-4 py-2 font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                    <span className="absolute inset-0 scale-x-75 rounded-full bg-neutral-100 opacity-0 transition-all duration-200 group-hover:scale-x-100 group-hover:opacity-100" />
                    <span className="relative z-10">{item.name}</span>
                </a>
            ))}
        </div>
    );
}

export function NavbarLogo({ children }: { children: ReactNode }) {
    return <span className="flex items-center gap-2.5 text-base font-bold tracking-tight">{children}</span>;
}

type NavbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary';
    href?: ComponentProps<typeof Link>['href'];
};

export function NavbarButton({ variant = 'primary', href, className, children, ...props }: NavbarButtonProps) {
    const classes = cn(
        'inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5',
        variant === 'primary'
            ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md'
            : 'text-foreground/70 hover:text-foreground',
        className,
    );

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={classes} {...props}>
            {children}
        </button>
    );
}

export function MobileNav({ children }: { children: ReactNode }) {
    return <div className="lg:hidden">{children}</div>;
}

export function MobileNavHeader({ children }: { children: ReactNode }) {
    const scrolled = useNavbarScrolled();

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-4 transition-all duration-300',
                scrolled ? 'px-5 py-1.5' : 'px-6 py-3',
            )}
        >
            {children}
        </div>
    );
}

export function MobileNavToggle({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-foreground transition-colors hover:bg-neutral-100"
        >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
    );
}

export function MobileNavMenu({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 absolute inset-x-4 top-[calc(100%+8px)] z-50 rounded-3xl border border-black/10 bg-background p-6 shadow-xl backdrop-blur-xl">
            <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-foreground/70 transition-colors hover:bg-neutral-100 hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col gap-1">{children}</div>
        </div>
    );
}
