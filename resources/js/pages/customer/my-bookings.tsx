import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
}

interface PaymentInfo {
    payment_method: string;
    payment_status: string;
    paid_at: string | null;
}

interface Booking {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    total_price: string;
    need_driver: boolean;
    notes: string | null;
    car: Car;
    payment: PaymentInfo | null;
}

interface Props {
    bookings: Booking[];
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Telebirr', 'CBE Birr'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    picked_up: 'bg-purple-100 text-purple-800',
    returned: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending — waiting for owner approval',
    approved: 'Approved — please complete your payment below',
    rejected: 'Rejected by owner',
    paid: 'Paid — your booking is confirmed',
    picked_up: 'Picked up',
    returned: 'Returned',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function MyBookings({ bookings = [] }: Props) {
    const { props } = usePage<{ flash: FlashProps }>();
    const toast = props.flash?.toast;

    const [selectedMethods, setSelectedMethods] = useState<Record<number, PaymentMethod>>({});
    const [references, setReferences] = useState<Record<number, string>>({});
    const [processingId, setProcessingId] = useState<number | null>(null);

    function handlePay(bookingId: number): void {
        const method = selectedMethods[bookingId];
        if (!method) {
            return;
        }
        setProcessingId(bookingId);
        router.post(
            `/customer/bookings/${bookingId}/pay`,
            {
                payment_method: method,
                transaction_reference: references[bookingId] ?? '',
            },
            { onFinish: () => setProcessingId(null) },
        );
    }

    return (
        <>
            <Head title="My Bookings" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Bookings</h1>
                    <Link href="/customer/browse-cars">
                        <Button variant="outline">Browse More Cars</Button>
                    </Link>
                </div>

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
                    <CardHeader>
                        <CardTitle>Booking History</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {bookings.length === 0 ? (
                            <div className="space-y-3 text-center py-8">
                                <p className="text-muted-foreground">You have no bookings yet.</p>
                                <Link href="/customer/browse-cars">
                                    <Button>Find a Car</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-lg border p-4 space-y-3"
                                    >
                                        {/* Car + status badge */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold">
                                                    {booking.car.brand} {booking.car.model}{' '}
                                                    <span className="font-normal text-muted-foreground">
                                                        ({booking.car.year})
                                                    </span>
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {booking.car.plate_number}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    STATUS_STYLES[booking.status] ??
                                                    'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>

                                        {/* Status label */}
                                        <p className="text-sm text-muted-foreground">
                                            {STATUS_LABELS[booking.status] ?? booking.status}
                                        </p>

                                        {/* Dates + price */}
                                        <div className="text-sm space-y-0.5">
                                            <p>
                                                <span className="font-medium">Pickup: </span>
                                                {booking.pickup_date} &mdash;{' '}
                                                {booking.pickup_location}
                                            </p>
                                            <p>
                                                <span className="font-medium">Return: </span>
                                                {booking.return_date} &mdash;{' '}
                                                {booking.return_location}
                                            </p>
                                            <p>
                                                <span className="font-medium">Total: </span>
                                                <span className="font-bold">
                                                    ETB {booking.total_price}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Driver requested badge */}
                                        {booking.need_driver && (
                                            <p className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                Driver requested
                                            </p>
                                        )}

                                        {/* ── PAYMENT SECTION ── */}
                                        {booking.status === 'approved' && !booking.payment && (
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                                                <p className="text-sm font-semibold text-blue-800">
                                                    Complete your payment — ETB {booking.total_price}
                                                </p>

                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-blue-700">
                                                        Payment Method
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {PAYMENT_METHODS.map((method) => (
                                                            <button
                                                                key={method}
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedMethods((prev) => ({
                                                                        ...prev,
                                                                        [booking.id]: method,
                                                                    }))
                                                                }
                                                                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                                                                    selectedMethods[booking.id] ===
                                                                    method
                                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                                        : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
                                                                }`}
                                                            >
                                                                {method}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Transaction reference — shown for non-cash methods */}
                                                {selectedMethods[booking.id] &&
                                                    selectedMethods[booking.id] !== 'Cash' && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-blue-700">
                                                                Transaction Reference (optional)
                                                            </p>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. TXN-123456"
                                                                className="w-full rounded-md border border-blue-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                value={references[booking.id] ?? ''}
                                                                onChange={(e) =>
                                                                    setReferences((prev) => ({
                                                                        ...prev,
                                                                        [booking.id]: e.target.value,
                                                                    }))
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                <Button
                                                    className="w-full"
                                                    disabled={
                                                        processingId === booking.id ||
                                                        !selectedMethods[booking.id]
                                                    }
                                                    onClick={() => handlePay(booking.id)}
                                                >
                                                    {processingId === booking.id
                                                        ? 'Processing…'
                                                        : `Pay ETB ${booking.total_price}`}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Already paid confirmation */}
                                        {booking.payment && (
                                            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 space-y-0.5">
                                                <p className="font-semibold">Payment confirmed</p>
                                                <p>
                                                    Method:{' '}
                                                    <span className="font-medium">
                                                        {booking.payment.payment_method}
                                                    </span>
                                                </p>
                                                {booking.payment.paid_at && (
                                                    <p className="text-xs text-green-600">
                                                        Paid at {booking.payment.paid_at}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {booking.notes && (
                                            <p className="border-t pt-2 text-sm text-muted-foreground">
                                                <span className="font-medium">Notes: </span>
                                                {booking.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

