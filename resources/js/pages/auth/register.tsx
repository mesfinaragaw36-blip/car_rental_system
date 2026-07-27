import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, Phone, User, ChevronDown } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = { passwordRules: string };

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
                            <Label htmlFor="name">Full name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    placeholder="John Doe"
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background"
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone">Phone number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    required
                                    tabIndex={3}
                                    autoComplete="tel"
                                    placeholder="09xxxxxxxx"
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background"
                                />
                            </div>
                            <InputError message={errors.phone} />
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="role">I want to</Label>
                            <div className="relative">
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    tabIndex={4}
                                    defaultValue=""
                                    className="h-11 w-full appearance-none rounded-xl border border-border/60 bg-muted/50 pl-3 pr-9 text-sm shadow-sm transition-colors focus-visible:bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="" disabled>Select a role…</option>
                                    <option value="customer">Customer</option>
                                    <option value="owner">Owner</option>
                                    <option value="driver">Driver</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <InputError message={errors.role} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    passwordrules={passwordRules}
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    passwordrules={passwordRules}
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="mt-1 h-11 w-full rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
                            tabIndex={7}
                            data-test="register-user-button"
                        >
                            {processing ? <><Spinner /> Creating account…</> : 'Create account'}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-1 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border/60" />
                            <span className="text-xs text-muted-foreground">or</span>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={8} className="font-semibold text-foreground no-underline hover:underline">
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
    description: 'Join DriveEasy — it only takes a minute',
};
