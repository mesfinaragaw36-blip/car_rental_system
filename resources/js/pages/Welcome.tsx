import { Head, Link, usePage } from '@inertiajs/react';
import { Shield, MapPin, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { login, register } from '@/routes';
import type { Auth } from '@/types';

function getDashboardUrl(): string {
    return '/dashboard';
}

const FEATURES = [
    {
        icon: Shield,
        title: 'Verified & Safe',
        desc: 'Every owner and vehicle goes through our trust verification process.',
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
    const dashboardUrl = auth.user ? getDashboardUrl() : null;

    return (
        <>
            <Head title="Welcome — Ethio Car Rental" />

            <div className="min-h-screen text-foreground" style={{ backgroundColor: '#F8F9FA' }}>

                {/* Nav */}
                <header className="fixed inset-x-0 top-0 z-50 border-b" style={{ borderColor: '#E2E4E7', backgroundColor: 'rgba(248, 249, 250, 0.9)' }}>
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                        <div className="flex items-center gap-2 font-semibold tracking-tight">
                            <img src="/images/logo.png" alt="Ethio Car Rental" className="h-7 w-7 rounded-lg object-cover" />
                            <span style={{ color: '#1A1A1A' }}>Ethio Car Rental</span>
                        </div>

                        <nav className="flex items-center gap-2">
                            {dashboardUrl ? (
                                <Link
                                    href={dashboardUrl}
                                    className="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: '#1A365D' }}
                                >
                                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors hover:text-foreground"
                                        style={{ color: '#6B7280' }}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: '#1A365D' }}
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
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, #1A365D 1px, transparent 1px)',
                            backgroundSize: '36px 36px',
                        }}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(255, 107, 0, 0.08)' }} />

                    <div className="relative max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm" style={{ border: '1px solid rgba(255, 107, 0, 0.2)', backgroundColor: 'rgba(255, 107, 0, 0.06)', color: '#FF6B00' }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#FF6B00' }} />
                            Available across Ethiopia
                        </div>

                        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl" style={{ color: '#1A1A1A' }}>
                            Rent a car,{' '}
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1A365D, #FF6B00)' }}>
                                your way
                            </span>
                        </h1>

                        <p className="mx-auto max-w-xl text-lg" style={{ color: '#6B7280' }}>
                            The simplest way to rent a vehicle or earn by listing yours.
                            Verified owners, flexible bookings, zero hassle.
                        </p>

                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            {dashboardUrl ? (
                                <Link
                                    href={dashboardUrl}
                                    className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: '#1A365D', boxShadow: '0 4px 14px rgba(26, 54, 93, 0.3)' }}
                                >
                                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={register()}
                                        className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                                        style={{ backgroundColor: '#1A365D', boxShadow: '0 4px 14px rgba(26, 54, 93, 0.3)' }}
                                    >
                                        Start for free <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-6 py-3 text-sm font-medium transition-colors hover:bg-white"
                                        style={{ border: '1px solid #E2E4E7', color: '#1A1A1A' }}
                                    >
                                        Log in
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-6 pt-2 text-xs" style={{ color: '#6B7280' }}>
                            {['No hidden fees', 'Verified vehicles', 'Instant booking'].map((t) => (
                                <span key={t} className="flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" style={{ color: '#FF6B00' }} />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="border-t px-6 py-24" style={{ borderColor: '#E2E4E7', backgroundColor: '#FFFFFF' }}>
                    <div className="mx-auto max-w-5xl space-y-12">
                        <div className="space-y-2 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FF6B00' }}>Why Ethio Car Rental</p>
                            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>Everything you need, nothing you don&apos;t</h2>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-3">
                            {FEATURES.map(({ icon: Icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="group rounded-xl p-6 transition-all hover:shadow-lg"
                                    style={{ border: '1px solid #E2E4E7', backgroundColor: '#F8F9FA' }}
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:opacity-90" style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}>
                                        <Icon className="h-5 w-5" style={{ color: '#1A365D' }} />
                                    </div>
                                    <h3 className="mb-1.5 font-semibold" style={{ color: '#1A1A1A' }}>{title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="px-6 py-24" style={{ backgroundColor: '#F8F9FA' }}>
                    <div className="mx-auto max-w-4xl space-y-12">
                        <div className="space-y-2 text-center">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#FF6B00' }}>How it works</p>
                            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>Up and running in minutes</h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {STEPS.map(({ step, title, desc }, i) => (
                                <div key={step} className="relative flex flex-col gap-3 rounded-xl p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E4E7' }}>
                                    {i < STEPS.length - 1 && (
                                        <div className="absolute left-[calc(100%+1rem)] top-5 hidden h-px w-8 md:block" style={{ backgroundColor: '#E2E4E7' }} />
                                    )}
                                    <span className="text-4xl font-bold" style={{ color: 'rgba(255, 107, 0, 0.2)' }}>{step}</span>
                                    <h3 className="font-semibold" style={{ color: '#1A1A1A' }}>{title}</h3>
                                    <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA banner */}
                {!dashboardUrl && (
                    <section className="border-t px-6 py-20" style={{ borderColor: '#E2E4E7', backgroundColor: '#FFFFFF' }}>
                        <div className="mx-auto max-w-2xl space-y-6 text-center">
                            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>Ready to get started?</h2>
                            <p style={{ color: '#6B7280' }}>
                                Join thousands of customers and owners already using Ethio Car Rental.
                            </p>
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    href={register()}
                                    className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: '#1A365D', boxShadow: '0 4px 14px rgba(26, 54, 93, 0.3)' }}
                                >
                                    Create a free account <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-lg px-6 py-3 text-sm font-medium transition-colors hover:bg-white"
                                    style={{ border: '1px solid #E2E4E7', color: '#1A1A1A' }}
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t px-6 py-8" style={{ borderColor: '#E2E4E7', backgroundColor: '#1A365D' }}>
                    <div className="mx-auto flex max-w-6xl items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-white">
                            <img src="/images/logo.png" alt="Ethio Car Rental" className="h-5 w-5 rounded object-cover" />
                            Ethio Car Rental
                        </div>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>&copy; {new Date().getFullYear()} Ethio Car Rental. All rights reserved.</p>
                    </div>
                </footer>

            </div>
        </>
    );
}