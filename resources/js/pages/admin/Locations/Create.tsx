import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateLocation() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        address: '',
        city: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        post('/admin/locations');
    }

    return (
        <>
            <Head title="Create Location" />

            <div className="space-y-6 p-6">
                <Link
                    href="/admin/locations"
                    className="text-sm text-muted-foreground hover:underline"
                >
                    &larr; Back to Locations
                </Link>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create New Location</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Location Name</Label>

                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Example: Bole Branch"
                                />

                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="address">Address</Label>

                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                    placeholder="Example: Bole Road"
                                />

                                <InputError message={errors.address} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="city">City</Label>

                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                    placeholder="Example: Addis Ababa"
                                />

                                <InputError message={errors.city} />
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Create Location'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
