import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import InputError from '@/components/input-error';
import { ChevronDown, ChevronRight, Shield, UserCog, Car, CreditCard, FileCheck, Users } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

interface PermissionGroup {
    label: string;
    items: Record<string, string>;
}

interface Props {
    role: Role;
    availablePermissions: Record<string, PermissionGroup>;
}

const GROUP_ICONS: Record<string, React.ElementType> = {
    users: UserCog,
    vehicles: Car,
    staff: Users,
    payments: CreditCard,
    profiles: FileCheck,
};

export default function EditRole({ role, availablePermissions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions,
    });

    const [open, setOpen] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(Object.keys(availablePermissions).map((k) => [k, true])),
    );

    function toggleGroup(groupKey: string, items: Record<string, string>) {
        const keys = Object.keys(items);
        const allChecked = keys.every((k) => data.permissions.includes(k));
        setData(
            'permissions',
            allChecked
                ? data.permissions.filter((p) => !keys.includes(p))
                : [...new Set([...data.permissions, ...keys])],
        );
    }

    function toggleOne(key: string) {
        setData(
            'permissions',
            data.permissions.includes(key)
                ? data.permissions.filter((p) => p !== key)
                : [...data.permissions, key],
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    }

    return (
        <>
            <Head title={`Edit ${role.name}`} />

            <div className="p-6 space-y-6">
                <Link href="/admin/roles" className="text-sm text-muted-foreground hover:underline">
                    &larr; Back to Roles & Permissions
                </Link>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Edit Role: {role.name}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <InputError message={errors.name} />}
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                {errors.permissions && <InputError message={errors.permissions} />}

                                {Object.entries(availablePermissions).map(([groupKey, group]) => {
                                    const keys = Object.keys(group.items);
                                    const allChecked = keys.every((k) => data.permissions.includes(k));
                                    const someChecked = keys.some((k) => data.permissions.includes(k));
                                    const isOpen = open[groupKey];
                                    const Icon = GROUP_ICONS[groupKey] ?? Shield;

                                    return (
                                        <Collapsible
                                            key={groupKey}
                                            open={isOpen}
                                            onOpenChange={(v) => setOpen((s) => ({ ...s, [groupKey]: v }))}
                                        >
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
                                                                checked={data.permissions.includes(key)}
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

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                <Link href="/admin/roles">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

EditRole.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Roles & Permissions', href: '/admin/roles' },
        { title: 'Edit', href: '#' },
    ],
};
