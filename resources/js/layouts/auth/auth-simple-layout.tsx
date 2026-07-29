import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage().props as { name: string };

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">

            {/* Soft background blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />

            {/* Subtle dot grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div className="relative z-10 w-full max-w-[420px] space-y-8">

                {/* Logo */}
                <div className="flex flex-col items-center gap-4">
                    <Link href={home()} className="flex flex-col items-center gap-2 transition-opacity hover:opacity-90">
                        <img src="/images/logo.png" alt={name} className="h-16 w-auto rounded-2xl object-cover" />
                        <span className="text-lg font-bold" style={{ color: '#1A365D' }}>{name}</span>
                    </Link>
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
                    {children}
                </div>

            </div>
        </div>
    );
}
