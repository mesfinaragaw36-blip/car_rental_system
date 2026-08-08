import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { approve, reject } from '@/routes/disputes';

interface Dispute {
    id: number;
    type: string;
    description: string;
    status: string;
    customer: {
        name: string;
    };
    owner: {
        name: string;
    };
    booking: {
        id: number;
        car: {
            brand: string;
            model: string;
        };
    };
}

export default function Disputes({ disputes }: { disputes: { data: Dispute[] } }) {
    return (
        <>
            <Head title="Booking Disputes" />

            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold">Booking Disputes</h1>

                {disputes.data.map((dispute) => (
                    <Card key={dispute.id}>
                        <CardContent className="space-y-3 p-5">
                            <p>
                                <b>Booking:</b> #{dispute.booking.id}
                            </p>
                            <p>
                                <b>Car:</b> {dispute.booking.car.brand}{' '}
                                {dispute.booking.car.model}
                            </p>
                            <p>
                                <b>Customer:</b> {dispute.customer.name}
                            </p>
                            <p>
                                <b>Owner:</b> {dispute.owner.name}
                            </p>
                            <p>
                                <b>Reason:</b> {dispute.description}
                            </p>
                            <p>
                                <b>Status:</b> {dispute.status}
                            </p>

                            {dispute.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            router.post(
                                                approve.url({ dispute: dispute.id }),
                                            );
                                        }}
                                    >
                                        Approve
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            router.post(
                                                reject.url({ dispute: dispute.id }),
                                            );
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
