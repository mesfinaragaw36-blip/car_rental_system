import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface SearchableComboboxProps {
    value: string;
    onValueChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    emptyText?: string;
    allowCustom?: boolean;
    disabled?: boolean;
    className?: string;
    createLabel?: string;
}

export function SearchableCombobox({
    value,
    onValueChange,
    options,
    placeholder = 'Select...',
    emptyText = 'No matching options',
    allowCustom = false,
    disabled = false,
    className,
    createLabel = 'Add',
}: SearchableComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const trimmedQuery = query.trim();
    const filtered = trimmedQuery
        ? options.filter((option) =>
              option.toLowerCase().includes(trimmedQuery.toLowerCase()),
          )
        : options;
    const canCreate =
        allowCustom &&
        trimmedQuery.length > 0 &&
        !options.some(
            (option) => option.toLowerCase() === trimmedQuery.toLowerCase(),
        );

    function select(option: string) {
        onValueChange(option);
        setOpen(false);
        setQuery('');
    }

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((previous) => !previous)}
                data-state={open ? 'open' : 'closed'}
                className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-left text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
                <span
                    className={cn(
                        'truncate',
                        !value && 'text-muted-foreground',
                    )}
                >
                    {value || placeholder}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </button>

            {value && !disabled ? (
                <button
                    type="button"
                    onClick={() => onValueChange('')}
                    aria-label="Clear selection"
                    className="absolute top-1/2 right-8 -translate-y-1/2 rounded-sm p-0.5 hover:bg-muted"
                >
                    <X className="size-3.5 opacity-60" />
                </button>
            ) : null}

            {open ? (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                    <input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && canCreate) {
                                select(trimmedQuery);
                            }
                        }}
                        placeholder="Type to search..."
                        className="flex h-9 w-full rounded-none border-b bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground"
                    />

                    <div className="max-h-64 overflow-auto p-1">
                        {filtered.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => select(option)}
                                className="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-sm hover:bg-accent"
                            >
                                <span className="truncate">{option}</span>
                                {value === option ? (
                                    <Check className="size-4 shrink-0" />
                                ) : null}
                            </button>
                        ))}

                        {canCreate ? (
                            <button
                                type="button"
                                onClick={() => select(trimmedQuery)}
                                className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm text-primary hover:bg-accent"
                            >
                                <Plus className="size-4 shrink-0" />
                                <span>
                                    {createLabel} &quot;{trimmedQuery}&quot;
                                </span>
                            </button>
                        ) : null}

                        {filtered.length === 0 && !canCreate ? (
                            <p className="px-2.5 py-2 text-sm text-muted-foreground">
                                {emptyText}
                            </p>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
