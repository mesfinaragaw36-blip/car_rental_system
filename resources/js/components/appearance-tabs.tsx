import { Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-3.5 py-1.5 text-sm text-neutral-500',
                className,
            )}
            {...props}
        >
            <Sun className="h-4 w-4" />
            <span>Light mode</span>
        </div>
    );
}
