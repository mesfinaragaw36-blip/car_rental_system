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
        title: 'Curated Fleet',
        desc: 'Every vehicle is inspected and rated, so you always know what to expect.',
    },
    {
        icon: Gauge,
        title: 'Fair Pricing',
        desc: 'Transparent daily rates with no hidden fees, ever.',
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

const TRUST_POINTS = [
    'No hidden fees',
    'Verified vehicles',
    'Instant booking',
];

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

    const dashboardUrl =
        !isGuest && !isConsumer ? getDashboardUrl() : null;

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
                  ? [
                        {
                            name: 'My Assignments',
                            link: '/driver/assignments',
                        },
                    ]
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
            <NavbarButton
                variant="secondary"
                href={login()}
                className="border-[#BCEBFA] bg-white/80 text-[#16425B] hover:bg-[#E8F8FC]"
            >
                Log in
            </NavbarButton>

            <NavbarButton
                href={register()}
                className="bg-[#007BA7] text-white hover:bg-[#16425B]"
            >
                Get started
            </NavbarButton>
        </>
    );

    return (
        <>
            <Head title="Welcome — Ethio Car Rental" />

            <div className="min-h-screen bg-[#F7FCFF] text-[#16425B]">

                {/* =====================================================
                    NAVBAR
                ====================================================== */}

                <Navbar className="border-[#D7F2F8] bg-[#F7FCFF]/90">
                    <NavBody>
                        <NavbarLogo>
                            <BrandLogo />
                        </NavbarLogo>

                        <NavItems
                            items={navItems}
                            className="text-[#16425B]/70"
                        />

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
                            className="bg-[#F7FCFF]"
                        >
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.link}
                                    onClick={() =>
                                        setIsMobileMenuOpen(false)
                                    }
                                    className="rounded-xl px-4 py-3 font-medium text-[#16425B]/70 transition-colors hover:bg-[#E8F8FC] hover:text-[#007BA7]"
                                >
                                    {item.name}
                                </a>
                            ))}

                            {!user && (
                                <div
                                    onClick={() =>
                                        setIsMobileMenuOpen(false)
                                    }
                                    className="mt-3 flex flex-col gap-3 border-t border-[#D7F2F8] pt-4"
                                >
                                    <NavbarButton
                                        href={register()}
                                        className="w-full bg-[#007BA7] text-white"
                                    >
                                        Get started
                                    </NavbarButton>

                                    <NavbarButton
                                        href={login()}
                                        variant="secondary"
                                        className="w-full border-[#BCEBFA] bg-white text-[#16425B]"
                                    >
                                        Log in
                                    </NavbarButton>
                                </div>
                            )}
                        </MobileNavMenu>
                    </MobileNav>
                </Navbar>

                {/* =====================================================
                    HERO
                ====================================================== */}

                <section className="relative flex min-h-[780px] w-full overflow-hidden bg-[#16425B] px-6 pt-28 pb-16 lg:min-h-[850px]">

                    {/* Background pattern */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
                            backgroundSize: '36px 36px',
                        }}
                    />

                    {/* Blue glow */}
                    <div className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-[#00C4CC]/20 blur-[130px]" />

                    <div className="pointer-events-none absolute -right-32 top-20 h-[520px] w-[520px] rounded-full bg-[#87CEEB]/15 blur-[140px]" />

                    <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">

                        {/* LEFT HERO CONTENT */}

                        <div className="py-10 text-center lg:py-0 lg:text-left">

                            <div className="inline-flex animate-in items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#BCEBFA] uppercase backdrop-blur-md duration-700 fade-in slide-in-from-bottom-4">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#87CEEB]" />
                                Available across Ethiopia
                            </div>

                            <h1 className="mt-7 animate-in text-5xl leading-[1.02] font-extrabold tracking-[-0.045em] text-white duration-700 fade-in slide-in-from-bottom-4 sm:text-6xl lg:text-6xl xl:text-7xl">
                                Rent a car,
                                <br />
                                <span className="text-[#87CEEB]">
                                    your way.
                                </span>
                            </h1>

                            <p className="mx-auto mt-6 max-w-xl animate-in text-base leading-7 text-white/70 duration-700 fade-in slide-in-from-bottom-4 delay-200 sm:text-lg lg:mx-0">
                                The simplest way to rent a vehicle or earn by
                                listing yours. Verified owners, flexible
                                bookings, zero hassle.
                            </p>

                            <div className="mt-9 flex animate-in flex-col items-center gap-3 duration-700 fade-in slide-in-from-bottom-4 delay-300 sm:flex-row lg:justify-start">

                                {isConsumer ? (
                                    <>
                                        <a
                                            href="#fleet"
                                            className="group rounded-full bg-[#87CEEB] px-7 py-3.5 text-sm font-semibold text-[#16425B] shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-[#00C4CC] hover:shadow-2xl"
                                        >
                                            Browse Cars
                                            <ArrowRight className="ml-1.5 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </a>

                                        <Link
                                            href={
                                                role === 'driver'
                                                    ? '/driver/assignments'
                                                    : '/bookings'
                                            }
                                            className="rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/15"
                                        >
                                            {role === 'driver'
                                                ? 'My Assignments'
                                                : 'My Bookings'}
                                        </Link>
                                    </>
                                ) : dashboardUrl ? (
                                    <Link
                                        href={dashboardUrl}
                                        className="group rounded-full bg-[#87CEEB] px-7 py-3.5 text-sm font-semibold text-[#16425B] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#00C4CC]"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="ml-1.5 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="group rounded-full bg-[#87CEEB] px-7 py-3.5 text-sm font-semibold text-[#16425B] shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:bg-[#00C4CC]"
                                        >
                                            Start for free
                                            <ArrowRight className="ml-1.5 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>

                                        <Link
                                            href={login()}
                                            className="rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/15"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="mt-9 flex animate-in flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/65 duration-700 fade-in slide-in-from-bottom-4 delay-500 lg:justify-start">
                                {TRUST_POINTS.map((point) => (
                                    <span
                                        key={point}
                                        className="flex items-center gap-1.5"
                                    >
                                        <CheckCircle className="h-4 w-4 text-[#87CEEB]" />
                                        {point}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* =================================================
                            HERO CAR — redesigned "showcase platform" look
                        ================================================== */}

                        <div className="relative mx-auto mt-6 flex h-[470px] w-full max-w-2xl items-center justify-center lg:mt-0 lg:h-[650px]">

                            {/* Large soft ambient glow behind everything */}
                            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[640px] -translate-x-1/2 -translate-y-[45%] rounded-full bg-[#87CEEB]/20 blur-[120px]" />

                            {/* Secondary teal glow, offset for depth */}
                            <div className="pointer-events-none absolute left-[62%] top-[58%] h-[300px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00C4CC]/15 blur-[100px]" />

                            {/* Elliptical "ground" shadow the car sits on */}
                            <div className="pointer-events-none absolute bottom-[9%] left-1/2 h-[46px] w-[78%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-2xl lg:bottom-[11%] lg:h-[56px]" />

                            {/* Radiating light rays for a "showroom spotlight" feel */}
                            <div
                                className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12] lg:h-[600px] lg:w-[600px]"
                                style={{
                                    backgroundImage:
                                        'conic-gradient(from 0deg, transparent 0deg, #FFFFFF 4deg, transparent 10deg, transparent 40deg, #FFFFFF 44deg, transparent 50deg, transparent 80deg, #FFFFFF 84deg, transparent 90deg, transparent 130deg, #FFFFFF 134deg, transparent 140deg, transparent 190deg, #FFFFFF 194deg, transparent 200deg, transparent 260deg, #FFFFFF 264deg, transparent 270deg, transparent 320deg, #FFFFFF 324deg, transparent 330deg)',
                                    borderRadius: '9999px',
                                }}
                            />

                            {/* Thin accent ring for structure */}
                            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#87CEEB]/20 lg:h-[480px] lg:w-[480px]" />

                            {/* Decorative accent dots */}
                            <div className="absolute right-[8%] top-[16%] h-2 w-2 rounded-full bg-[#87CEEB] shadow-[0_0_20px_#87CEEB]" />
                            <div className="absolute left-[10%] top-[30%] h-1.5 w-1.5 rounded-full bg-[#00C4CC]" />
                            <div className="absolute bottom-[22%] right-[13%] h-1.5 w-1.5 rounded-full bg-[#BCEBFA]" />

                            {/* CAR IMAGE — larger, edge-bleeding, angled like a showroom hero shot */}
                            <div className="relative z-10 w-full max-w-[680px] translate-x-2 animate-in duration-1000 zoom-in-95 fade-in lg:translate-x-6">
                                <img
                                    src={HERO_CAR_IMAGE}
                                    alt="Featured premium car"
                                    className="relative z-10 mx-auto w-full scale-110 object-contain drop-shadow-[0_45px_55px_rgba(0,0,0,0.5)] animate-float lg:scale-125"
                                />
                            </div>

                            {/* Floating rating card */}
                            <div className="absolute bottom-[7%] left-[2%] z-20 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/95 px-5 py-4 shadow-2xl backdrop-blur-md">

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F8FC]">
                                    <Star
                                        size={17}
                                        className="fill-[#007BA7] text-[#007BA7]"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-[#16425B]">
                                        4.9 / 5
                                    </p>

                                    <p className="text-xs text-[#5E6A76]">
                                        Customer rating
                                    </p>
                                </div>
                            </div>

                            {/* Floating verified badge */}
                            <div className="absolute right-[2%] top-[12%] z-20 flex items-center gap-2 rounded-full border border-white/20 bg-[#16425B]/80 px-4 py-2.5 shadow-xl backdrop-blur-md">
                                <CheckCircle
                                    size={15}
                                    className="text-[#87CEEB]"
                                />

                                <span className="text-xs font-semibold text-white">
                                    Verified vehicles
                                </span>
                            </div>

                            {/* Small stat chip for extra polish */}
                            <div className="absolute left-[0%] top-[6%] z-20 hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 backdrop-blur-md sm:flex">
                                <Gauge size={13} className="text-[#87CEEB]" />
                                <span className="text-[11px] font-semibold tracking-wide text-white">
                                    500+ vehicles live
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom availability */}
                    <div className="absolute bottom-7 left-0 right-0 z-20">
                        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">

                            <div className="hidden items-center gap-3 sm:flex">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md">
                                    <MapPin
                                        size={17}
                                        className="text-[#87CEEB]"
                                    />
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                                        Available across
                                    </p>

                                    <p className="text-sm font-medium text-white">
                                        Ethiopia
                                    </p>
                                </div>
                            </div>

                            <a
                                href="#fleet"
                                className="ml-auto flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 transition hover:text-[#87CEEB]"
                            >
                                Explore our fleet
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    STATS
                ====================================================== */}

                <section className="border-y border-[#BCEBFA] bg-[#E8F8FC]">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">

                        {STATS.map((stat, index) => (
                            <Reveal key={stat.label} delay={index * 90}>
                                <div className="border-r border-[#BCEBFA] px-6 py-10 text-center last:border-r-0 lg:py-12">
                                    <p className="text-3xl font-extrabold tracking-tight text-[#007BA7] sm:text-4xl">
                                        {stat.value}
                                    </p>

                                    <p className="mt-2 text-[11px] font-semibold tracking-widest text-[#5E6A76] uppercase">
                                        {stat.label}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* =====================================================
                    FEATURES
                ====================================================== */}

                <section
                    id="features"
                    className="scroll-mt-24 bg-[#F7FCFF] py-24 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl px-6">

                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#007BA7] uppercase">
                                Why Ethio Car Rental
                            </p>

                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#16425B] sm:text-4xl">
                                Everything you need,
                                <br />
                                nothing you don't.
                            </h2>

                            <p className="mt-4 text-base text-[#5E6A76] sm:text-lg">
                                Built for drivers, owners, and everyone in
                                between.
                            </p>
                        </Reveal>

                        <div className="mt-14 grid overflow-hidden rounded-3xl border border-[#D7F2F8] bg-[#D7F2F8] sm:grid-cols-2 lg:grid-cols-4">

                            {FEATURES.map(
                                ({ icon: Icon, title, desc }, index) => (
                                    <Reveal
                                        key={title}
                                        delay={index * 80}
                                        className="h-full"
                                    >
                                        <div className="group h-full border-r border-[#D7F2F8] bg-white p-8 transition-all duration-300 hover:bg-[#F7FCFF]">

                                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F8FC] text-[#007BA7] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#CDEFF7]">
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <h3 className="text-base font-bold tracking-tight text-[#16425B]">
                                                {title}
                                            </h3>

                                            <p className="mt-3 text-sm leading-relaxed text-[#5E6A76]">
                                                {desc}
                                            </p>
                                        </div>
                                    </Reveal>
                                ),
                            )}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    FLEET
                ====================================================== */}

                <section
                    id="fleet"
                    className="scroll-mt-24 bg-[#E8F8FC] py-24 lg:py-28"
                >
                    <div className="mx-auto max-w-7xl px-6">

                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#007BA7] uppercase">
                                Our Fleet
                            </p>

                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#16425B] sm:text-4xl">
                                Find the car that fits your journey.
                            </h2>

                            <p className="mt-4 text-base text-[#5E6A76] sm:text-lg">
                                Choose from our available vehicles and find the
                                right ride for your next trip.
                            </p>
                        </Reveal>

                        {cars.length > 0 ? (
                            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

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
                                                className="group block h-full overflow-hidden rounded-[1.75rem] border border-[#D7F2F8] bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#87CEEB] hover:shadow-2xl hover:shadow-[#87CEEB]/15"
                                            >
                                                {/* Image */}
                                                <div className="relative aspect-[4/3] overflow-hidden bg-[#E5F8FC]">

                                                    {image ? (
                                                        <img
                                                            src={`/storage/${image.image_path}`}
                                                            alt={`${car.brand} ${car.model}`}
                                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-[#87CEEB]">
                                                            <CarIcon className="h-14 w-14" />
                                                        </div>
                                                    )}

                                                    {/* Image overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#16425B]/45 via-transparent to-transparent opacity-60" />

                                                    {/* Category */}
                                                    <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#007BA7]/90 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-white uppercase backdrop-blur-md">
                                                        {car.category}
                                                    </span>

                                                    {/* Booked */}
                                                    {car.is_currently_booked && (
                                                        <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                                                            Booked
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="p-6">

                                                    <div className="flex items-start justify-between gap-4">

                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#007BA7] uppercase">
                                                                {car.year} ·{' '}
                                                                {car.color}
                                                            </p>

                                                            <h3 className="mt-2 truncate text-xl font-bold tracking-tight text-[#16425B]">
                                                                {car.brand}{' '}
                                                                {car.model}
                                                            </h3>

                                                            <p className="mt-1.5 text-sm text-[#5E6A76]">
                                                                {car.transmission}{' '}
                                                                ·{' '}
                                                                {car.fuel_type}
                                                            </p>
                                                        </div>

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5F8FC] text-[#007BA7] transition group-hover:bg-[#007BA7] group-hover:text-white">
                                                            <CarIcon className="h-5 w-5" />
                                                        </div>
                                                    </div>

                                                    {typeof car.average_rating ===
                                                        'number' && (
                                                        <div className="mt-4 flex items-center gap-2">
                                                            <StarRating
                                                                value={
                                                                    car.average_rating
                                                                }
                                                                size="sm"
                                                            />

                                                            <span className="text-xs text-[#5E6A76]">
                                                                {
                                                                    car.average_rating
                                                                }{' '}
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

                                                    <div className="mt-5 flex items-end justify-between border-t border-[#D7F2F8] pt-5">

                                                        <div>
                                                            <p className="text-xs text-[#7F8D9A]">
                                                                Starting from
                                                            </p>

                                                            <p className="mt-1 text-xl font-extrabold text-[#007BA7]">
                                                                ETB{' '}
                                                                {Number(
                                                                    car.daily_price,
                                                                ).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        <span className="flex items-center gap-1 text-xs font-semibold text-[#007BA7]">
                                                            View details
                                                            <ArrowRight
                                                                size={14}
                                                                className="transition-transform group-hover:translate-x-1"
                                                            />
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </Reveal>
                                    );
                                })}
                            </div>
                        ) : (
                            <Reveal delay={120}>
                                <div className="mt-14 flex flex-col items-center gap-3 rounded-3xl border border-[#D7F2F8] bg-white py-16 text-center shadow-sm">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E5F8FC]">
                                        <CarIcon className="h-8 w-8 text-[#87CEEB]" />
                                    </div>

                                    <p className="mt-2 text-lg font-semibold text-[#16425B]">
                                        No cars available right now.
                                    </p>

                                    <p className="max-w-sm text-sm text-[#5E6A76]">
                                        Check back soon. New vehicles are added
                                        regularly.
                                    </p>
                                </div>
                            </Reveal>
                        )}
                    </div>
                </section>

                {/* =====================================================
                    HOW IT WORKS
                ====================================================== */}

                <section
                    id="how-it-works"
                    className="scroll-mt-24 bg-[#16425B] py-24 text-white lg:py-28"
                >
                    <div className="mx-auto max-w-6xl px-6">

                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#87CEEB] uppercase">
                                How it works
                            </p>

                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Up and running in minutes.
                            </h2>

                            <p className="mt-4 text-white/60">
                                A simple process designed to get you moving
                                without unnecessary steps.
                            </p>
                        </Reveal>

                        <div className="mt-16 grid gap-8 md:grid-cols-3">

                            {STEPS.map(
                                ({ step, title, desc }, index) => (
                                    <Reveal
                                        key={step}
                                        delay={index * 100}
                                    >
                                        <div className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#87CEEB]/30 hover:bg-white/10">

                                            <span className="text-5xl font-extrabold text-[#87CEEB]/30 transition-colors group-hover:text-[#87CEEB]/60">
                                                {step}
                                            </span>

                                            <h3 className="mt-8 text-xl font-bold">
                                                {title}
                                            </h3>

                                            <p className="mt-3 text-sm leading-7 text-white/60">
                                                {desc}
                                            </p>

                                            <div className="mt-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#87CEEB] uppercase">
                                                <CheckCircle size={14} />
                                                Easy & secure
                                            </div>
                                        </div>
                                    </Reveal>
                                ),
                            )}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    CTA
                ====================================================== */}

                {isGuest && (
                    <section className="relative mx-6 my-8 overflow-hidden rounded-[2rem] bg-[#007BA7] px-6 py-16 text-center shadow-2xl shadow-[#007BA7]/15 sm:px-16">

                        <div className="pointer-events-none absolute -right-32 -top-32 h-[350px] w-[350px] rounded-full bg-[#87CEEB]/25 blur-[80px]" />

                        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[350px] w-[350px] rounded-full bg-[#16425B]/30 blur-[90px]" />

                        <Reveal className="relative z-10">
                            <p className="text-xs font-semibold tracking-[0.25em] text-[#BCEBFA] uppercase">
                                Ready when you are
                            </p>

                            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Ready to hit the road?
                            </h2>

                            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/70">
                                Join customers and owners already using Ethio
                                Car Rental for a simpler way to move.
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

                                <Link
                                    href={register()}
                                    className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#007BA7] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#F7FCFF] hover:shadow-xl"
                                >
                                    Create a free account
                                    <ArrowRight className="ml-1.5 inline h-4 w-4" />
                                </Link>

                                <Link
                                    href={login()}
                                    className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
                                >
                                    Log in
                                </Link>
                            </div>
                        </Reveal>
                    </section>
                )}

                {/* =====================================================
                    FOOTER
                ====================================================== */}

                <footer
                    id="contact"
                    className="scroll-mt-24 border-t border-[#D7F2F8] bg-[#E8F8FC] px-6 py-8"
                >
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">

                        <div className="flex items-center gap-3 font-semibold text-[#16425B]">
                            <img
                                src="/images/logo.png"
                                alt="Ethio Car Rental"
                                className="h-9 w-9 rounded-full object-cover"
                            />

                            <div>
                                <p className="text-sm">
                                    Ethio Car Rental
                                </p>

                                <p className="text-[9px] font-medium tracking-[0.2em] text-[#7F8D9A] uppercase">
                                    Premium mobility
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-[#7F8D9A]">
                            &copy; {new Date().getFullYear()} Ethio Car Rental.
                            All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}