import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-[#007BA7] focus-visible:ring-[#87CEEB]/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
    {
        variants: {
            variant: {
                default:
                    'bg-[#007BA7] text-white shadow-sm hover:bg-[#16425B] hover:shadow-md',

                destructive:
                    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/30',

                outline:
                    'border border-[#BCEBFA] bg-[#F7FCFF] text-[#16425B] shadow-sm hover:border-[#87CEEB] hover:bg-[#E5F8FC] hover:text-[#007BA7]',

                secondary:
                    'bg-[#E8F8FC] text-[#16425B] shadow-sm hover:bg-[#CDEFF7]',

                ghost:
                    'text-[#16425B] hover:bg-[#E5F8FC] hover:text-[#007BA7]',

                link:
                    'text-[#007BA7] underline-offset-4 hover:text-[#16425B] hover:underline',
            },

            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-full px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-full px-6 has-[>svg]:px-4',
                icon: 'size-9',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };