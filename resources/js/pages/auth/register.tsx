import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, Phone, User, ChevronDown } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = { passwordRules: string };

const inputStyle: React.CSSProperties = {
    backgroundColor: '#F8F9FA',
    borderColor: 'rgba(26,54,93,0.15)',
};

const labelStyle: React.CSSProperties = { color: '#1A365D', fontWeight: 600 };

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
                            <Label htmlFor="name" style={labelStyle}>Full name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                                <Input
                                    id="name" type="text" name="name" required autoFocus tabIndex={1} autoComplete="name"
                                    placeholder="John Doe"
                                    className="pl-9 h-11 rounded-xl border text-sm"
                                    style={inputStyle}
                                />
                            </div>
                            <InputError message={errors.name} />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" style={labelStyle}>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                                <Input
                                    id="email" type="email" name="email" required tabIndex={2} autoComplete="email"
                                    placeholder="you@example.com"
                                    className="pl-9 h-11 rounded-xl border text-sm"
                                    style={inputStyle}
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" style={labelStyle}>Phone number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                                <Input
                                    id="phone" type="tel" name="phone" required tabIndex={3} autoComplete="tel"
                                    placeholder="09xxxxxxxx"
                                    className="pl-9 h-11 rounded-xl border text-sm"
                                    style={inputStyle}
                                />
                            </div>
                            <InputError message={errors.phone} />
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="role" style={labelStyle}>I want to</Label>
                            <div className="relative">
                                <select
                                    id="role" name="role" required tabIndex={4} defaultValue=""
                                    className="h-11 w-full appearance-none rounded-xl border pl-3 pr-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                                    style={{ ...inputStyle, '--tw-ring-color': '#1A365D' } as React.CSSProperties}
                                >
                                    <option value="" disabled>Select a role…</option>
                                    <option value="customer">Rent a car (Customer)</option>
                                    <option value="owner">List my car (Owner)</option>
                                    <option value="driver">Work as a driver</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                            </div>
                            <InputError message={errors.role} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" style={labelStyle}>Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                                <PasswordInput
                                    id="password" name="password" required tabIndex={5} autoComplete="new-password"
                                    placeholder="••••••••" passwordrules={passwordRules}
                                    className="pl-9 h-11 rounded-xl border text-sm"
                                    style={inputStyle}
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" style={labelStyle}>Confirm password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#94a3b8' }} />
                                <PasswordInput
                                    id="password_confirmation" name="password_confirmation" required tabIndex={6}
                                    autoComplete="new-password" placeholder="••••••••" passwordrules={passwordRules}
                                    className="pl-9 h-11 rounded-xl border text-sm"
                                    style={inputStyle}
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            tabIndex={7}
                            data-test="register-user-button"
                            className="mt-1 h-11 w-full rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#1A365D', boxShadow: '0 4px 20px rgba(26,54,93,0.3)' }}
                        >
                            {processing ? <><Spinner /> Creating account…</> : 'Create account'}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center gap-3">
                            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(26,54,93,0.1)' }} />
                            <span className="text-xs" style={{ color: '#94a3b8' }}>or</span>
                            <div className="h-px flex-1" style={{ backgroundColor: 'rgba(26,54,93,0.1)' }} />
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm" style={{ color: '#64748b' }}>
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={8} className="font-bold no-underline hover:underline" style={{ color: '#FF6B00' }}>
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
