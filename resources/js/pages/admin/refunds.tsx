import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Refund = {
    id: number;
    booking_id: number;
    amount: string;
    reason: string;
    status: string;
    processed_at: string | null;
    customer: string | null;
    car: string | null;
    plate_number: string | null;
};

type Props = {
    refunds: Refund[];
};

export default function Refunds({ refunds = [] }: Props) {
    const processRefund = (id: number) => {
        if (!confirm('Mark this refund as processed?')) {
            return;
        }

        router.post(`/admin/refunds/${id}/process`);
    };

    return (
        <>
            <Head title="Refund Management" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Refund Management
                    </h1>
                    <p className="text-muted-foreground">
                        Review and process customer refunds.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            Refund Requests ({refunds.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {refunds.length === 0 ? (
                            <p className="text-muted-foreground">
                                No refund requests found.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {refunds.map((refund) => (
                                    <div
                                        key={refund.id}
                                        className="rounded-xl border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                Booking #{refund.booking_id}
                                            </p>

                                            <p>
                                                Customer: {refund.customer ?? 'N/A'}
                                            </p>

                                            <p>
                                                Vehicle: {refund.car ?? 'N/A'}
                                                {refund.plate_number &&
                                                    ` (${refund.plate_number})`}
                                            </p>

                                            <p>
                                                Amount: ETB {refund.amount}
                                            </p>

                                            <p>
                                                Reason: {refund.reason}
                                            </p>

                                            <p>
                                                Status:{' '}
                                                <span className="font-medium">
                                                    {refund.status}
                                                </span>
                                            </p>
                                        </div>

                                        {refund.status === 'pending' && (
                                            <Button
                                                onClick={() =>
                                                    processRefund(refund.id)
                                                }
                                            >
                                                Mark Processed
                                            </Button>
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