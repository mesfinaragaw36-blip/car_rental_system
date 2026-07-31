import { useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface LayoutGridCard {
    id: number;
    className?: string;
    content: ReactNode;
    thumbnail: string;
}

function GridCard({ card }: { card: LayoutGridCard }) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const [spot, setSpot] = useState({ x: 50, y: 50 });

    function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        setSpot({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100,
        });
    }

    return (
        <div
            ref={ref}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onMouseMove={handleMouseMove}
            className={cn(
                'group relative min-h-[300px] cursor-pointer overflow-hidden rounded-3xl border border-black/5 bg-neutral-900 shadow-sm transition-all duration-500 hover:shadow-xl',
                card.className,
            )}
        >
            <img
                src={card.thumbnail}
                alt=""
                loading="lazy"
                className={cn('absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out', hovered ? 'scale-105' : 'scale-100')}
            />

            <div
                className={cn(
                    'absolute inset-0 bg-neutral-900/70 transition-opacity duration-500',
                    hovered ? 'opacity-40' : 'opacity-70',
                )}
            />

            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.12), transparent 45%)`,
                }}
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
