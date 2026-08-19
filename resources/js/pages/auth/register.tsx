import { Form, Head } from '@inertiajs/react';
import { ChevronDown, Lock, Mail, Phone, User } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = { passwordRules: string };

const inputClassName =
    'h-11 rounded-xl pl-9 !bg-[#F7FCFF] !border-[#D7F2F8] !text-[#16425B] placeholder:!text-[#5E6A76]/50 shadow-none transition-all focus-visible:!border-[#007BA7] focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-[#87CEEB]/40';

export default function Register({ passwordRules }: Props) {
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
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="font-semibold !text-[#16425B]">
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

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="font-semibold !text-[#16425B]">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className={inputClassName}
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="font-semibold !text-[#16425B]">
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

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="role" className="font-semibold !text-[#16425B]">
                                I want to
                            </Label>
                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    tabIndex={4}
                                    defaultValue=""
                                    className="h-11 w-full appearance-none rounded-xl py-2 pr-9 pl-3 text-sm shadow-none transition-all focus-visible:outline-none !bg-[#F7FCFF] !border !border-[#D7F2F8] !text-[#16425B] focus-visible:!border-[#007BA7] focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-[#87CEEB]/40"
                                >
                                    <option value="" disabled className="text-[#5E6A76]/50">
                                        Select a role…
                                    </option>
                                    <option value="customer">Customer</option>
                                    <option value="owner">Owner</option>
                                    <option value="driver">Driver</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                            </div>
                            <InputError message={errors.role} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="font-semibold !text-[#16425B]">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={5}
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
                                className="font-semibold !text-[#16425B]"
                            >
                                Confirm password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    tabIndex={6}
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
                            tabIndex={7}
                            disabled={processing}
                            data-test="register-user-button"
                            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full !bg-[#16425B] text-sm font-semibold !text-white shadow-md shadow-[#16425B]/15 transition-all hover:-translate-y-0.5 hover:!bg-[#007BA7] hover:shadow-lg hover:shadow-[#007BA7]/20 disabled:opacity-60"
                        >
                            {processing ? (
                                <>
                                    <Spinner /> Creating account…
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center gap-3">
                            <div className="h-px flex-1 !bg-[#D7F2F8]" />
                            <span className="text-xs !text-[#5E6A76]">
                                or
                            </span>
                            <div className="h-px flex-1 !bg-[#D7F2F8]" />
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm !text-[#5E6A76]">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={8}
                                className="font-semibold !text-[#007BA7] no-underline transition hover:!text-[#16425B] hover:underline"
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