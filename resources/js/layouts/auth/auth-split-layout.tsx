import { Link, usePage } from '@inertiajs/react';
import { CheckCircle } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const PERKS = [
    'Hundreds of verified vehicles',
    'Flexible pickup & return',
    'Secure payments',
    'Trusted by thousands',
];

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">
            {/* Left panel — hidden on mobile */}
            <div
                className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex"
                style={{ backgroundColor: '#1A365D' }}
            >
                {/* grid texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* glow */}
                <div
                    className="pointer-events-none absolute top-1/3 -left-20 h-[400px] w-[400px] rounded-full blur-[100px]"
                    style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
                />

                {/* Logo */}
                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2 text-sm font-semibold"
                >
                    <img
                        src="/images/logo.png"
                        alt={name}
                        className="h-10 w-10 rounded-xl object-cover"
                    />
                    {name ?? 'Ethio Car Rental'}
                </Link>

                {/* Center content */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                            Car Rental Platform
                        </p>
                        <h2 className="text-3xl leading-snug font-bold tracking-tight">
                            Rent a car,
                            <br />
                            <span style={{ color: '#FF6B00' }}>your way.</span>
                        </h2>
                        <p className="max-w-xs text-sm leading-relaxed text-white/50">
                            The simplest way to rent a vehicle or earn by
                            listing yours.
                        </p>
                    </div>

                    <ul className="space-y-2.5">
                        {PERKS.map((perk) => (
                            <li
                                key={perk}
                                className="flex items-center gap-2.5 text-sm text-white/70"
                            >
                                <CheckCircle
                                    className="h-4 w-4 shrink-0"
                                    style={{ color: '#FF6B00' }}
                                />
                                {perk}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom quote */}
                <p className="relative z-10 text-xs text-white/30">
                    &copy; {new Date().getFullYear()} Ethio Car Rental. All
                    rights reserved.
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-12">
                {/* Mobile logo */}
                <Link
                    href={home()}
                    className="mb-8 flex items-center gap-2 text-sm font-semibold lg:hidden"
                >
                    <img
                        src="/images/logo.png"
                        alt={name}
                        className="h-10 w-10 rounded-xl object-cover"
                    />
                    {name ?? 'Ethio Car Rental'}
                </Link>

                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
