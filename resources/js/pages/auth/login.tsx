import { Form, Head } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            {status && (
                <div className="mb-5 rounded-xl border !border-[#87CEEB]/30 !bg-white/10 px-4 py-3 text-center text-sm font-medium !text-[#BCEBFA] backdrop-blur-sm">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Email */}
                        <div className="space-y-2">
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
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="h-11 rounded-xl pl-9 !border-[#D7F2F8] !bg-[#F7FCFF] !text-[#16425B] placeholder:!text-[#5E6A76]/50 shadow-none transition-all focus-visible:!border-[#87CEEB] focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-[#87CEEB]/40"
                                />
                            </div>

                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="font-semibold !text-white"
                                >
                                    Password
                                </Label>

                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs font-semibold !text-[#87CEEB] no-underline transition hover:!text-white hover:underline"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>

                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#007BA7]" />

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl pl-9 !border-[#D7F2F8] !bg-[#F7FCFF] !text-[#16425B] placeholder:!text-[#5E6A76]/50 shadow-none transition-all focus-visible:!border-[#87CEEB] focus-visible:!bg-white focus-visible:!ring-2 focus-visible:!ring-[#87CEEB]/40"
                                />
                            </div>

                            <InputError message={errors.password} />
                        </div>

                        {/* Remember */}
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                className="!border-white/40 data-[state=checked]:!border-[#87CEEB] data-[state=checked]:!bg-[#87CEEB] focus-visible:!ring-[#87CEEB]/30"
                            />

                            <Label
                                htmlFor="remember"
                                className="cursor-pointer text-sm font-normal !text-white/80 select-none"
                            >
                                Keep me signed in
                            </Label>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            className="mt-1 h-11 w-full rounded-full !bg-[#87CEEB] text-sm font-semibold !text-[#16425B] shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:!bg-white hover:shadow-lg"
                        >
                            {processing ? (
                                <>
                                    <Spinner />
                                    Signing in…
                                </>
                            ) : (
                                'Log in'
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-1 flex items-center gap-3">
                            <div className="h-px flex-1 !bg-white/15" />

                            <span className="text-xs !text-white/50">
                                or
                            </span>

                            <div className="h-px flex-1 !bg-white/15" />
                        </div>

                        {/* Register */}
                        <p className="text-center text-sm !text-white/70">
                            Don&apos;t have an account?{' '}

                            <TextLink
                                href={register()}
                                tabIndex={6}
                                className="font-semibold !text-[#87CEEB] no-underline transition hover:!text-white hover:underline"
                            >
                                Create one free
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Sign in to continue to Ethio Car Rental',
};