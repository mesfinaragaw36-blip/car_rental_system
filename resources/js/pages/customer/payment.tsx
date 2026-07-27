import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Booking {
    id: number;
    total_price: string;
    status: string;
    car: {
        id: number;
        brand: string;
        model: string;
    };
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

export default function Payment({ booking }: { booking: Booking }) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    const { data, setData, post, processing, errors } = useForm({
        payment_method: '',
        transaction_reference: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/customer/bookings/${booking.id}/payment`);
    };

    return (
        <>
            <Head title="Make Payment" />

            <div className="p-6 space-y-6">
                <Link href="/customer/bookings">
                    <Button variant="outline" size="sm">&larr; Back to Bookings</Button>
                </Link>

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

                <Card>
                    <CardContent className="space-y-6 p-6">
                        <h1 className="text-3xl font-bold">Make Payment</h1>

                        <div className="rounded-lg bg-muted px-4 py-3">
                            <p className="text-sm text-muted-foreground">Vehicle</p>
                            <p className="font-medium">{booking.car.brand} {booking.car.model}</p>
                        </div>

                        <div className="rounded-lg bg-muted px-4 py-3">
                            <p className="text-sm text-muted-foreground">Amount Due</p>
                            <p className="text-2xl font-bold">{booking.total_price} ETB</p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <select
                                    id="payment_method"
                                    value={data.payment_method}
                                    onChange={(e) => setData('payment_method', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select Method</option>
                                    <option value="Telebirr">Telebirr</option>
                                    <option value="CBE Birr">CBE Birr</option>
                                </select>
                                {errors.payment_method && (
                                    <p className="text-xs text-red-600">{errors.payment_method}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="transaction_reference">Transaction Reference</Label>
                                <Input
                                    id="transaction_reference"
                                    type="text"
                                    placeholder="Enter transaction reference number"
                                    value={data.transaction_reference}
                                    onChange={(e) => setData('transaction_reference', e.target.value)}
                                />
                                {errors.transaction_reference && (
                                    <p className="text-xs text-red-600">{errors.transaction_reference}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || !data.payment_method || !data.transaction_reference}
                            >
                                {processing ? 'Processing…' : 'Pay Now'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}