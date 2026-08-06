import { Head, Link, router } from '@inertiajs/react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Location {
    id: number;
    name: string;
    address: string;
    city: string;
}

interface Props {
    locations: Location[];
}

export default function Index({ locations }: Props) {
    function deleteLocation(id: number) {
        if (confirm('Are you sure you want to delete this location?')) {
            router.delete(`/admin/locations/${id}`);
        }
    }

    return (
        <>
            <Head title="Locations" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Rental Locations</h1>

                    <Link href="/admin/locations/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Location
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Locations</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">
                                            Address
                                        </th>
                                        <th className="p-3 text-left">City</th>
                                        <th className="p-3 text-left">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {locations.map((location) => (
                                        <tr
                                            key={location.id}
                                            className="border-b"
                                        >
                                            <td className="p-3">
                                                {location.name}
                                            </td>

                                            <td className="p-3">
                                                {location.address}
                                            </td>

                                            <td className="p-3">
                                                {location.city}
                                            </td>

                                            <td className="flex gap-2 p-3">
                                                <Link
                                                    href={`/admin/locations/${location.id}/edit`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>

                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        deleteLocation(
                                                            location.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}

                                    {locations.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="p-6 text-center text-muted-foreground"
                                            >
                                                No locations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
