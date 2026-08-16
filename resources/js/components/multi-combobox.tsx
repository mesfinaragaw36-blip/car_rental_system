import { Check, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MultiComboboxProps {
    values: string[];
    onValuesChange: (values: string[]) => void;
    options: string[];
    placeholder?: string;
    emptyText?: string;
    allowCustom?: boolean;
    disabled?: boolean;
    className?: string;
    createLabel?: string;
}

export function MultiCombobox({
    values,
    onValuesChange,
    options,
    placeholder = 'Select...',
    emptyText = 'No matching options',
    allowCustom = true,
    disabled = false,
    className,
    createLabel = 'Add',
}: MultiComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    function add(value: string) {
        const normalized = value.trim();

        if (!normalized) {
            return;
        }

        if (
            values.some(
                (item) => item.toLowerCase() === normalized.toLowerCase(),
            )
        ) {
            return;
        }

        onValuesChange([...values, normalized]);
    }

    function remove(value: string) {
        onValuesChange(values.filter((item) => item !== value));
    }

    function select(option: string) {
        if (values.includes(option)) {
            remove(option);
        } else {
            add(option);
        }

        setQuery('');
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && canCreate) {
            event.preventDefault();
            add(trimmedQuery);
            setQuery('');
        }

        if (
            event.key === 'Enter' &&
            !canCreate &&
            trimmedQuery &&
            filtered.length === 0
        ) {
            event.preventDefault();
        }
    }

    return (
        <div
            ref={containerRef}
            className={cn('relative', disabled && 'opacity-50', className)}
        >
            <div
                onClick={() => {
                    if (!disabled) {
                        setOpen(true);
                        inputRef.current?.focus();
                    }
                }}
                className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-left text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed md:text-sm"
            >
                {values.map((value) => (
                    <Badge key={value} variant="secondary">
                        {value}
                        <button
                            type="button"
                            aria-label={`Remove ${value}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                remove(value);
                            }}
                            className="rounded-sm p-0.5 hover:bg-muted"
                        >
                            <X className="size-3" />
                        </button>
                    </Badge>
                ))}
                <input
                    ref={inputRef}
                    value={query}
                    disabled={disabled}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={values.length > 0 ? '' : placeholder}
                    className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none disabled:pointer-events-none disabled:cursor-not-allowed"
                />
            </div>

            {values.length > 0 && !disabled ? (
                <button
                    type="button"
                    onClick={() => onValuesChange([])}
                    aria-label="Clear all selections"
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 hover:bg-muted"
                >
                    <X className="size-3.5 opacity-60" />
                </button>
            ) : null}

            {open ? (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="max-h-64 overflow-auto p-1">
                        {filtered.map((option) => {
                            const selected = values.includes(option);

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => select(option)}
                                    className="flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left text-sm hover:bg-accent"
                                >
                                    <span className="truncate">{option}</span>
                                    {selected ? (
                                        <Check className="size-4 shrink-0" />
                                    ) : null}
                                </button>
                            );
                        })}

                        {canCreate ? (
                            <button
                                type="button"
                                onClick={() => {
                                    add(trimmedQuery);
                                    setQuery('');
                                }}
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
