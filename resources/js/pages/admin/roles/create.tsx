import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PermissionGroup {
    label: string;
    items: Record<string, string>;
}

interface Props {
    availablePermissions: Record<string, PermissionGroup>;
}

export default function CreateRole({ availablePermissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    function togglePermission(permission: string): void {
        setData(
            'permissions',
            data.permissions.includes(permission)
                ? data.permissions.filter((p) => p !== permission)
                : [...data.permissions, permission],
        );
    }

    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault();
        post('/admin/roles');
    }

    return (
        <>
            <Head title="Create Role" />

            <div className="space-y-6 p-6">
                <Link
                    href="/admin/roles"
                    className="text-sm text-muted-foreground hover:underline"
                >
                    &larr; Back to Roles
                </Link>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create Role</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Car Verifier"
                                />
                                {errors.name && (
                                    <InputError message={errors.name} />
                                )}
                            </div>

                            <div className="space-y-4">
                                <Label>Permissions</Label>
                                {data.permissions.length === 0 && (
                                    <p className="text-xs text-red-600">
                                        Select at least one permission.
                                    </p>
                                )}

                                {Object.entries(availablePermissions).map(
                                    ([groupKey, group]) => (
                                        <div
                                            key={groupKey}
                                            className="space-y-2"
                                        >
                                            <p className="text-sm font-medium text-muted-foreground">
                                                {group.label}
                                            </p>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {Object.entries(
                                                    group.items,
                                                ).map(([key, label]) => (
                                                    <label
                                                        key={key}
                                                        className="flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm hover:bg-accent has-[:checked]:bg-accent"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300"
                                                            checked={data.permissions.includes(
                                                                key,
                                                            )}
                                                            onChange={() =>
                                                                togglePermission(
                                                                    key,
                                                                )
                                                            }
                                                        />
                                                        {label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create Role'}
                                </Button>
                                <Link href="/admin/roles">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CreateRole.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Roles', href: '/admin/roles' },
        { title: 'Create', href: '#' },
    ],
};
