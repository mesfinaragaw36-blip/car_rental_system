import { Head, useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store } from '@/routes/payments';

interface Booking {
    id: number; total_price: string;
    car: { brand: string; model: string; plate_number: string };
}

interface Props { booking: Booking; }

export default function PaymentForm({ booking }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    const { data, setData, post, processing, errors } = useForm({
        payment_method: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url({ booking: booking.id }), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Payment" />
            <div className="p-6 space-y-6 max-w-lg mx-auto">
                <h1 className="text-3xl font-bold">Payment</h1>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                <Card>
                    <CardHeader><CardTitle>Booking Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p>{booking.car.brand} {booking.car.model} ({booking.car.plate_number})</p>
                        <p className="text-2xl font-bold">ETB {booking.total_price}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Select Payment Method</Label>
                                <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Choose payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="telebirr">Telebirr</SelectItem>
                                        <SelectItem value="chapa">Chapa</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.payment_method} />
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Processing...' : 'Confirm Payment'}
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
        { title: 'Payment', href: '' },
    ],
};
