import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

interface Location {
    id: number;
    name: string;
    city: string;
}

interface Props {
    roles: Role[];
    locations: Location[];
}

export default function CreateStaff({ roles, locations }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        staff_role_id: '',
        branch_id: '',
        license_number: '',
        license_type: '',
        experience_years: '',
    });

    const isDriverRole = roles.some(
        (role) =>
            role.id === Number(data.staff_role_id) &&
            role.permissions.includes('driver.access'),
    );

    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault();
        post('/admin/staff');
    }

    return (
        <>
            <Head title="Create Staff" />

            <div className="space-y-6 p-6">
                <Link
                    href="/admin/staff"
                    className="text-sm text-muted-foreground hover:underline"
                >
                    &larr; Back to Staff
                </Link>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Create Staff Member</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    placeholder="09xxxxxxxx"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="staff_role_id">
                                    Assign Role
                                </Label>
                                <select
                                    id="staff_role_id"
                                    value={data.staff_role_id}
                                    onChange={(e) =>
                                        setData('staff_role_id', e.target.value)
                                    }
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.staff_role_id} />
                            </div>

                            {isDriverRole && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="license_number">
                                            License Number
                                        </Label>
                                        <Input
                                            id="license_number"
                                            value={data.license_number}
                                            onChange={(e) =>
                                                setData(
                                                    'license_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. DL-123456"
                                        />
                                        <InputError
                                            message={errors.license_number}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="license_type">
                                            License Type
                                        </Label>
                                        <select
                                            id="license_type"
                                            value={data.license_type}
                                            onChange={(e) =>
                                                setData(
                                                    'license_type',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                        >
                                            <option value="">
                                                Select license type
                                            </option>
                                            <option value="አውቶ">አውቶ</option>
                                            <option value="ህዝብ">ህዝብ</option>
                                            <option value="ደረቅ ጭነት">
                                                ደረቅ ጭነት
                                            </option>
                                            <option value="ፈሳሽ ጭነት">
                                                ፈሳሽ ጭነት
                                            </option>
                                            <option value="ግንባታ መሣሪያዎች / ኮንስትራክሽን">
                                                ግንባታ መሣሪያዎች / ኮንስትራክሽን
                                            </option>
                                        </select>
                                        <InputError
                                            message={errors.license_type}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="experience_years">
                                            Experience (Years)
                                        </Label>
                                        <Input
                                            id="experience_years"
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={data.experience_years}
                                            onChange={(e) =>
                                                setData(
                                                    'experience_years',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 3"
                                        />
                                        <InputError
                                            message={errors.experience_years}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="branch_id">Assign Branch</Label>
                                <select
                                    id="branch_id"
                                    value={data.branch_id}
                                    onChange={(e) =>
                                        setData('branch_id', e.target.value)
                                    }
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                >
                                    <option value="">Select a branch</option>
                                    {locations.map((location) => (
                                        <option
                                            key={location.id}
                                            value={location.id}
                                        >
                                            {location.name}, {location.city}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.branch_id} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create Staff'}
                                </Button>
                                <Link href="/admin/staff">
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

CreateStaff.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Staff', href: '/admin/staff' },
        { title: 'Create', href: '#' },
    ],
};
