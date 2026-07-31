import { Head, router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { CreditCard, ArrowLeft, Hash } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Booking {
    id: number;
    total_price: string;
    pickup_date: string;
    return_date: string;
    car: { brand: string; model: string; plate_number: string };
    need_driver: boolean;
    driver: { name: string } | null;
}

interface Props { booking: Booking; }

const METHODS = [
    { value: 'Cash',         label: 'Cash',        needsRef: false },
    { value: 'Bank Transfer', label: 'Bank Transfer', needsRef: true },
    { value: 'Telebirr',     label: 'Telebirr',    needsRef: true },
    { value: 'CBE Birr',     label: 'CBE Birr',    needsRef: true },
];

export default function PaymentForm({ booking }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
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
 setError('Please select a payment method.');

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
            { payment_method: method, transaction_reference: transactionRef.trim() || null },
            {
                onFinish: () => setProcessing(false),
                onError: (errs) => setError(Object.values(errs).join(' ') || 'Something went wrong.'),
                onSuccess: () => {
 setTransactionRef(''); setMethod(''); 
},
            },
        );
    }

    return (
        <>
            <Head title="Payment" />
            <div className="p-6 space-y-6 max-w-lg mx-auto">

                <Link href="/bookings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to Bookings
                </Link>

                <h1 className="text-3xl font-bold">Complete Payment</h1>

                {toast && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {/* Summary */}
                <Card>
                    <CardHeader><CardTitle>Booking Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Vehicle</span>
                            <span className="font-medium">{booking.car.brand} {booking.car.model} ({booking.car.plate_number})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Dates</span>
                            <span className="font-medium">{booking.pickup_date} → {booking.return_date}</span>
                        </div>
                        {booking.need_driver && booking.driver && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Driver</span>
                                <span className="font-medium">{booking.driver.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Total</span>
                            <span className="text-xl font-bold text-primary">ETB {booking.total_price}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment method */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" /> Payment Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Select Payment Method</Label>
                                <Select value={method} onValueChange={(v) => {
 setMethod(v); setTransactionRef(''); 
}}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose a method…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {METHODS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {showRefInput && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="transaction_ref" className="flex items-center gap-1.5">
                                        <Hash className="h-4 w-4" /> Transaction Reference
                                    </Label>
                                    <Input
                                        id="transaction_ref"
                                        placeholder="Enter transaction/receipt number"
                                        value={transactionRef}
                                        onChange={(e) => setTransactionRef(e.target.value)}
                                    />
                                </div>
                            )}

                            {error && <InputError message={error} />}

                            <Button type="submit" className="w-full" disabled={processing || !method}>
                                {processing ? 'Processing…' : `Pay ETB ${booking.total_price}`}
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
        { title: 'Bookings', href: '/bookings' },
        { title: 'Payment', href: '#' },
    ],
};
