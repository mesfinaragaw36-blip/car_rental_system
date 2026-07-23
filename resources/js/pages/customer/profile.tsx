import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface User {
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

interface Props {
    user: User;
}

export default function CustomerProfile({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/customer/profile');
    }

    return (
        <>
            <Head title="Customer Profile" />

            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Customer Profile</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Name
                                </label>

                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />

                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Phone
                                </label>

                                <Input
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Address
                                </label>

                                <Textarea
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                            </div>

                            <Button disabled={processing}>
                                {processing ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
