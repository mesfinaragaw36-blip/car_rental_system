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
    'h-11 rounded-xl border-border/60 bg-muted/50 pl-9 focus-visible:bg-background';

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
                            <Label htmlFor="name" className="font-semibold">
                                Full name
                            </Label>
                            <div className="relative">
                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            <Label htmlFor="email" className="font-semibold">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            <Label htmlFor="phone" className="font-semibold">
                                Phone number
                            </Label>
                            <div className="relative">
                                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            <Label htmlFor="role" className="font-semibold">
                                I want to
                            </Label>
                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    tabIndex={4}
                                    defaultValue=""
                                    className="h-11 w-full appearance-none rounded-xl border border-border/60 bg-muted/50 py-2 pr-9 pl-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                                >
                                    <option value="" disabled>
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
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <InputError message={errors.role} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="font-semibold">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                                className="font-semibold"
                            >
                                Confirm password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                            data-test="register-user-button"
                            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-60"
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
                            <div className="h-px flex-1 bg-border/60" />
                            <span className="text-xs text-muted-foreground">
                                or
                            </span>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={8}
                                className="font-semibold text-accent no-underline hover:underline"
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
