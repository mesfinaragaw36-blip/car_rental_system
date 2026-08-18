import type { FormComponentOptions } from '@inertiajs/core';
import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
function RefundAccountFields({
    profile,
    errors,
}: {
    profile?: Record<string, string | number | null>;
    errors: Record<string, string | undefined>;
}) {
    const [refundMethod, setRefundMethod] = useState<string>(
        String(profile?.refund_method ?? ''),
    );

    return (
        <div className="rounded-2xl border border-muted p-4 space-y-4">
            <div>
                <p className="text-sm font-medium">Refund Payment Details</p>
                <p className="text-xs text-muted-foreground">
                    Choose one payout method to use if a refund needs to be
                    issued to you.
                </p>
            </div>

            <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="refund_method"
                        value="cbe"
                        checked={refundMethod === 'cbe'}
                        onChange={() => setRefundMethod('cbe')}
                    />
                    CBE Bank
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        name="refund_method"
                        value="telebirr"
                        checked={refundMethod === 'telebirr'}
                        onChange={() => setRefundMethod('telebirr')}
                    />
                    Telebirr
                </label>
            </div>

            <InputError className="mt-2" message={errors.refund_method} />

            {refundMethod === 'cbe' && (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="cbe_account_number">
                            CBE Account Number
                        </Label>
                        <Input
                            id="cbe_account_number"
                            className="mt-1 block w-full"
                            defaultValue={profile?.cbe_account_number ?? ''}
                            name="cbe_account_number"
                            placeholder="CBE account number"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.cbe_account_number}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cbe_account_holder_name">
                            CBE Account Holder Name
                        </Label>
                        <Input
                            id="cbe_account_holder_name"
                            className="mt-1 block w-full"
                            defaultValue={
                                profile?.cbe_account_holder_name ?? ''
                            }
                            name="cbe_account_holder_name"
                            placeholder="Name on the CBE account"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.cbe_account_holder_name}
                        />
                    </div>
                </>
            )}

            {refundMethod === 'telebirr' && (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="telebirr_number">
                            Telebirr Number
                        </Label>
                        <Input
                            id="telebirr_number"
                            className="mt-1 block w-full"
                            defaultValue={profile?.telebirr_number ?? ''}
                            name="telebirr_number"
                            placeholder="Telebirr number"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.telebirr_number}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="telebirr_account_holder_name">
                            Telebirr Account Holder Name
                        </Label>
                        <Input
                            id="telebirr_account_holder_name"
                            className="mt-1 block w-full"
                            defaultValue={
                                profile?.telebirr_account_holder_name ?? ''
                            }
                            name="telebirr_account_holder_name"
                            placeholder="Name on the Telebirr account"
                        />
                        <InputError
                            className="mt-2"
                            message={errors.telebirr_account_holder_name}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
function verificationBadgeClass(status: string): string {
    switch (status) {
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-brand-soft text-brand';
    }
}

export default function Profile() {
    const { auth, profile } = usePage<PageProps>().props;
    const role = auth.user.role;
    const isDriver =
        role === 'driver' ||
        (role === 'admin' &&
            auth.user.staff_role_id != null &&
            (auth.user.permissions ?? []).includes('driver.access'));

    const verificationStatus = String(
        profile?.verification_status ?? 'unverified',
    );
    const isApproved = verificationStatus === 'approved';
    const isRejected = verificationStatus === 'rejected';

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

                {profile?.average_rating !== undefined && (
                    <div className="rounded-2xl border border-muted bg-muted/5 p-4">
                        <p className="text-sm text-muted-foreground">
                            Average rating
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {profile.average_rating} ★
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {profile.review_count ?? 0} review
                            {(profile.review_count ?? 0) === 1 ? '' : 's'}
                        </p>
                    </div>
                )}

                <Form
                    {...ProfileController.update.form()}
                    options={
                        {
                            preserveScroll: true,
                            forceFormData: true,
                        } as FormComponentOptions
                    }
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
                                        <Label htmlFor="phone">
                                            Phone number
                                        </Label>

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
                                            defaultValue={String(
                                                auth.user.address ?? '',
                                            )}
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

                                    <div className="rounded-2xl border border-muted p-4">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Identity verification status
                                        </p>
                                        <span
                                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${verificationBadgeClass(verificationStatus)}`}
                                        >
                                            {verificationStatus
                                                .charAt(0)
                                                .toUpperCase() +
                                                verificationStatus.slice(1)}
                                        </span>
                                    </div>
                                    <RefundAccountFields profile={profile} errors={errors} />
                                    {isApproved ? (
                                        <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                                            <p className="text-sm text-green-800">
                                                Your identity has been verified.
                                                You can book vehicles.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {isRejected && (
                                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                                                    <p className="text-sm text-red-800">
                                                        Your previous submission
                                                        was rejected. Please
                                                        review and resubmit your
                                                        details below.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid gap-2">
                                                <Label htmlFor="national_id_number">
                                                    National ID Number
                                                </Label>

                                                <Input
                                                    id="national_id_number"
                                                    className="mt-1 block w-full"
                                                    defaultValue={
                                                        profile?.national_id_number ??
                                                        ''
                                                    }
                                                    name="national_id_number"
                                                    inputMode="numeric"
                                                    maxLength={12}
                                                    required
                                                    placeholder="12-digit Fayda ID number"
                                                />

                                                <InputError
                                                    className="mt-2"
                                                    message={
                                                        errors.national_id_number
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="national_id_front">
                                                    National ID - Front photo
                                                </Label>

                                                <Input
                                                    id="national_id_front"
                                                    type="file"
                                                    accept="image/*"
                                                    className="mt-1 block w-full"
                                                    name="national_id_front"
                                                />

                                                <InputError
                                                    className="mt-2"
                                                    message={
                                                        errors.national_id_front
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="national_id_back">
                                                    National ID - Back photo
                                                </Label>

                                                <Input
                                                    id="national_id_back"
                                                    type="file"
                                                    accept="image/*"
                                                    className="mt-1 block w-full"
                                                    name="national_id_back"
                                                />

                                                <InputError
                                                    className="mt-2"
                                                    message={
                                                        errors.national_id_back
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {role === 'owner' && (
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            Phone number
                                        </Label>

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
                                            maxLength={12}
                                            placeholder="12-digit National ID number(FIN)"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.national_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="national_id_front_file">
                                            National ID photo (front)
                                        </Label>

                                        <p className="text-sm text-muted-foreground">
                                            Upload a clear photo of the front of
                                            your National ID card.
                                        </p>

                                        <Input
                                            id="national_id_front_file"
                                            type="file"
                                            className="mt-1 block w-full"
                                            name="national_id_front_file"
                                            accept="image/*"
                                        />

                                        {profile?.national_id_front_file_path && (
                                            <p className="text-sm text-muted-foreground">
                                                Existing file:{' '}
                                                className="text-primary
                                                underline" href=
                                                {`/storage/${profile.national_id_front_file_path}`}
                                                target="_blank" rel="noreferrer"
                                                <a>View upload</a>
                                            </p>
                                        )}

                                        <InputError
                                            className="mt-2"
                                            message={
                                                errors.national_id_front_file
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="national_id_back_file">
                                            National ID photo (back)
                                        </Label>

                                        <p className="text-sm text-muted-foreground">
                                            Upload a clear photo of the back of
                                            your National ID card.
                                        </p>

                                        <Input
                                            id="national_id_back_file"
                                            type="file"
                                            className="mt-1 block w-full"
                                            name="national_id_back_file"
                                            accept="image/*"
                                        />

                                        {profile?.national_id_back_file_path && (
                                            <p className="text-sm text-muted-foreground">
                                                Existing file:{' '}
                                                className="text-primary
                                                underline" href=
                                                {`/storage/${profile.national_id_back_file_path}`}
                                                target="_blank" rel="noreferrer"
                                                <a>View upload</a>
                                            </p>
                                        )}

                                        <InputError
                                            className="mt-2"
                                            message={
                                                errors.national_id_back_file
                                            }
                                        />
                                    </div>

                                                                <div className="rounded-2xl border border-muted p-4">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Verification status
                                </p>
                                <p className="mt-2 text-base font-semibold">
                                    {profile?.verification_status ??
                                        'pending'}
                                </p>
                            </div>

                            <RefundAccountFields profile={profile} errors={errors} />
                        </div>
                    )}

                            {isDriver && (
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">
                                            Phone number
                                        </Label>

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
                                        <Label htmlFor="license_number">
                                            License number
                                        </Label>

                                        <Input
                                            id="license_number"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                profile?.license_number ?? ''
                                            }
                                            name="license_number"
                                            required
                                            placeholder="e.g. DL-012345"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.license_number}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="license_type">
                                            License type (Ethiopian)
                                        </Label>

                                        <select
                                            id="license_type"
                                            name="license_type"
                                            defaultValue={
                                                profile?.license_type ?? ''
                                            }
                                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                        >
                                            <option value="" disabled>
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
                                            className="mt-2"
                                            message={errors.license_type}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="experience_years">
                                            Years of experience
                                        </Label>

                                        <Input
                                            id="experience_years"
                                            type="number"
                                            min={0}
                                            max={50}
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                profile?.experience_years ?? ''
                                            }
                                            name="experience_years"
                                            required
                                            placeholder="Years of experience"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.experience_years}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="location">
                                            Location / City
                                        </Label>

                                        <Input
                                            id="location"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                profile?.location ?? ''
                                            }
                                            name="location"
                                            required
                                            placeholder="e.g. Addis Ababa"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.location}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Submit
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
