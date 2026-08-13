import { Head, router, usePage, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Hash,
    CarFront,
    CalendarDays,
    Wallet,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
] as const;

const COMPANY_ACCOUNTS: Record<
    string,
    { label: string; value: string }[]
> = {
    'Bank Transfer': [
        {
            label: 'Bank',
            value: 'Commercial Bank of Ethiopia',
        },
        {
            label: 'Account Name',
            value: 'Ethio Car Rental PLC',
        },
        {
            label: 'Account Number',
            value: '1000123456789',
        },
    ],

    Telebirr: [
        {
            label: 'Account Name',
            value: 'Ethio Car Rental PLC',
        },
        {
            label: 'Telebirr Number',
            value: '0911223344',
        },
    ],

    'CBE Birr': [
        {
            label: 'Account Name',
            value: 'Ethio Car Rental PLC',
        },
        {
            label: 'CBE Birr Number',
            value: '0911223344',
        },
    ],
};

const METHOD_LABELS: Record<string, string> = {
    Cash: 'Cash',
    'Bank Transfer': 'Bank Transfer',
    Telebirr: 'Telebirr',
    'CBE Birr': 'CBE Birr',
};

const formatETB = (value: number) =>
    new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

export default function PaymentForm({
    booking,
    mode = 'deposit',
}: Props) {
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

    const selectedMethod = METHODS.find(
        (item) => item.value === method,
    );

    const showRefInput = selectedMethod?.needsRef ?? false;

    const balanceDue = Math.max(
        0,
        booking.total_price - (booking.deposit_amount ?? 0),
    );

    const totalDueNow = isExtraCharge
        ? (booking.extra_charge_amount ?? 0)
        : (booking.balance_amount ?? 0) +
          (booking.security_deposit_amount ?? 0);

    function handleMethodChange(value: string) {
        setMethod(value);
        setTransactionRef('');
        setError('');
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!method) {
            setError('Please choose a payment method.');
            return;
        }

        if (showRefInput && !transactionRef.trim()) {
            setError(
                'Transaction reference is required for this payment method.',
            );
            return;
        }

        setError('');
        setProcessing(true);

        const endpoint = isExtraCharge
            ? `/bookings/${booking.id}/payment/extra-charge`
            : isPickup
              ? `/bookings/${booking.id}/payment/pickup`
              : `/bookings/${booking.id}/payment`;

        router.post(
            endpoint,
            {
                payment_method: method,
                transaction_reference: showRefInput
                    ? transactionRef.trim()
                    : '',
            },
            {
                onFinish: () => {
                    setProcessing(false);
                },

                onError: (errors) => {
                    const messages = Object.values(errors)
                        .filter(Boolean)
                        .join(' ');

                    setError(
                        messages ||
                            'Something went wrong. Please try again.',
                    );
                },

                onSuccess: () => {
                    setMethod('');
                    setTransactionRef('');
                    setError('');
                },
            },
        );
    }

    const paymentAmount = isExtraCharge
        ? totalDueNow
        : isPickup
          ? totalDueNow
          : booking.deposit_amount ?? 0;

    const paymentDescription = isExtraCharge
        ? 'Outstanding balance'
        : isPickup
          ? 'Rental balance & security deposit'
          : 'Booking deposit';

    return (
        <>
            <Head title="Payment" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                {/* Back */}
                <Link
                    href="/bookings"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Bookings
                </Link>

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">
                        {isExtraCharge
                            ? 'Pay Outstanding Balance'
                            : isPickup
                              ? 'Pay Rental Balance & Security Deposit'
                              : 'Pay Booking Deposit'}
                    </h1>

                    <p className="mt-2 text-muted-foreground">
                        {isExtraCharge
                            ? 'Pay the outstanding amount caused by additional charges.'
                            : isPickup
                              ? 'Pay the remaining rental balance and refundable security deposit before pickup.'
                              : 'Pay the required deposit to secure your booking.'}
                    </p>
                </div>

                {/* Toast */}
                {toast && (
                    <div
                        className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                            toast.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-800'
                                : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Payment confirmation notice */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        <div>
                            <p className="font-semibold text-amber-900">
                                Payment requires admin confirmation
                            </p>

                            <p className="mt-1 text-sm text-amber-800">
                                After you submit your payment, it will be
                                recorded as <strong>Pending</strong>. An
                                administrator will verify the payment and
                                confirm it before it is marked as{' '}
                                <strong>Paid</strong>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Booking Summary */}
                <Card className="rounded-2xl border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CarFront className="h-5 w-5 text-blue-600" />
                            Booking Summary
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Vehicle */}
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                                Vehicle
                            </span>

                            <span className="text-right font-semibold">
                                {booking.car.brand} {booking.car.model}
                            </span>
                        </div>

                        {/* Rental period */}
                        <div className="flex justify-between gap-4">
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                Rental Period
                            </span>

                            <span className="text-right">
                                {booking.pickup_date} →{' '}
                                {booking.return_date}
                            </span>
                        </div>

                        {/* Plate */}
                        <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">
                                Plate Number
                            </span>

                            <span>{booking.car.plate_number}</span>
                        </div>

                        {/* Driver */}
                        {booking.need_driver && booking.driver && (
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Driver
                                </span>

                                <span>{booking.driver.name}</span>
                            </div>
                        )}

                        {/* Amounts */}
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                    Total Rental Amount
                                </span>

                                <span className="text-xl font-bold">
                                    ETB {formatETB(booking.total_price)}
                                </span>
                            </div>

                            {isExtraCharge ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">
                                        Outstanding Balance
                                    </span>

                                    <span className="text-3xl font-bold text-red-600">
                                        ETB {formatETB(totalDueNow)}
                                    </span>
                                </div>
                            ) : isPickup ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Already Paid Deposit
                                        </span>

                                        <span className="font-medium">
                                            ETB{' '}
                                            {formatETB(
                                                booking.deposit_amount ?? 0,
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Rental Balance
                                        </span>

                                        <span className="font-medium">
                                            ETB{' '}
                                            {formatETB(
                                                booking.balance_amount ?? 0,
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Security Deposit (Refundable)
                                        </span>

                                        <span className="font-medium">
                                            ETB{' '}
                                            {formatETB(
                                                booking.security_deposit_amount ??
                                                    0,
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <span className="text-lg font-semibold">
                                            Total Due Now
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
                                            Balance Due at Pickup
                                        </span>

                                        <span className="font-medium">
                                            ETB {formatETB(balanceDue)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-3">
                                        <span className="text-lg font-semibold">
                                            Booking Deposit (10%)
                                        </span>

                                        <span className="text-3xl font-bold text-green-600">
                                            ETB{' '}
                                            {formatETB(
                                                booking.deposit_amount ?? 0,
                                            )}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="rounded-2xl border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            Payment Method
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {/* Methods */}
                            <div>
                                <Label className="mb-3 block">
                                    Choose how you want to pay
                                </Label>

                                <div className="grid grid-cols-2 gap-4">
                                    {METHODS.map((item) => (
                                        <button
                                            type="button"
                                            key={item.value}
                                            onClick={() =>
                                                handleMethodChange(
                                                    item.value,
                                                )
                                            }
                                            disabled={processing}
                                            className={`rounded-xl border p-5 text-left transition-all duration-200 ${
                                                method === item.value
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'hover:border-blue-300 hover:bg-blue-50'
                                            } ${
                                                processing
                                                    ? 'cursor-not-allowed opacity-60'
                                                    : ''
                                            }`}
                                        >
                                            <div className="text-3xl">
                                                {item.icon}
                                            </div>

                                            <div className="mt-2 font-semibold">
                                                {item.label}
                                            </div>

                                            <div className="mt-1 text-xs text-muted-foreground">
                                                {item.needsRef
                                                    ? 'Transaction reference required'
                                                    : 'No transaction reference required'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected payment amount */}
                            {method && (
                                <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4">
                                    <div>
                                        <p className="text-sm text-blue-700">
                                            {paymentDescription}
                                        </p>

                                        <p className="text-2xl font-bold text-blue-900">
                                            ETB {formatETB(paymentAmount)}
                                        </p>
                                    </div>

                                    <Wallet className="h-8 w-8 text-blue-600" />
                                </div>
                            )}

                            {/* Cash */}
                            {method === 'Cash' && (
                                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">💵</span>

                                        <div>
                                            <p className="font-semibold text-green-900">
                                                Cash Payment
                                            </p>

                                            <p className="mt-1 text-sm text-green-800">
                                                Pay the amount in cash at the
                                                rental branch.
                                            </p>

                                            <p className="mt-2 text-xs font-medium text-green-700">
                                                Your payment will remain{' '}
                                                <strong>Pending</strong> until
                                                an administrator receives and
                                                confirms the cash payment.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bank Transfer / Telebirr / CBE Birr */}
                            {showRefInput && (
                                <div className="space-y-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                                    {/* Company account */}
                                    {COMPANY_ACCOUNTS[method] && (
                                        <div className="rounded-lg border border-blue-300 bg-white p-3">
                                            <p className="text-sm font-bold text-blue-900">
                                                Send Payment To
                                            </p>

                                            <div className="mt-2 space-y-2">
                                                {COMPANY_ACCOUNTS[
                                                    method
                                                ].map((row) => (
                                                    <div
                                                        key={row.label}
                                                        className="flex justify-between gap-4 text-sm"
                                                    >
                                                        <span className="text-muted-foreground">
                                                            {row.label}
                                                        </span>

                                                        <span className="text-right font-semibold">
                                                            {row.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="mt-3 text-xs text-blue-700">
                                                Complete the payment first,
                                                then enter the transaction
                                                reference below. The payment
                                                will remain pending until an
                                                administrator verifies it.
                                            </p>
                                        </div>
                                    )}

                                    {/* Transaction reference */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm font-bold">
                                            <Hash className="h-4 w-4 text-blue-600" />

                                            Transaction Reference

                                            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                                                Required
                                            </span>
                                        </Label>

                                        <Input
                                            type="text"
                                            placeholder="Enter receipt / transaction number"
                                            value={transactionRef}
                                            onChange={(e) =>
                                                setTransactionRef(
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            className="border-blue-300 bg-white focus-visible:ring-blue-400"
                                        />

                                        <p className="text-xs text-blue-700">
                                            Enter the receipt or transaction
                                            number exactly as shown in your{' '}
                                            {METHOD_LABELS[method]} app or
                                            payment receipt.
                                        </p>

                                        {!transactionRef.trim() && (
                                            <p className="text-xs font-medium text-blue-800">
                                                Payment cannot be submitted
                                                without the transaction
                                                reference.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && <InputError message={error} />}

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="h-12 w-full text-base"
                                disabled={!method || processing}
                            >
                                {processing ? (
                                    'Submitting Payment...'
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Submit Payment of ETB{' '}
                                        {formatETB(paymentAmount)}
                                    </>
                                )}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground">
                                Your payment will be marked as{' '}
                                <strong>Pending</strong> after submission and
                                will only become{' '}
                                <strong>Paid</strong> after administrator
                                confirmation.
                            </p>
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