import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    profile?: Record<string, string | number | null>;
};

export default function Profile() {
    const { auth, profile } = usePage<PageProps>().props;
    const role = auth.user.role;

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your profile information"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                        forceFormData: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {role === 'customer' && (
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone number</Label>

                                        <Input
                                            id="phone"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.phone ?? ''}
                                            name="phone"
                                            required
                                            autoComplete="tel"
                                            placeholder="Phone number"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.phone}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="address">Address</Label>

                                        <Input
                                            id="address"
                                            className="mt-1 block w-full"
                                            defaultValue={String(auth.user.address ?? '')}
                                            name="address"
                                            required
                                            autoComplete="street-address"
                                            placeholder="Address"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.address}
                                        />
                                    </div>
                                </div>
                            )}

                            {role === 'owner' && (
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="business_name">
                                            Business name
                                        </Label>

                                        <Input
                                            id="business_name"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                profile?.business_name ?? ''
                                            }
                                            name="business_name"
                                            required
                                            placeholder="Business name"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.business_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="national_id">
                                            National ID
                                        </Label>

                                        <Input
                                            id="national_id"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                profile?.national_id ?? ''
                                            }
                                            name="national_id"
                                            required
                                            placeholder="National ID"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.national_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="trade_license_number">
                                            Trade license number
                                        </Label>

                                        <Input
                                            id="trade_license_number"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                profile?.trade_license_number ?? ''
                                            }
                                            name="trade_license_number"
                                            required
                                            placeholder="Trade license number"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.trade_license_number}
                                        />
                                    </div>

                                    <div className="rounded-2xl border border-muted p-4">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Verification status
                                        </p>
                                        <p className="mt-2 text-base font-semibold">
                                            {profile?.verification_status ?? 'pending'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {role === 'driver' && (
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone number</Label>

                                        <Input
                                            id="phone"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.phone ?? ''}
                                            name="phone"
                                            required
                                            autoComplete="tel"
                                            placeholder="Phone number"
                                        />

                                        <InputError className="mt-2" message={errors.phone} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="license_number">
                                            License number
                                        </Label>

                                        <Input
                                            id="license_number"
                                            className="mt-1 block w-full"
                                            defaultValue={profile?.license_number ?? ''}
                                            name="license_number"
                                            required
                                            placeholder="e.g. DL-012345"
                                        />

                                        <InputError className="mt-2" message={errors.license_number} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="license_type">License type (Ethiopian)</Label>

                                        <select
                                            id="license_type"
                                            name="license_type"
                                            defaultValue={profile?.license_type ?? ''}
                                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="" disabled>Select license type</option>
                                            <option value="Light Vehicle">Light Vehicle (የቀላል ተሽከርካሪ)</option>
                                            <option value="Heavy Vehicle">Heavy Vehicle (የከባድ ተሽከርካሪ)</option>
                                            <option value="Motorcycle">Motorcycle (ቢስክሌት)</option>
                                            <option value="Public Service">Public Service (የህዝብ ትራንስፖርት)</option>
                                        </select>

                                        <InputError className="mt-2" message={errors.license_type} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="experience_years">Years of experience</Label>

                                        <Input
                                            id="experience_years"
                                            type="number"
                                            min={0}
                                            max={50}
                                            className="mt-1 block w-full"
                                            defaultValue={profile?.experience_years ?? ''}
                                            name="experience_years"
                                            required
                                            placeholder="Years of experience"
                                        />

                                        <InputError className="mt-2" message={errors.experience_years} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="daily_rate">Daily Rate (ETB)</Label>

                                        <Input
                                            id="daily_rate"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            className="mt-1 block w-full"
                                            defaultValue={profile?.daily_rate ?? ''}
                                            name="daily_rate"
                                            required
                                            placeholder="e.g. 500"
                                        />

                                        <InputError className="mt-2" message={errors.daily_rate} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location / City</Label>

                                        <Input
                                            id="location"
                                            className="mt-1 block w-full"
                                            defaultValue={profile?.location ?? ''}
                                            name="location"
                                            required
                                            placeholder="e.g. Addis Ababa"
                                        />

                                        <InputError className="mt-2" message={errors.location} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="availability">Availability</Label>

                                        <select
                                            id="availability"
                                            name="availability"
                                            defaultValue={profile?.availability ?? 'available'}
                                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="available">Available</option>
                                            <option value="unavailable">Unavailable</option>
                                        </select>

                                        <InputError className="mt-2" message={errors.availability} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="license_file">Upload license file</Label>

                                        <Input
                                            id="license_file"
                                            type="file"
                                            className="mt-1 block w-full"
                                            name="license_file"
                                            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                        />

                                        {profile?.license_file_path && (
                                            <p className="text-sm text-muted-foreground">
                                                Existing file: <a className="text-primary underline" href={`/storage/${profile.license_file_path}`} target="_blank" rel="noreferrer">View license</a>
                                            </p>
                                        )}

                                        <InputError className="mt-2" message={errors.license_file} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="national_id_file">Upload national ID</Label>

                                        <Input
                                            id="national_id_file"
                                            type="file"
                                            className="mt-1 block w-full"
                                            name="national_id_file"
                                            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                                        />

                                        {profile?.national_id_file_path && (
                                            <p className="text-sm text-muted-foreground">
                                                Existing file: <a className="text-primary underline" href={`/storage/${profile.national_id_file_path}`} target="_blank" rel="noreferrer">View national ID</a>
                                            </p>
                                        )}

                                        <InputError className="mt-2" message={errors.national_id_file} />
                                    </div>

                                    <div className="rounded-2xl border border-muted p-4">
                                        <p className="text-sm font-medium text-muted-foreground">Verification status</p>
                                        <p className="mt-2 text-base font-semibold capitalize">
                                            {profile?.verification_status ?? 'pending'}
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Uploads and driver profile changes will be reviewed by an administrator.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
