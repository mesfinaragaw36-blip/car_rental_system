import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Car as CarIcon,
    CheckCircle,
    Gauge,
    MapPin,
    Shield,
    Star,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AccountMenu } from '@/components/account-menu';
import BrandLogo from '@/components/brand-logo';
import { NotificationBell } from '@/components/notification-bell';
import { StarRating } from '@/components/rating-stars';
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
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';
import type { Auth } from '@/types';

const HERO_CAR_IMAGE = '/images/hero-car.png';

const GUEST_NAV_ITEMS = [
    { name: 'Features', link: '#features' },
    { name: 'Our Fleet', link: '#fleet' },
    { name: 'How it works', link: '#how-it-works' },
    { name: 'Contact', link: '#contact' },
];

const FEATURES = [
    {
        icon: Shield,
        title: 'Verified & Safe',
        desc: 'Every owner and vehicle passes our trust verification before going live.',
    },
    {
        icon: MapPin,
        title: 'Flexible Pickup',
        desc: 'Choose your pickup and return location with scheduling that fits you.',
    },
    {
        icon: Star,
        title: 'Trusted Owners',
        desc: 'Rated and reviewed owners, so you always know what to expect.',
    },
    {
        icon: Gauge,
        title: 'Fair Pricing',
        desc: 'Transparent daily rates with no hidden fees — ever.',
    },
];

const STEPS = [
    {
        step: '01',
        title: 'Create an account',
        desc: 'Sign up as a customer, owner, or driver in under a minute.',
    },
    {
        step: '02',
        title: 'Browse or list',
        desc: 'Find the perfect car or list your own vehicle to earn.',
    },
    {
        step: '03',
        title: 'Book & drive',
        desc: 'Confirm your booking, pay securely, and hit the road.',
    },
];

const STATS = [
    { value: '500+', label: 'Cars listed' },
    { value: '1,000+', label: 'Happy drivers' },
    { value: '4.8', label: 'Average rating' },
    { value: '24/7', label: 'Support' },
];

const TRUST_POINTS = ['No hidden fees', 'Verified vehicles', 'Instant booking'];

function Reveal({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn(
                'transition-all duration-700 ease-out will-change-transform',
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0',
                className,
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function getDashboardUrl(): string {
    return '/dashboard';
}

interface CarImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    daily_price: string;
    fuel_type: string;
    transmission: string;
    category: string;
    color: string;
    average_rating?: number;
    review_count?: number;
    is_currently_booked?: boolean;
    images: CarImage[];
}

interface Props {
    cars: Car[];
}

export default function Welcome({ cars = [] }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const role = user?.role;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isGuest = !role;
    const isConsumer = role === 'customer' || role === 'driver';
    const dashboardUrl = !isGuest && !isConsumer ? getDashboardUrl() : null;

const navItems = isConsumer
        ? [
              { name: 'Our Fleet', link: '#fleet' },
              ...(role === 'customer'
                  ? [
                        { name: 'My Bookings', link: '/bookings' },
                        { name: 'Payment History', link: '/payments' },
                    ]
                  : []),
              ...(role === 'driver'
                  ? [{ name: 'My Assignments', link: '/driver/assignments' }]
                  : []),
          ]
        : GUEST_NAV_ITEMS;

    const authButton = user ? (
        <div className="flex items-center gap-2">
            <NotificationBell />
            <AccountMenu user={user} />
        </div>
    ) : (
        <>
            <NavbarButton variant="secondary" href={login()}>
                Log in
            </NavbarButton>
            <NavbarButton href={register()}>Get started</NavbarButton>
        </>
    );

    return (
        <>
            <Head title="Welcome — Ethio Car Rental" />

            <div className="min-h-screen bg-background text-foreground">
                {/* Nav */}
                <Navbar>
                    <NavBody>
                        <NavbarLogo>
                            <BrandLogo />
                        </NavbarLogo>
                        <NavItems items={navItems} />
                        <div className="flex items-center gap-3">
                            {authButton}
                        </div>
                    </NavBody>

                    <MobileNav>
                        <MobileNavHeader>
                            <NavbarLogo>
                                <BrandLogo />
                            </NavbarLogo>
                            <div className="flex items-center gap-2">
                                {user && <NotificationBell />}
                                {user && <AccountMenu user={user} />}
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
                                <a
                                    key={item.name}
                                    href={item.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-xl px-4 py-3 font-medium text-foreground/70 transition-colors hover:bg-neutral-100 hover:text-foreground"
                                >
                                    {item.name}
                                </a>
                            ))}
                            {!user && (
                                <div
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-4"
                                >
                                    <NavbarButton
                                        href={register()}
                                        className="w-full"
                                    >
                                        Get started
                                    </NavbarButton>
                                    <NavbarButton
                                        href={login()}
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

                {/* Hero */}
                <section className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden px-6 pt-24 pb-16">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, #1A365D 1px, transparent 1px)',
                            backgroundSize: '36px 36px',
                        }}
                    />

                    <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center lg:grid-cols-2 lg:gap-12">
                        <div className="py-12 text-center lg:py-0 lg:text-left">
                            <div className="inline-flex animate-in items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1.5 text-[11px] font-semibold tracking-widest text-primary uppercase duration-700 fade-in slide-in-from-bottom-4">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                                Available across Ethiopia
                            </div>

                            <h1 className="mt-6 animate-in text-4xl leading-[1.05] font-extrabold tracking-tight delay-100 duration-700 fade-in slide-in-from-bottom-4 sm:text-5xl lg:text-6xl xl:text-7xl">
                                Rent a car,
                                <br />
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    your way.
                                </span>
                            </h1>

                            <p className="mx-auto mt-5 max-w-md animate-in text-base leading-relaxed text-muted-foreground delay-200 duration-700 fade-in slide-in-from-bottom-4 sm:text-lg lg:mx-0">
                                The simplest way to rent a vehicle or earn by
                                listing yours. Verified owners, flexible
                                bookings, zero hassle.
                            </p>

                            <div className="mt-8 flex animate-in flex-col items-center gap-3 delay-300 duration-700 fade-in slide-in-from-bottom-4 sm:flex-row lg:justify-start">
                                {isConsumer ? (
                                    <>
                                        
                                            <a href="#fleet"
                                            className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                                        >
                                            Browse Cars{' '}
                                            <ArrowRight className="ml-1.5 inline h-4 w-4" />
                                        </a>
                                        <Link
                                            href={
                                                role === 'driver'
                                                    ? '/driver/assignments'
                                                    : '/bookings'
                                            }
                                            className="rounded-full border border-border bg-white/60 px-7 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-white"
                                        >
                                            {role === 'driver'
                                                ? 'My Assignments'
                                                : 'My Bookings'}
                                        </Link>
                                    </>
                                ) : dashboardUrl ? (
                                    <Link
                                        href={dashboardUrl}
                                        className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                                    >
                                        Go to Dashboard{' '}
                                        <ArrowRight className="ml-1.5 inline h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                                        >
                                            Start for free{' '}
                                            <ArrowRight className="ml-1.5 inline h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="rounded-full border border-border bg-white/60 px-7 py-3 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:bg-white"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-8 flex animate-in flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground delay-500 duration-700 fade-in slide-in-from-bottom-4 lg:justify-start">
                                {TRUST_POINTS.map((point) => (
                                    <span
                                        key={point}
                                        className="flex items-center gap-1.5"
                                    >
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        {point}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Hero car */}
                        <div className="relative z-10 mx-auto mt-6 w-full max-w-xl lg:mt-0">
                            <div
                                className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
                                style={{
                                    backgroundColor: 'rgba(255, 107, 0, 0.14)',
                                }}
                            />
                            <div
                                className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
                                style={{
                                    backgroundColor: 'rgba(26, 54, 93, 0.1)',
                                }}
                            />

                            <div className="relative animate-in delay-200 duration-1000 zoom-in-95 fade-in">
                                <img
                                    src={HERO_CAR_IMAGE}
                                    alt="Featured car"
                                    className="relative z-10 w-full animate-float drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats strip */}
                <section className="border-y border-black/5 bg-white">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-12 sm:grid-cols-4">
                        {STATS.map((stat, index) => (
                            <Reveal key={stat.label} delay={index * 90}>
                                <div className="text-center">
                                    <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="scroll-mt-24 bg-white py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold tracking-widest text-primary uppercase">
                                Why Ethio Car Rental
                            </p>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Everything you need, nothing you don&apos;t.
                            </h2>
                            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                                Built for drivers, owners, and everyone in
                                between.
                            </p>
                        </Reveal>

                        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-black/5 bg-black/5 sm:grid-cols-2 lg:grid-cols-4">
                            {FEATURES.map(
                                ({ icon: Icon, title, desc }, index) => (
                                    <Reveal
                                        key={title}
                                        delay={index * 80}
                                        className="h-full"
                                    >
                                        <div className="group h-full bg-white p-8 transition-colors duration-300 hover:bg-neutral-50">
                                            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-base font-bold tracking-tight">
                                                {title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {desc}
                                            </p>
                                        </div>
                                    </Reveal>
                                ),
                            )}
                        </div>
                    </div>
                </section>

                {/* Fleet */}
                <section id="fleet" className="scroll-mt-24 py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold tracking-widest text-primary uppercase">
                                Our fleet
                            </p>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Ready to drive today.
                            </h2>
                            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                                Tap a car to see its details and book it in a
                                few clicks.
                            </p>
                        </Reveal>

                        {cars.length > 0 ? (
                            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {cars.map((car, index) => {
                                    const image =
                                        car.images?.find(
                                            (img) => img.is_primary,
                                        ) ?? car.images?.[0];

                                    return (
                                        <Reveal
                                            key={car.id}
                                            delay={index * 80}
                                            className="h-full"
                                        >
                                            <Link
                                                href={`/cars/${car.id}`}
                                                prefetch
                                                className="group block h-full overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            >
                                                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                                    {image ? (
                                                        <img
                                                            src={`/storage/${image.image_path}`}
                                                            alt={`${car.brand} ${car.model}`}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-neutral-300">
                                                            <CarIcon className="h-12 w-12" />
                                                        </div>
                                                    )}
                                                    {car.is_currently_booked && (
                                                        <span className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                                            Booked
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between gap-3 p-5">
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-base font-bold tracking-tight text-foreground">
                                                            {car.brand}{' '}
                                                            {car.model}
                                                        </h3>
                                                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            {car.transmission} ·{' '}
                                                            {car.fuel_type}
                                                        </p>
                                                        {typeof car.average_rating ===
                                                            'number' && (
                                                            <div className="mt-1 flex items-center gap-1.5">
                                                                <StarRating
                                                                    value={
                                                                        car.average_rating
                                                                    }
                                                                    size="sm"
                                                                />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {car.average_rating}{' '}
                                                                    ·{' '}
                                                                    {car.review_count ??
                                                                        0}{' '}
                                                                    review
                                                                    {(car.review_count ??
                                                                        0) === 1
                                                                        ? ''
                                                                        : 's'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-lg font-bold text-foreground">
                                                            ETB{' '}
                                                            {Number(
                                                                car.daily_price,
                                                            ).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            per day
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </Reveal>
                                    );
                                })}
                            </div>
                        ) : (
                            <Reveal delay={120}>
                                <div className="mt-14 flex flex-col items-center gap-2 rounded-3xl border border-black/5 bg-white py-16 text-center">
                                    <CarIcon className="h-10 w-10 text-neutral-300" />
                                    <p className="text-lg font-semibold text-foreground">
                                        No cars available right now.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Check back soon — new vehicles are added
                                        regularly.
                                    </p>
                                </div>
                            </Reveal>
                        )}
                    </div>
                </section>

                {/* How it works */}
                <section
                    id="how-it-works"
                    className="scroll-mt-24 bg-white py-24"
                >
                    <div className="mx-auto max-w-6xl px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold tracking-widest text-primary uppercase">
                                How it works
                            </p>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Up and running in minutes.
                            </h2>
                        </Reveal>

                        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
                            {STEPS.map(({ step, title, desc }, index) => (
                                <Reveal key={step} delay={index * 100}>
                                    <div className="group relative px-2 md:px-8">
                                        {index < STEPS.length - 1 && (
                                            <div className="absolute top-8 right-0 hidden h-px w-8 bg-black/10 md:block" />
                                        )}
                                        <span className="bg-gradient-to-br from-primary/25 to-accent/25 bg-clip-text text-5xl font-extrabold text-transparent transition-all duration-300 group-hover:from-primary/60 group-hover:to-accent/60">
                                            {step}
                                        </span>
                                        <h3 className="mt-4 text-lg font-bold tracking-tight">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {desc}
                                        </p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                {isGuest && (
                    <section className="mx-6 mb-6 overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-16">
                        <Reveal>
                            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Ready to hit the road?
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-base text-white/70">
                                Join thousands of customers and owners already
                                using Ethio Car Rental.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    href={register()}
                                    className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    Create a free account{' '}
                                    <ArrowRight className="ml-1.5 inline h-4 w-4" />
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
                                >
                                    Log in
                                </Link>
                            </div>
                        </Reveal>
                    </section>
                )}

                {/* Footer */}
                <footer id="contact" className="scroll-mt-24 px-6 pb-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white/70 px-6 py-6 text-sm text-muted-foreground shadow-sm backdrop-blur-xl sm:flex-row">
                        <div className="flex items-center gap-2.5 font-semibold text-foreground">
                            <img
                                src="/images/logo.png"
                                alt="Ethio Car Rental"
                                className="h-6 w-6 rounded-full object-cover"
                            />
                            Ethio Car Rental
                        </div>
                        <p>
                            &copy; {new Date().getFullYear()} Ethio Car Rental.
                            All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
