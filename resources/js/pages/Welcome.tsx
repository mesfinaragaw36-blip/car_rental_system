import { Head, Link, usePage } from '@inertiajs/react';
import { login, register } from '@/routes';
import type { Auth } from '@/types';
import { Car, Shield, MapPin, Star, ArrowRight, CheckCircle } from 'lucide-react';

function getDashboardUrl(role: string): string {
    switch (role) {
        case 'admin':  return '/admin/dashboard';
        case 'owner':  return '/owner/dashboard';
        case 'driver': return '/driver/dashboard';
        default:       return '/customer/dashboard';
    }
}

const FEATURES = [
    {
        icon: Car,
        title: 'Wide Selection',
        desc: 'Browse hundreds of verified vehicles — sedans, SUVs, trucks and more.',
    },
    {
        icon: Shield,
        title: 'Verified & Safe',
        desc: 'Every owner and vehicle goes through our verification process.',
    },
    {
        icon: MapPin,
        title: 'Flexible Pickup',
        desc: 'Choose your pickup and return location with flexible scheduling.',
    },
    {
        icon: Star,
        title: 'Trusted Owners',
        desc: 'Rated and reviewed owners so you always know what to expect.',
    },
];

const STEPS = [
    { step: '01', title: 'Create an account', desc: 'Sign up as a customer, owner, or driver in under a minute.' },
    { step: '02', title: 'Browse or list', desc: 'Find the perfect car or list your own vehicle to earn.' },
    { step: '03', title: 'Book & drive', desc: 'Confirm your booking, pay securely, and hit the road.' },
];

export default function Welcome() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const dashboardUrl = auth.user ? getDashboardUrl(auth.user.role) : null;

    return (
        <>
            <Head title="Welcome — Car Rental" />

            <div className="min-h-screen bg-background text-foreground">

                {/* Nav */}
                <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2 font-semibold tracking-tight">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                                <Car className="h-4 w-4 text-primary-foreground" />
                            </div>
                            DriveEasy
                        </div>

                        <nav className="flex items-center gap-2">
                            {dashboardUrl ? (
                                <Link
                                    href={dashboardUrl}
                                    className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        Get started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14 text-center">
                    {/* subtle grid bg */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />
                    {/* glow */}
                    <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

                    <div className="relative max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Available across Ethiopia
                        </div>

                        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                            Rent a car,{' '}
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                your way
                            </span>
                        </h1>

                        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                            The simplest way to rent a vehicle or earn by listing yours.
                            Verified owners, flexible bookings, zero hassle.
                        </p>

                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            {dashboardUrl ? (
                                <Link
                                    href={dashboardUrl}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
                                >
                                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={register()}
                                        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
                                    >
                                        Start for free <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                    >
                                        Log in
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
                            {['No hidden fees', 'Verified vehicles', 'Instant booking'].map((t) => (
                                <span key={t} className="flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="border-t border-border/40 bg-muted/30 px-6 py-24">
                    <div className="mx-auto max-w-5xl space-y-12">
                        <div className="text-center space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Why DriveEasy</p>
                            <h2 className="text-3xl font-bold tracking-tight">Everything you need, nothing you don't</h2>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {FEATURES.map(({ icon: Icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="group rounded-xl border border-border/60 bg-background p-6 transition-shadow hover:shadow-md"
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="mb-1.5 font-semibold">{title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-4xl space-y-12">
                        <div className="text-center space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">How it works</p>
                            <h2 className="text-3xl font-bold tracking-tight">Up and running in minutes</h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {STEPS.map(({ step, title, desc }, i) => (
                                <div key={step} className="relative flex flex-col gap-3">
                                    {i < STEPS.length - 1 && (
                                        <div className="absolute left-[calc(100%+1rem)] top-5 hidden h-px w-8 bg-border md:block" />
                                    )}
                                    <span className="text-4xl font-bold text-primary/20">{step}</span>
                                    <h3 className="font-semibold">{title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA banner */}
                {!dashboardUrl && (
                    <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
                        <div className="mx-auto max-w-2xl space-y-6 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">Ready to get started?</h2>
                            <p className="text-muted-foreground">
                                Join thousands of customers and owners already using DriveEasy.
                            </p>
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    href={register()}
                                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-opacity hover:opacity-90"
                                >
                                    Create a free account <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t border-border/40 px-6 py-8">
                    <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
                                <Car className="h-3 w-3 text-primary-foreground" />
                            </div>
                            DriveEasy
                        </div>
                        <p>© {new Date().getFullYear()} DriveEasy. All rights reserved.</p>
                    </div>
                </footer>

            </div>
        </>
    );
}
