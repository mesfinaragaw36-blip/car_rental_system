import { Form, Head } from '@inertiajs/react';
import { Building2, ChevronDown, Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

const inputClassName =
    'h-11 rounded-xl pl-9 !bg-[#F7FCFF] !border-[#D7F2F8] !text-[#16425B] placeholder:!text-[#5E6A76]/50 shadow-none transition-all focus-visible:!border-[#87CEEB] focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-[#87CEEB]/40';

export default function Register({ passwordRules }: Props) {
    const [selectedRole, setSelectedRole] = useState('');
    const [ownerType, setOwnerType] = useState('');

    return (
        <>
            <Head title="Create account" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Organization Company Name - Only for Organization Owner */}
                        {selectedRole === 'owner' &&
                        ownerType === 'organization' ? (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="business_name"
                                    className="font-semibold !text-white"
                                >
                                    Company name
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                    <Input
                                        id="business_name"
                                        type="text"
                                        name="business_name"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="organization"
                                        placeholder="ABC Company Ltd."
                                        className={inputClassName}
                                    />
                                </div>
                                <InputError message={errors.business_name} />
                            </div>
                        ) : (
                            /* Full Name - For Individual Owner, Customer, Driver */
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="font-semibold !text-white">
                                    Full name
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        className={inputClassName}
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>
                        )}

                        {/* Company Contact - Only for Organization Owner */}
                        {selectedRole === 'owner' &&
                        ownerType === 'organization' ? (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="phone"
                                    className="font-semibold !text-white"
                                >
                                    Company contact
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        required
                                        tabIndex={2}
                                        autoComplete="tel"
                                        placeholder="09xxxxxxxx"
                                        className={inputClassName}
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>
                        ) : (
                            /* Phone - For Individual Owner, Customer, Driver */
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="font-semibold !text-white">
                                    Phone number
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        required
                                        tabIndex={3}
                                        autoComplete="tel"
                                        placeholder="09xxxxxxxx"
                                        className={inputClassName}
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>
                        )}

                        {/* Email - Always visible */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="email"
                                className="font-semibold !text-white"
                            >
                                Email
                            </Label>

                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />

                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    tabIndex={
                                        selectedRole === 'owner' &&
                                        ownerType === 'organization'
                                            ? 3
                                            : 2
                                    }
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className={inputClassName}
                                />
                            </div>

                            <InputError message={errors.email} />
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="role"
                                className="font-semibold !text-white"
                            >
                                I want to
                            </Label>

                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    tabIndex={4}
                                    defaultValue=""
                                    value={selectedRole}
                                    onChange={(e) => {
                                        setSelectedRole(e.target.value);
                                        if (e.target.value !== 'owner') {
                                            setOwnerType('');
                                        }
                                    }}
                                    className="h-11 w-full appearance-none rounded-xl border border-[#D7F2F8] bg-[#F7FCFF] py-2 pr-9 pl-3 text-sm text-[#16425B] shadow-none transition-all focus-visible:border-[#87CEEB] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87CEEB]/40"
                                >
                                    <option
                                        value=""
                                        disabled
                                        className="text-[#5E6A76]/50"
                                    >
                                        Select a role…
                                    </option>

                                    <option value="customer">
                                        Customer
                                    </option>

                                    <option value="owner">
                                        Owner
                                    </option>

                                    <option value="driver">
                                        Driver
                                    </option>
                                </select>

                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                            </div>

                            <InputError message={errors.role} />
                        </div>

                        {/* Owner Type - Only show when Owner is selected */}
                        {selectedRole === 'owner' && (
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="owner_type"
                                    className="font-semibold !text-white"
                                >
                                    Owner type
                                </Label>
                                <div className="relative">
                                    <select
                                        id="owner_type"
                                        name="owner_type"
                                        required
                                        tabIndex={5}
                                        defaultValue=""
                                        value={ownerType}
                                        onChange={(e) =>
                                            setOwnerType(e.target.value)
                                        }
                                        className="h-11 w-full appearance-none rounded-xl border border-[#D7F2F8] bg-[#F7FCFF] py-2 pr-9 pl-3 text-sm text-[#16425B] shadow-none transition-all focus-visible:border-[#87CEEB] focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#87CEEB]/40"
                                    >
                                        <option value="" disabled>
                                            Select owner type…
                                        </option>
                                        <option value="individual">
                                            Individual
                                        </option>
                                        <option value="organization">
                                            Organization
                                        </option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                </div>
                                <InputError message={errors.owner_type} />
                            </div>
                        )}

                        {/* Trade License Number - Only for Organization */}
                        {selectedRole === 'owner' &&
                            ownerType === 'organization' && (
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="trade_license_number"
                                        className="font-semibold !text-white"
                                    >
                                        Trade license number
                                    </Label>
                                    <div className="relative">
                                        <Building2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                        <Input
                                            id="trade_license_number"
                                            type="text"
                                            name="trade_license_number"
                                            required
                                            tabIndex={6}
                                            placeholder="TL-123456789"
                                            className={inputClassName}
                                        />
                                    </div>
                                    <InputError
                                        message={errors.trade_license_number}
                                    />
                                </div>
                            )}

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="password"
                                className="font-semibold !text-white"
                            >
                                Password
                            </Label>

                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={
                                        selectedRole === 'owner' &&
                                        ownerType === 'organization'
                                            ? 7
                                            : 5
                                    }
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    passwordrules={passwordRules}
                                    className={inputClassName}
                                />
                            </div>

                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="password_confirmation"
                                className="font-semibold !text-white"
                            >
                                Confirm password
                            </Label>

                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    tabIndex={
                                        selectedRole === 'owner' &&
                                        ownerType === 'organization'
                                            ? 8
                                            : 6
                                    }
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    passwordrules={passwordRules}
                                    className={inputClassName}
                                />
                            </div>

                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            tabIndex={
                                selectedRole === 'owner' &&
                                ownerType === 'organization'
                                    ? 9
                                    : 7
                            }
                            disabled={processing}
                            data-test="register-user-button"
                            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full !bg-[#87CEEB] text-sm font-semibold !text-[#16425B] shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:!bg-white hover:shadow-lg disabled:opacity-60"
                        >
                            {processing ? (
                                <>
                                    <Spinner />
                                    Creating account…
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center gap-3">
                            <div className="h-px flex-1 !bg-white/15" />

                            <span className="text-xs !text-white/50">
                                or
                            </span>

                            <div className="h-px flex-1 !bg-white/15" />
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm !text-white/70">
                            Already have an account?{' '}

                            <TextLink
                                href={login()}
                                tabIndex={
                                    selectedRole === 'owner' &&
                                    ownerType === 'organization'
                                        ? 10
                                        : 8
                                }
                                className="font-semibold !text-[#87CEEB] no-underline transition hover:!text-white hover:underline"
                            >
                                Sign in
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Join Ethio Car Rental — it only takes a minute',
};