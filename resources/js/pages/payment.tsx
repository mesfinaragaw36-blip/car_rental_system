import { Head, router, usePage, Link } from '@inertiajs/react';
import { ArrowLeft, Hash, CarFront, CalendarDays, Wallet } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Booking {
    id: number;
    total_price: number;
    deposit_amount?: number;
    balance_amount?: number;
    security_deposit_amount?: number;
    extra_charge_amount?: number;
    pickup_date: string;
    return_date: string;
    car: {
        brand: string;
        model: string;
        plate_number: string;
    };
    need_driver: boolean;
    driver: {
        name: string;
    } | null;
}

interface Props {
    booking: Booking;
    mode?: 'deposit' | 'pickup' | 'extra_charge';
}

const METHODS = [
    {
        value: 'Cash',
        label: 'Cash',
        icon: '💵',
        needsRef: false,
    },
    {
        value: 'Bank Transfer',
        label: 'Bank Transfer',
        icon: '🏦',
        needsRef: true,
    },
    {
        value: 'Telebirr',
        label: 'Telebirr',
        icon: '📱',
        needsRef: true,
    },
    {
        value: 'CBE Birr',
        label: 'CBE Birr',
        icon: '💳',
        needsRef: true,
    },
];

const COMPANY_ACCOUNTS: Record<string, { label: string; value: string }[]> = {
    'Bank Transfer': [
        { label: 'Bank', value: 'Commercial Bank of Ethiopia' },
        { label: 'Account Name', value: 'Ethio Car Rental PLC' },
        { label: 'Account Number', value: '1000123456789' },
    ],
    Telebirr: [
        { label: 'Account Name', value: 'Ethio Car Rental PLC' },
        { label: 'Telebirr Number', value: '0911223344' },
    ],
    'CBE Birr': [
        { label: 'Account Name', value: 'Ethio Car Rental PLC' },
        { label: 'CBE Birr Number', value: '0911223344' },
    ],
};


const formatETB = (value: number) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export default function PaymentForm({ booking, mode = 'deposit' }: Props) {
    const { props: p } = usePage<{
        toast?: {
            type: string;
            message: string;
        };
    }>();

    const toast = p.toast;

    const isPickup = mode === 'pickup';
    const isExtraCharge = mode === 'extra_charge';

    const [method, setMethod] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const selectedMethod = METHODS.find((m) => m.value === method);
    const showRefInput = selectedMethod?.needsRef ?? false;
    const balanceDue = Math.max(
        0,
        booking.total_price - (booking.deposit_amount ?? 0),
    );
    const totalDueNow = isExtraCharge
        ? (booking.extra_charge_amount ?? 0)
        : (booking.balance_amount ?? 0) + (booking.security_deposit_amount ?? 0);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!method) {
            setError('Please choose a payment method.');

            return;
        }

        if (showRefInput && !transactionRef.trim()) {
            setError('Transaction reference is required.');

            return;
        }

        setError('');
        setProcessing(true);

        router.post(
            isExtraCharge
                ? `/bookings/${booking.id}/payment/extra-charge`
                : isPickup
                  ? `/bookings/${booking.id}/payment/pickup`
                  : `/bookings/${booking.id}/payment`,
            {
                payment_method: method,
                transaction_reference: transactionRef.trim() || null,
            },
            {
                onFinish: () => setProcessing(false),
                onError: (errors) =>
                    setError(
                        Object.values(errors).join(' ') ||
                            'Something went wrong.',
                    ),
                onSuccess: () => {
                    setMethod('');
                    setTransactionRef('');
                },
            },
        );
    }

    return (
        <>
            <Head title="Payment" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/bookings"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Bookings
                </Link>

                <h1 className="text-3xl font-bold">
                    {isExtraCharge
                        ? 'Pay Outstanding Balance'
                        : isPickup
                          ? 'Pay Rental Balance & Security Deposit'
                          : 'Pay Booking Deposit'}
                </h1>

                <p className="text-muted-foreground">
                    {isExtraCharge
                        ? 'Repair costs and/or late fees exceeded your security deposit. Please settle the remaining balance below.'
                        : isPickup
                          ? 'Pay the remaining rental balance plus the refundable security deposit to complete your payment before pickup.'
                          : 'Pay the 10% deposit to lock your dates. The remaining balance is due at pickup.'}
                </p>

                {toast && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Booking Summary */}

                <Card className="rounded-2xl border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CarFront className="h-5 w-5 text-blue-600" />
                            Booking Summary
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Vehicle
                            </span>

                            <span className="font-semibold">
                                {booking.car.brand} {booking.car.model}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                Rental Period
                            </span>

                            <span>
                                {booking.pickup_date} → {booking.return_date}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Plate Number
                            </span>

                            <span>{booking.car.plate_number}</span>
                        </div>

                        {booking.need_driver && booking.driver && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Driver
                                </span>

                                <span>{booking.driver.name}</span>
                            </div>
                        )}

                        <div className="space-y-2 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                    Total Amount
                                </span>
                                <span className="text-xl font-bold text-neutral-700">
                                    ETB {formatETB(booking.total_price)}
                                </span>
                            </div>
                            {isExtraCharge ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">
                                        Outstanding balance
                                    </span>
                                    <span className="text-3xl font-bold text-red-600">
                                        ETB {formatETB(totalDueNow)}
                                    </span>
                                </div>
                            ) : isPickup ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Already paid (deposit)
                                        </span>
                                        <span className="text-sm font-medium">
                                            ETB{' '}
                                            {formatETB(booking.deposit_amount ?? 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Rental balance
                                        </span>
                                        <span className="text-sm font-medium">
                                            ETB{' '}
                                            {formatETB(booking.balance_amount ?? 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Security deposit (refundable)
                                        </span>
                                        <span className="text-sm font-medium">
                                            ETB{' '}
                                            {formatETB(
                                                booking.security_deposit_amount ?? 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold">
                                            Total due now
                                        </span>
                                        <span className="text-3xl font-bold text-green-600">
                                            ETB {formatETB(totalDueNow)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Balance due at pickup
                                        </span>
                                        <span className="text-sm font-medium">
                                            ETB {formatETB(balanceDue)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold">
                                            Booking Deposit (10%)
                                        </span>
                                        <span className="text-3xl font-bold text-green-600">
                                            ETB{' '}
                                            {formatETB(booking.deposit_amount ?? 0)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment */}

                <Card className="rounded-2xl border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            Payment Method
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label className="mb-3 block">
                                    Choose how you want to pay
                                </Label>

                                <div className="grid grid-cols-2 gap-4">
                                    {METHODS.map((item) => (
                                        <button
                                            type="button"
                                            key={item.value}
                                            onClick={() => {
                                                setMethod(item.value);
                                                setTransactionRef('');
                                            }}
                                            className={`rounded-xl border p-5 text-left transition-all duration-200 ${
                                                method === item.value
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                        >
                                            <div className="text-3xl">
                                                {item.icon}
                                            </div>

                                            <div className="mt-2 font-semibold">
                                                {item.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                           {showRefInput && (
                                    <div className="space-y-2 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                                        {COMPANY_ACCOUNTS[method] && (
                                            <div className="mb-3 rounded-lg border border-blue-300 bg-white p-3">
                                                <p className="text-sm font-bold text-blue-900">
                                                    Send payment to
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    {COMPANY_ACCOUNTS[method].map((row) => (
                                                        <div
                                                            key={row.label}
                                                            className="flex justify-between text-sm"
                                                        >
                                                            <span className="text-muted-foreground">
                                                                {row.label}
                                                            </span>
                                                            <span className="font-semibold">
                                                                {row.value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-xs text-blue-700">
                                                    Complete the transfer first, then enter the
                                                    confirmation reference below.
                                                </p>
                                            </div>
                                        )}

                                        <Label className="flex items-center gap-2 text-sm font-bold">
                                            <Hash className="h-4 w-4 text-blue-600" />
                                            Transaction Reference
                                            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white uppercase">
                                                Required
                                            </span>
                                        </Label>

                                        <Input
                                            placeholder="Enter receipt / transaction number"
                                            value={transactionRef}
                                            onChange={(e) => setTransactionRef(e.target.value)}
                                            className="border-blue-300 bg-white focus-visible:ring-blue-400"
                                        />

                                        <p className="text-xs text-blue-700">
                                            For {method} payments, please enter the receipt or
                                            transaction number exactly as shown in your {method} app
                                            / bank slip. This is required so the branch can verify
                                            your payment.
                                        </p>

                                        {showRefInput && !transactionRef.trim() && (
                                            <p className="text-xs font-medium text-blue-800">
                                                Payment cannot be submitted without the transaction
                                                reference.
                                            </p>
                                        )}
                                    </div>
                                )}

                            {error && <InputError message={error} />}

                            <Button
                                type="submit"
                                className="h-12 w-full text-base"
                                disabled={!method || processing}
                            >
                                {processing
                                    ? 'Processing Payment...'
                                    : isExtraCharge
                                      ? `Pay ETB ${formatETB(totalDueNow)} Outstanding Balance`
                                      : isPickup
                                        ? `Pay ETB ${formatETB(totalDueNow)} Balance & Deposit`
                                        : `Pay ETB ${formatETB(booking.deposit_amount ?? 0)} Deposit`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PaymentForm.layout = {
    breadcrumbs: [
        {
            title: 'Bookings',
            href: '/bookings',
        },
        {
            title: 'Payment',
            href: '#',
        },
    ],
};