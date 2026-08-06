import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            notifications: {
                unread_count: number;
                latest: Array<{
                    id: number;
                    type: string;
                    title: string;
                    message: string;
                    read_at: string | null;
                    created_at: string;
                }>;
            };
            [key: string]: unknown;
        };
    }
}
