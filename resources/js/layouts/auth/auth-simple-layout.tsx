import { Link, usePage } from '@inertiajs/react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const TRUST_POINTS = [
    'No hidden fees',
    'Verified vehicles',
    'Instant booking',
];

const HERO_CAR_IMAGE = '/images/hero-car.png';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="relative grid min-h-dvh bg-[#16425B] lg:grid-cols-2">
            {/* Left marketing panel */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-[#16425B] p-10 lg:flex">
                {/* Dot grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
                        backgroundSize: '36px 36px',
                    }}
                />

                {/* Glows */}
                <div className="pointer-events-none absolute left-[-140px] top-1/4 h-[420px] w-[420px] rounded-full bg-[#00C4CC]/20 blur-[120px]" />

                <div className="pointer-events-none absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full bg-[#87CEEB]/15 blur-[120px]" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-widest text-[#BCEBFA] uppercase backdrop-blur-md">
                        <Sparkles
                            size={13}
                            className="text-[#87CEEB]"
                        />
                        Available across Ethiopia
                    </span>

                    <h2 className="mt-6 text-4xl leading-[1.05] font-semibold tracking-tight text-white xl:text-6xl">
                        Rent a car,
                        <br />
                        <span className="text-[#87CEEB]">
                            your way.
                        </span>
                    </h2>

                    <p className="mt-4 max-w-sm text-base leading-7 text-white/70">
                        The simplest way to rent a vehicle or earn by
                        listing yours — verified owners, flexible
                        bookings.
                    </p>

                    <div className="relative mt-8 w-full max-w-md">
                        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[320px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#87CEEB]/25 via-[#00C4CC]/20 to-transparent blur-[100px]" />

                        <img
                            src={HERO_CAR_IMAGE}
                            alt="Car"
                            className="relative z-10 w-full animate-float drop-shadow-2xl"
                        />
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
                        {TRUST_POINTS.map((point) => (
                            <span
                                key={point}
                                className="flex items-center gap-1.5"
                            >
                                <CheckCircle
                                    size={16}
                                    className="text-[#87CEEB]"
                                />
                                {point}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-xs text-white/50">
                    &copy; {new Date().getFullYear()} {name}. All
                    rights reserved.
                </p>
            </div>

            {/* Right form panel */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#16425B] px-6 py-12">
                {/* Subtle background effects */}
                <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[#00C4CC]/10 blur-[120px]" />

                <div className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-[#87CEEB]/10 blur-[120px]" />

                <div className="relative z-10 w-full max-w-md animate-in space-y-6 duration-700 fade-in slide-in-from-bottom-4">
                    {/* Logo */}
                    <Link
                        href={home()}
                        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 shadow-lg backdrop-blur-md transition-transform hover:scale-105"
                    >
                        <img
                            src="/images/logo.png"
                            alt={name}
                            className="h-full w-full rounded-full object-cover"
                        />
                    </Link>

                    {/* Heading */}
                    <div className="space-y-1.5 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#87CEEB]">
                            Account access
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight text-white text-balance">
                            {title}
                        </h1>

                        {description && (
                            <p className="text-sm text-white/60">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Form Card */}
                    <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/10 backdrop-blur-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}