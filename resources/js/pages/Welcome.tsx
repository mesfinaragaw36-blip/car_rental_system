import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Gauge, MapPin, Shield, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LayoutGrid } from '@/components/ui/layout-grid';
import type { LayoutGridCard } from '@/components/ui/layout-grid';
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

const NAV_ITEMS = [
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
    { step: '01', title: 'Create an account', desc: 'Sign up as a customer, owner, or driver in under a minute.' },
    { step: '02', title: 'Browse or list', desc: 'Find the perfect car or list your own vehicle to earn.' },
    { step: '03', title: 'Book & drive', desc: 'Confirm your booking, pay securely, and hit the road.' },
];

const STATS = [
    { value: '500+', label: 'Cars listed' },
    { value: '1,000+', label: 'Happy drivers' },
    { value: '4.8', label: 'Average rating' },
    { value: '24/7', label: 'Support' },
];

const TRUST_POINTS = ['No hidden fees', 'Verified vehicles', 'Instant booking'];

const FLEET_CARDS: LayoutGridCard[] = [
    {
        id: 1,
        className: 'md:col-span-2',
        thumbnail: '/images/fleet-sedan.png',
        content: (
            <div>
                <p className="text-xl font-bold text-white md:text-2xl">Sedans</p>
                <p className="mt-2 max-w-lg text-sm text-neutral-200">
                    Smooth city cruisers — economical, agile, everyday ready.
                </p>
            </div>
        ),
    },
    {
        id: 2,
        className: 'md:col-span-1',
        thumbnail: '/images/fleet-suv.jpg',
        content: (
            <div>
                <p className="text-xl font-bold text-white md:text-2xl">SUVs</p>
                <p className="mt-2 max-w-lg text-sm text-neutral-200">
                    Space for the whole crew, built for the long haul.
                </p>
            </div>
        ),
    },
    {
        id: 3,
        className: 'md:col-span-1',
        thumbnail: '/images/fleet-luxury.png',
        content: (
            <div>
                <p className="text-xl font-bold text-white md:text-2xl">Luxury</p>
                <p className="mt-2 max-w-lg text-sm text-neutral-200">
                    Arrive the way you want to be remembered.
                </p>
            </div>
        ),
    },
    {
        id: 4,
        className: 'md:col-span-2',
        thumbnail: '/images/fleet-pickup.jpg',
        content: (
            <div>
                <p className="text-xl font-bold text-white md:text-2xl">Pickups & Vans</p>
                <p className="mt-2 max-w-lg text-sm text-neutral-200">
                    Haul more, do more — tough and dependable.
                </p>
            </div>
        ),
    },
];

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.15 });
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn(
                'transition-all duration-700 ease-out will-change-transform',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
                className,
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function BrandLogo() {
    return (
        <>
            <img src="/images/logo.png" alt="Ethio Car Rental" className="h-7 w-7 rounded-full object-cover" />
            <span className="text-base">Ethio Car Rental</span>
        </>
    );
}

function getDashboardUrl(): string {
    return '/dashboard';
}

export default function Welcome() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const dashboardUrl = auth.user ? getDashboardUrl() : null;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const authButton = dashboardUrl ? (
        <NavbarButton href={dashboardUrl}>
            Dashboard <ArrowRight className="ml-1 inline h-4 w-4" />
        </NavbarButton>
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
                        <NavItems items={NAV_ITEMS} />
                        <div className="flex items-center gap-3">{authButton}</div>
                    </NavBody>

                    <MobileNav>
                        <MobileNavHeader>
                            <NavbarLogo>
                                <BrandLogo />
                            </NavbarLogo>
                            <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((open) => !open)} />
                        </MobileNavHeader>

                        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                            {NAV_ITEMS.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-xl px-4 py-3 font-medium text-foreground/70 transition-colors hover:bg-neutral-100 hover:text-foreground"
                                >
                                    {item.name}
                                </a>
                            ))}
                            <div onClick={() => setIsMobileMenuOpen(false)} className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-4">
                                {dashboardUrl ? (
                                    <NavbarButton href={dashboardUrl} className="w-full">
                                        Dashboard <ArrowRight className="ml-1 inline h-4 w-4" />
                                    </NavbarButton>
                                ) : (
                                    <>
                                        <NavbarButton href={register()} className="w-full">
                                            Get started
                                        </NavbarButton>
                                        <NavbarButton href={login()} variant="secondary" className="w-full">
                                            Log in
                                        </NavbarButton>
                                    </>
                                )}
                            </div>
                        </MobileNavMenu>
                    </MobileNav>
                </Navbar>

                {/* Hero */}
                <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center overflow-hidden px-6 pt-24 pb-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #1A365D 1px, transparent 1px)',
                            backgroundSize: '36px 36px',
                        }}
                    />

                    <div className="relative z-10 py-12 text-center lg:py-0 lg:text-left">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                            Available across Ethiopia
                        </div>

                        <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                            Rent a car,
                            <br />
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                your way.
                            </span>
                        </h1>

                        <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                            The simplest way to rent a vehicle or earn by listing yours. Verified owners, flexible bookings, zero hassle.
                        </p>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                            {dashboardUrl ? (
                                <Link
                                    href={dashboardUrl}
                                    className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                                >
                                    Go to Dashboard <ArrowRight className="ml-1.5 inline h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={register()}
                                        className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                                    >
                                        Start for free <ArrowRight className="ml-1.5 inline h-4 w-4" />
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

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                            {TRUST_POINTS.map((point) => (
                                <span key={point} className="flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-accent" />
                                    {point}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Hero car */}
                    <div className="relative z-10 mx-auto mt-6 w-full max-w-xl lg:mt-0">
                        <div
                            className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
                            style={{ backgroundColor: 'rgba(255, 107, 0, 0.14)' }}
                        />
                        <div
                            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
                            style={{ backgroundColor: 'rgba(26, 54, 93, 0.1)' }}
                        />

                        <div className="animate-in fade-in zoom-in-95 duration-1000 delay-200 relative">
                            <img
                                src={HERO_CAR_IMAGE}
                                alt="Featured car"
                                className="animate-float relative z-10 w-full drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Stats strip */}
                <section className="border-y border-black/5 bg-white">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-12 sm:grid-cols-4">
                        {STATS.map((stat, index) => (
                            <Reveal key={stat.label} delay={index * 90}>
                                <div className="text-center">
                                    <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{stat.value}</p>
                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="scroll-mt-24 bg-white py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Why Ethio Car Rental</p>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Everything you need, nothing you don&apos;t.
                            </h2>
                            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                                Built for drivers, owners, and everyone in between.
                            </p>
                        </Reveal>

                        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-black/5 bg-black/5 sm:grid-cols-2 lg:grid-cols-4">
                            {FEATURES.map(({ icon: Icon, title, desc }, index) => (
                                <Reveal key={title} delay={index * 80} className="h-full">
                                    <div className="group h-full bg-white p-8 transition-colors duration-300 hover:bg-neutral-50">
                                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/10 group-hover:text-accent">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-base font-bold tracking-tight">{title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Fleet */}
                <section id="fleet" className="scroll-mt-24 py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Our fleet</p>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Built to move.
                            </h2>
                            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                                Hover a card to take a closer look at what&apos;s waiting for you.
                            </p>
                        </Reveal>

                        <Reveal delay={120} className="mt-14">
                            <LayoutGrid cards={FLEET_CARDS} />
                        </Reveal>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="scroll-mt-24 bg-white py-24">
                    <div className="mx-auto max-w-6xl px-6">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">How it works</p>
                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Up and running in minutes.
                            </h2>
                        </Reveal>

                        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
                            {STEPS.map(({ step, title, desc }, index) => (
                                <Reveal key={step} delay={index * 100}>
                                    <div className="group relative px-2 md:px-8">
                                        {index < STEPS.length - 1 && (
                                            <div className="absolute right-0 top-8 hidden h-px w-8 bg-black/10 md:block" />
                                        )}
                                        <span className="bg-gradient-to-br from-primary/25 to-accent/25 bg-clip-text text-5xl font-extrabold text-transparent transition-all duration-300 group-hover:from-primary/60 group-hover:to-accent/60">
                                            {step}
                                        </span>
                                        <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                {!dashboardUrl && (
                    <section className="mx-6 mb-6 overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-16">
                        <Reveal>
                            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Ready to hit the road?
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-base text-white/70">
                                Join thousands of customers and owners already using Ethio Car Rental.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    href={register()}
                                    className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    Create a free account <ArrowRight className="ml-1.5 inline h-4 w-4" />
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
                            <img src="/images/logo.png" alt="Ethio Car Rental" className="h-6 w-6 rounded-full object-cover" />
                            Ethio Car Rental
                        </div>
                        <p>&copy; {new Date().getFullYear()} Ethio Car Rental. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
