import { Form, Head } from '@inertiajs/react';
import { Mail, Lock } from 'lucide-react';
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
                <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
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
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs text-muted-foreground no-underline hover:text-foreground"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-border/60 focus-visible:bg-background"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember */}
                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" name="remember" tabIndex={3} />
                            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer select-none">
                                Keep me signed in
                            </Label>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="mt-1 h-11 w-full rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
                            tabIndex={4}
                            disabled={processing}
                        >
                            {processing ? <><Spinner /> Signing in…</> : 'Sign in'}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-1 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border/60" />
                            <span className="text-xs text-muted-foreground">or</span>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={6} className="font-semibold text-foreground no-underline hover:underline">
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
