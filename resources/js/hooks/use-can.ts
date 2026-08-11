import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

export type Can = (permission: string) => boolean;

/**
 * Returns a `can(permission)` checker based on the authenticated user.
 *
 * Permission checks only apply to staff users (admins assigned a staff
 * role). Full admins and regular customers / owners / drivers are never
 * restricted.
 */
export function useCan(): Can {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth?.user ?? null;

    return (permission: string): boolean => {
        if (!user) {
            return false;
        }

        if (user.role !== 'admin' || user.staff_role_id === null) {
            return true;
        }

        return (user.permissions ?? []).includes(permission);
    };
}
