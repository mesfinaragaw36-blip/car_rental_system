import { Link, usePage } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const TRUST_POINTS = ['No hidden fees', 'Verified vehicles', 'Instant booking'];
const HERO_CAR_IMAGE = '/storage/car-photos/JnB7OuAlISot685AOkmhAR0lEh7sC3oaFi9gSiJC.png';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="relative grid min-h-dvh bg-background lg:grid-cols-2">
            {/* Left marketing panel */}
            <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #1A365D 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                    }}
                />
                <div
                    className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full blur-[120px]"
                    style={{ backgroundColor: 'rgba(255, 107, 0, 0.14)' }}
                />
                <div
                    className="pointer-events-none absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full blur-[120px]"
                    style={{ backgroundColor: 'rgba(26, 54, 93, 0.1)' }}
                />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                        Available across Ethiopia
                    </span>

                    <h2 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
                        Rent a car,
                        <br />
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            your way.
                        </span>
                    </h2>

                    <p className="mt-4 max-w-sm text-base text-muted-foreground">
                        The simplest way to rent a vehicle or earn by listing yours — verified owners, flexible bookings.
                    </p>

                    <div className="relative mt-8 w-full max-w-md">
                        <div
                            className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary/25 via-accent/20 to-transparent blur-[100px]"
                        />
                        <img src={HERO_CAR_IMAGE} alt="Car" className="animate-float relative z-10 w-full drop-shadow-2xl" />
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        {TRUST_POINTS.map((point) => (
                            <span key={point} className="flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4 text-accent" />
                                {point}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} {name}. All rights reserved.
                </p>
            </div>

            {/* Right form panel */}
            <div className="relative flex flex-col items-center justify-center px-6 py-12">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-md space-y-6">
                    <Link href={home()} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-black/5 bg-white/70 p-2 shadow-sm backdrop-blur-xl transition-transform hover:scale-105">
                        <img src="/images/logo.png" alt={name} className="h-full w-full rounded-full object-cover" />
                    </Link>

                    <div className="space-y-1.5 text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-balance">{title}</h1>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>

                    <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-xl shadow-black/5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
