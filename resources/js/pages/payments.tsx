import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Payment {
    id: number;
    payment_method: string;
    payment_status: string;
    amount: string;
    paid_at: string | null;
    booking_id: number;
    customer: { id: number; name: string };
    car: { brand: string; model: string; plate_number: string };
}

interface Props { role: string; payments: Payment[]; }

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
};

export default function Payments({ role, payments = [] }: Props) {
    const { props: p } = usePage<{ toast?: { type: string; message: string } }>();
    const toast = p.toast;

    return (
        <>
            <Head title="Payments" />
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Payments</h1>

                {toast && (
                    <div className={`p-4 rounded-lg ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {toast.message}
                    </div>
                )}

                {payments.length === 0 ? (
                    <p className="text-muted-foreground">No payments found.</p>
                ) : (
                    <div className="space-y-4">
                        {payments.map((payment) => (
                            <Card key={payment.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold">
                                                {payment.car.brand} {payment.car.model} — ETB {payment.amount}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Booking #{payment.booking_id} | Customer: {payment.customer.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Method: {payment.payment_method.replace('_', ' ')} | Paid: {payment.paid_at ?? 'Not paid'}
                                            </p>
                                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[payment.payment_status] ?? 'bg-gray-100'}`}>
                                                {payment.payment_status}
                                            </span>
                                        </div>
                                        {role === 'customer' && payment.payment_status === 'pending' && (
                                            <Button size="sm" asChild>
                                                <Link href={`/payments/${payment.id}/edit`}>Pay Now</Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Payments.layout = {
    breadcrumbs: [{ title: 'Payments', href: '/payments' }],
};
