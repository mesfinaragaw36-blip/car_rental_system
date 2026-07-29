import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Eye, Ban, PlayCircle, Trash2, KeyRound } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Auth } from '@/types';

const DEFAULT_PASSWORD = '12345678';

interface Role {
    id: number;
    name: string;
}

interface StaffRole {
    id: number;
    name: string;
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    created_at: string;
    staff_role: StaffRole | null;
}

interface PaginatedStaff {
    data: StaffMember[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    staff: PaginatedStaff;
    roles: Role[];
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'suspended': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export default function StaffIndex({ staff, roles }: Props) {
    const { props } = usePage<{ flash: FlashProps; auth: Auth }>();
    const toast = props.flash?.toast;
    const isFullAdmin = props.auth.user.role === 'admin' && props.auth.user.staff_role_id === null;

    const [dialogOpen, setDialogOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: DEFAULT_PASSWORD,
        password_confirmation: DEFAULT_PASSWORD,
        staff_role_id: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/staff', {
            onSuccess: () => {
 setDialogOpen(false); reset(); 
},
        });
    }

    function openDialog() {
        reset();
        setData('password', DEFAULT_PASSWORD);
        setData('password_confirmation', DEFAULT_PASSWORD);
        setDialogOpen(true);
    }

    function handleDelete(id: number, name: string) {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
router.delete(`/admin/staff/${id}`);
}
    }

    function handleSuspend(id: number) {
        if (confirm('Suspend this staff member?')) {
router.post(`/admin/staff/${id}/suspend`);
}
    }

    function handleActivate(id: number) {
        router.post(`/admin/staff/${id}/activate`);
    }

    return (
        <>
            <Head title="Staff Management" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    {isFullAdmin && (
                        <Button onClick={openDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Staff
                        </Button>
                    )}
                </div>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>All Staff</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {staff.data.length === 0 ? (
                            <p className="text-muted-foreground">No staff members yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="pb-3 font-medium">Name</th>
                                            <th className="pb-3 font-medium">Email</th>
                                            <th className="pb-3 font-medium">Phone</th>
                                            <th className="pb-3 font-medium">Role</th>
                                            <th className="pb-3 font-medium">Status</th>
                                            <th className="pb-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staff.data.map((member) => (
                                            <tr key={member.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium">{member.name}</td>
                                                <td className="py-3 text-muted-foreground">{member.email}</td>
                                                <td className="py-3 text-muted-foreground">{member.phone}</td>
                                                <td className="py-3">
                                                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                                        {member.staff_role?.name ?? 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(member.status)}`}>
                                                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/admin/staff/${member.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {isFullAdmin && (
                                                            <>
                                                                {member.status === 'active' ? (
                                                                    <Button size="sm" variant="outline" onClick={() => handleSuspend(member.id)}>
                                                                        <Ban className="h-4 w-4" />
                                                                    </Button>
                                                                ) : (
                                                                    <Button size="sm" variant="outline" onClick={() => handleActivate(member.id)}>
                                                                        <PlayCircle className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id, member.name)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {staff.links.length > 3 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {staff.links.map((link) => (
                                    <Button
                                        key={link.label}
                                        variant={link.active ? 'secondary' : 'outline'}
                                        size="sm"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <a href={link.url ?? '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Staff Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(v) => {
 setDialogOpen(v);

 if (!v) {
reset();
} 
}}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Staff Member</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="09xxxxxxxx"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="staff_role_id">Assign Role</Label>
                            <select
                                id="staff_role_id"
                                value={data.staff_role_id}
                                onChange={(e) => setData('staff_role_id', e.target.value)}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Select a role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.staff_role_id} />
                        </div>

                        {/* Default password notice */}
                        <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-3">
                            <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="text-sm">
                                <span className="text-muted-foreground">Default password: </span>
                                <code className="rounded bg-background px-1.5 py-0.5 font-mono font-semibold tracking-widest">
                                    {DEFAULT_PASSWORD}
                                </code>
                                <p className="mt-0.5 text-xs text-muted-foreground">The staff member should change this after first login.</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
 setDialogOpen(false); reset(); 
}}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating…' : 'Create Staff'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

StaffIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Staff', href: '/admin/staff' },
    ],
};
