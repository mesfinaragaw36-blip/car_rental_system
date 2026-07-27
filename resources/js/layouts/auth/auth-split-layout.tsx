import { Link, usePage } from '@inertiajs/react';
import { Car, CheckCircle } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const PERKS = [
    'Hundreds of verified vehicles',
    'Flexible pickup & return',
    'Secure payments',
    'Trusted by thousands',
];

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-2">

            {/* Left panel — hidden on mobile */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex">
                {/* grid texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* glow */}
                <div className="pointer-events-none absolute -left-20 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]" />

                {/* Logo */}
                <Link href={home()} className="relative z-10 flex items-center gap-2 text-sm font-semibold">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                        <Car className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {name ?? 'DriveEasy'}
                </Link>

                {/* Center content */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Car Rental Platform</p>
                        <h2 className="text-3xl font-bold leading-snug tracking-tight">
                            Rent a car,<br />
                            <span className="text-primary">your way.</span>
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                            The simplest way to rent a vehicle or earn by listing yours.
                        </p>
                    </div>

                    <ul className="space-y-2.5">
                        {PERKS.map((perk) => (
                            <li key={perk} className="flex items-center gap-2.5 text-sm text-white/70">
                                <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                                {perk}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bottom quote */}
                <p className="relative z-10 text-xs text-white/30">
                    © {new Date().getFullYear()} DriveEasy. All rights reserved.
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-12">
                {/* Mobile logo */}
                <Link href={home()} className="mb-8 flex items-center gap-2 text-sm font-semibold lg:hidden">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                        <Car className="h-4 w-4 text-primary-foreground" />
                    </div>
                    {name ?? 'DriveEasy'}
                </Link>

                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>

                    {children}
                </div>
            </div>

        </div>
    );
}
