import { useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface LayoutGridCard {
    id: number;
    className?: string;
    content: ReactNode;
    thumbnail: string;
}

function GridCard({ card }: { card: LayoutGridCard }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                'group relative min-h-[300px] cursor-pointer overflow-hidden rounded-3xl border border-border shadow-sm transition-all duration-500 hover:shadow-xl',
                card.className,
            )}
        >
            <img
                src={card.thumbnail}
                alt=""
                loading="lazy"
                className={cn('absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-out', hovered ? 'scale-105' : 'scale-100')}
            />

            <div className="absolute inset-x-0 bottom-0 p-6 opacity-100 transition-all duration-500 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                {card.content}
            </div>
        </div>
    );
}

export function LayoutGrid({ cards }: { cards: LayoutGridCard[] }) {
    return (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
                <GridCard key={card.id} card={card} />
            ))}
        </div>
    );
}
