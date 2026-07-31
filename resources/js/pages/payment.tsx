import { Head, router, usePage, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Hash,
    CarFront,
    CalendarDays,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Booking {
    id: number;
    total_price: string;
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

export default function PaymentForm({ booking }: Props) {
    const { props: p } = usePage<{
        toast?: {
            type: string;
            message: string;
        };
    }>();

    const toast = p.toast;

    const [method, setMethod] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const selectedMethod = METHODS.find((m) => m.value === method);
    const showRefInput = selectedMethod?.needsRef ?? false;

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
            `/bookings/${booking.id}/payment`,
            {
                payment_method: method,
                transaction_reference: transactionRef.trim() || null,
            },
            {
                onFinish: () => setProcessing(false),
                onError: (errors) =>
                    setError(
                        Object.values(errors).join(' ') ||
                            'Something went wrong.'
                    ),
                onSuccess: () => {
                    setMethod('');
                    setTransactionRef('');
                },
            }
        );
    }

    return (
        <>
            <Head title="Payment" />

            <div className="mx-auto max-w-3xl space-y-6 p-6">

                <Link
                    href="/bookings"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Bookings
                </Link>

                <h1 className="text-3xl font-bold">
                    Complete Payment
                </h1>

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

                <Card className="shadow-lg rounded-2xl border-0">
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

                        <div className="border-t pt-4 flex justify-between items-center">

                            <span className="text-lg font-semibold">
                                Total Amount
                            </span>

                            <span className="text-3xl font-bold text-green-600">
                                ETB {booking.total_price}
                            </span>

                        </div>

                    </CardContent>
                </Card>

                {/* Payment */}

                <Card className="shadow-lg rounded-2xl border-0">

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
                                            className={`rounded-xl border p-5 text-left transition-all duration-200
                                            ${
                                                method === item.value
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'hover:bg-blue-50 hover:border-blue-300'
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

                                <div className="space-y-2">

                                    <Label className="flex items-center gap-2">

                                        <Hash className="h-4 w-4" />

                                        Transaction Reference

                                    </Label>

                                    <Input
                                        placeholder="Enter receipt / transaction number"
                                        value={transactionRef}
                                        onChange={(e) =>
                                            setTransactionRef(e.target.value)
                                        }
                                    />

                                </div>

                            )}

                            {error && <InputError message={error} />}

                            <Button
                                type="submit"
                                className="w-full h-12 text-base"
                                disabled={!method || processing}
                            >
                                {processing
                                    ? 'Processing Payment...'
                                    : `Pay ETB ${booking.total_price}`}
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