import { Head, Link, router, usePage } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCan } from '@/hooks/use-can';
import type { Auth } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    deleted_at: string;
}

interface Paginated {
    data: User[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: Paginated;
}
interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

export default function TrashedUsers({ users }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;
    const can = useCan();

    function handleRestore(id: number, name: string) {
        if (confirm(`Restore "${name}"?`)) {
            router.post(`/admin/users/${id}/restore`);
        }
    }

    return (
        <>
            <Head title="Deleted Users" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Deleted Users</h1>
                    <Link href="/admin/users">
                        <Button variant="outline">← Back to Users</Button>
                    </Link>
                </div>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Soft-Deleted Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.data.length === 0 ? (
                            <p className="text-muted-foreground">
                                No deleted users.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">
                                                Name
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Email
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Phone
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Role
                                            </th>
                                            <th className="pb-3 font-medium">
                                                Deleted At
                                            </th>
                                            <th className="pb-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((u) => (
                                            <tr
                                                key={u.id}
                                                className="border-b opacity-70 last:border-0"
                                            >
                                                <td className="py-3 font-medium">
                                                    {u.name}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {u.email}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {u.phone}
                                                </td>
                                                <td className="py-3 capitalize">
                                                    {u.role}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {new Date(
                                                        u.deleted_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRestore(
                                                                u.id,
                                                                u.name,
                                                            )
                                                        }
                                                        disabled={
                                                            !can(
                                                                'users.delete',
                                                            )
                                                        }
                                                    >
                                                        <RotateCcw className="mr-1.5 h-4 w-4" />
                                                        Restore
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {users.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {users.links.map((link) => (
                                    <Button
                                        key={link.label}
                                        variant={
                                            link.active
                                                ? 'secondary'
                                                : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <a
                                            href={link.url ?? '#'}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TrashedUsers.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: 'Deleted', href: '#' },
    ],
};
