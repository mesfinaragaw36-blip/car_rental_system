import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    payment: {
        id: number;
        amount: string;
        payment_method: string;
        transaction_reference: string | null;
        payment_status: string;
        paid_at: string | null;
    };
    booking: {
        id: number;
        pickup_date: string;
        return_date: string;
        pickup_location: string;
        return_location: string;
        total_price: string;
        days: number;
        daily_rate: string;
    };
    customer: {
        name: string;
        email: string;
        phone: string;
    } | null;
    car: {
        brand: string;
        model: string;
        plate_number: string;
    } | null;
}

export default function Receipt({ payment, booking, customer, car }: Props) {
    return (
        <>
            <Head title={`Receipt #${payment.id}`} />

            <div className="mx-auto max-w-2xl p-6">
                <div className="rounded-lg border bg-white p-8 shadow-sm">
                    <div className="border-b pb-6 text-center">
                        <h1 className="text-3xl font-bold">Payment Receipt</h1>

                        <p className="mt-2 text-muted-foreground">
                            Receipt #{payment.id}
                        </p>
                    </div>

                    <div className="space-y-4 border-b py-6">
                        <h2 className="text-lg font-semibold">
                            Customer Information
                        </h2>

                        {customer ? (
                            <>
                                <div className="flex justify-between">
                                    <span>Name</span>
                                    <span>{customer.name}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Email</span>
                                    <span>{customer.email}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Phone</span>
                                    <span>{customer.phone}</span>
                                </div>
                            </>
                        ) : (
                            <p>N/A</p>
                        )}
                    </div>

                    <div className="space-y-4 border-b py-6">
                        <h2 className="text-lg font-semibold">
                            Vehicle & Rental
                        </h2>

                        {car && (
                            <div className="flex justify-between">
                                <span>Vehicle</span>
                                <span>
                                    {car.brand} {car.model}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span>Plate</span>
                            <span>{car?.plate_number}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Pickup</span>
                            <span>{booking.pickup_date}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Return</span>
                            <span>{booking.return_date}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Location</span>
                            <span>
                                {booking.pickup_location} →{' '}
                                {booking.return_location}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 border-t py-6">
                        <h2 className="text-lg font-semibold">
                            Cost Breakdown
                        </h2>

                        <div className="flex justify-between">
                            <span>Daily Rate</span>
                            <span>ETB {booking.daily_rate}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Rental Days</span>
                            <span>{booking.days}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Calculation</span>
                            <span>
                                ETB {booking.daily_rate} × {booking.days}
                            </span>
                        </div>

                        <div className="flex justify-between border-t pt-4 text-xl font-bold">
                            <span>Total Paid</span>
                            <span>ETB {payment.amount}</span>
                        </div>
                    </div>

                    <div className="space-y-4 py-6">
                        <h2 className="text-lg font-semibold">
                            Payment Details
                        </h2>

                        <div className="flex justify-between">
                            <span>Method</span>
                            <span>{payment.payment_method}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Status</span>
                            <span>{payment.payment_status}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Paid At</span>
                            <span>{payment.paid_at ?? 'N/A'}</span>
                        </div>

                        <div className="flex justify-between border-t pt-4 text-xl font-bold">
                            <span>Total</span>
                            <span>ETB {payment.amount}</span>
                        </div>
                    </div>

                    <div className="border-t pt-6 text-center">
                        <Button onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>

                        <p className="mt-4 text-sm text-muted-foreground">
                            Thank you for choosing our service.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Receipt.layout = {
    breadcrumbs: [{ title: 'Receipt', href: '' }],
};
