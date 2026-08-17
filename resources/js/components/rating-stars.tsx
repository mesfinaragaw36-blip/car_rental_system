import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    value: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StarRatingProps['size']>, string> = {
    sm: 'size-3.5',
    md: 'size-5',
    lg: 'size-7',
};

export function StarRating({ value, size = 'md', className }: StarRatingProps) {
    const rounded = Math.round(value);

    return (
        <div
            className={cn('flex items-center gap-0.5', className)}
            role="img"
            aria-label={`Rated ${value.toFixed(1)} out of 5 stars`}
        >
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    className={cn(
                        SIZE_CLASSES[size],
                        index < rounded
                            ? 'fill-brand text-brand'
                            : 'fill-slate-300 text-slate-300',
                    )}
                />
            ))}
        </div>
    );
}