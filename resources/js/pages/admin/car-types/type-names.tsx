import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TypeName {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    sort_order: number;
    cars_count?: number;
}

interface Props {
    items: TypeName[];
}

interface FlashProps {
    toast?: { type: 'success' | 'error'; message: string };
}

export default function TypeNamesIndex({ items }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TypeName | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        is_active: true,
        sort_order: 0,
    });

    function openCreate() {
        setEditingItem(null);
        reset();
        setDialogOpen(true);
    }

    function openEdit(item: TypeName) {
        setEditingItem(item);
        setData({
            name: item.name,
            is_active: item.is_active,
            sort_order: item.sort_order,
        });
        setDialogOpen(true);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editingItem) {
            put(`/admin/car-types/type-names/${editingItem.id}`, {
                onSuccess: () => {
                    setDialogOpen(false);
                    setEditingItem(null);
                    reset();
                },
            });
        } else {
            post('/admin/car-types/type-names', {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
            });
        }
    }

    function handleDelete(id: number, name: string) {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(`/admin/car-types/type-names/${id}`);
        }
    }

    return (
        <>
            <Head title="Car Type Names" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Car Type Names</h1>
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Type Name
                    </Button>
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

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">No type names created yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sort Order</TableHead>
                                    <TableHead>Cars</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{item.sort_order}</TableCell>
                                        <TableCell>{item.cars_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={(v) => {
 setDialogOpen(v);

 if (!v) {
 setEditingItem(null); reset(); 
} 
}}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Type Name' : 'Add Type Name'}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Sedan"
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', Number(e.target.value))}
                            />
                            {errors.sort_order && <InputError message={errors.sort_order} />}
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v === true)}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        </div>
                        {errors.is_active && <InputError message={errors.is_active} />}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
 setDialogOpen(false); setEditingItem(null); reset(); 
}}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : editingItem ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

TypeNamesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Car Types', href: '/admin/car-types/type-names' },
        { title: 'Type Names', href: '/admin/car-types/type-names' },
    ],
};
