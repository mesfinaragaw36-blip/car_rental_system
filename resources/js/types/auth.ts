export type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'owner' | 'customer' | 'driver';
    staff_role_id: number | null;
    permissions: string[] | null;
    status: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */
