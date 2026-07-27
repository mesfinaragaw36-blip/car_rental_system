import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import {
    Plus, Edit, Trash2, Users, Shield, ChevronDown, ChevronRight,
    UserCog, Car, CreditCard, FileCheck, UserCheck, Eye,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { Auth } from '@/types';

interface Role {
    id: number;
    name: string;
    permissions: string[];
    staff_count: number;
    created_at: string;
}

interface PermissionGroup {
    label: string;
    items: Record<string, string>;
}

interface Props {
    roles: Role[];
    availablePermissions: Record<string, PermissionGroup>;
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

const GROUP_ICONS: Record<string, React.ElementType> = {
    users: UserCog,
    vehicles: Car,
    staff: Users,
    payments: CreditCard,
    profiles: FileCheck,
};

const ROLE_ICONS: React.ElementType[] = [Shield, UserCog, UserCheck, Users, FileCheck];

function PermissionGroups({
    availablePermissions,
    permissions,
    onChange,
}: {
    availablePermissions: Record<string, PermissionGroup>;
    permissions: string[];
    onChange: (perms: string[]) => void;
}) {
    const [open, setOpen] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(Object.keys(availablePermissions).map((k) => [k, true])),
    );

    function toggleGroup(groupKey: string, items: Record<string, string>) {
        const keys = Object.keys(items);
        const allChecked = keys.every((k) => permissions.includes(k));
        if (allChecked) {
            onChange(permissions.filter((p) => !keys.includes(p)));
        } else {
            onChange([...new Set([...permissions, ...keys])]);
        }
    }

    function toggleOne(key: string) {
        onChange(
            permissions.includes(key)
                ? permissions.filter((p) => p !== key)
                : [...permissions, key],
        );
    }

    return (
        <div className="space-y-2">
            {Object.entries(availablePermissions).map(([groupKey, group]) => {
                const keys = Object.keys(group.items);
                const allChecked = keys.every((k) => permissions.includes(k));
                const someChecked = keys.some((k) => permissions.includes(k));
                const isOpen = open[groupKey];
                const Icon = GROUP_ICONS[groupKey] ?? Shield;

                return (
                    <Collapsible key={groupKey} open={isOpen} onOpenChange={(v) => setOpen((s) => ({ ...s, [groupKey]: v }))}>
                        <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/40">
                            <Checkbox
                                checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                                onCheckedChange={() => toggleGroup(groupKey, group.items)}
                            />
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1 text-sm font-medium">{group.label}</span>
                            <CollapsibleTrigger asChild>
                                <button type="button" className="text-muted-foreground hover:text-foreground">
                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            <div className="ml-6 mt-1 grid gap-1 md:grid-cols-2">
                                {Object.entries(group.items).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent has-[:checked]:bg-accent"
                                    >
                                        <Checkbox
                                            checked={permissions.includes(key)}
                                            onCheckedChange={() => toggleOne(key)}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}

export default function RolesIndex({ roles, availablePermissions }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;
    const isFullAdmin = props.auth.user.role === 'admin' && props.auth.user.staff_role_id === null;

    const [viewRole, setViewRole] = useState<Role | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as string[],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/roles', {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
            },
        });
    }

    function handleDelete(id: number, name: string) {
        if (confirm(`Are you sure you want to delete the role "${name}"?`)) {
            router.delete(`/admin/roles/${id}`);
        }
    }

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Roles & Permissions</h1>
                    {isFullAdmin && (
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Button>
                    )}
                </div>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {roles.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">No roles created yet. Create a role to get started.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {roles.map((role, i) => {
                            const Icon = ROLE_ICONS[i % ROLE_ICONS.length];
                            return (
                                <Card key={role.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => setViewRole(role)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Link href={`/admin/roles/${role.id}/edit`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {isFullAdmin && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(role.id, role.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <CardTitle className="mt-2 text-base">{role.name}</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            {role.staff_count} staff member{role.staff_count !== 1 ? 's' : ''}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* View Permissions Dialog */}
            <Dialog open={!!viewRole} onOpenChange={(v) => { if (!v) setViewRole(null); }}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            {viewRole?.name} — Permissions
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {viewRole?.permissions.map((perm) => (
                            <span key={perm} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                                {perm.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Role Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) reset(); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Role</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Car Verifier"
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>

                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            {errors.permissions && <InputError message={errors.permissions} />}
                            <PermissionGroups
                                availablePermissions={availablePermissions}
                                permissions={data.permissions}
                                onChange={(perms) => setData('permissions', perms)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); reset(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Roles & Permissions', href: '/admin/roles' },
    ],
};
