import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props as { name: string };

    return (
        <>
            <img
                src="/images/logo.png"
                alt={name}
                className="h-8 w-8 rounded-xl object-cover"
            />
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
