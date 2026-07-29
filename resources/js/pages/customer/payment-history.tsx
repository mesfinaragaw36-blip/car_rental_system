import { Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import {
    CreditCard,
    CarFront,
    CalendarDays,
    ReceiptText,
} from 'lucide-react';


interface Props {
    payments: any[];
}


export default function PaymentHistory({ payments }: Props) {

    return (
        <>
            <Head title="Payment History" />

            <div className="p-6 space-y-6">

                <h1 className="text-3xl font-bold">
                    Payment History
                </h1>


                {payments.length === 0 ? (

                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">
                                No payments found.
                            </p>
                        </CardContent>
                    </Card>


                ) : (


                    <div className="space-y-5">


                    {payments.map((payment) => (

                        <Card
                            key={payment.id}
                            className="rounded-2xl shadow-md hover:shadow-xl transition"
                        >

                        <CardContent className="p-6 space-y-5">


                            {/* Header */}

                            <div className="flex items-center justify-between">


                                <div className="flex items-center gap-3">


                                    <div className="rounded-xl bg-primary/10 p-3">

                                        <CarFront className="h-6 w-6 text-primary"/>

                                    </div>



                                    <div>

                                        <h2 className="text-xl font-bold">

                                            {payment.booking.car.brand}{' '}
                                            {payment.booking.car.model}

                                        </h2>


                                        <p className="text-sm text-muted-foreground">

                                            Booking Payment

                                        </p>


                                    </div>


                                </div>




                                <div>

                                    <p className="text-xl font-bold">

                                        ETB {payment.amount}

                                    </p>

                                </div>


                            </div>





                            {/* Status */}

                            <div className="flex items-center gap-3">


                                <span
                                    className={`rounded-full px-4 py-1 text-xs font-semibold ${
                                        payment.payment_status === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >

                                    {payment.payment_status}

                                </span>



                                <span className="flex items-center gap-1 text-sm text-muted-foreground">

                                    <CreditCard className="h-4 w-4"/>

                                    {payment.payment_method}

                                </span>


                            </div>






                            {/* Details */}

                            <div className="grid gap-4 md:grid-cols-3">


                                <div className="rounded-xl bg-gray-50 p-4">

                                    <ReceiptText className="mb-2 h-5 w-5"/>

                                    <p className="text-sm text-muted-foreground">
                                        Transaction Reference
                                    </p>

                                    <p className="font-semibold">
                                        {payment.transaction_reference ?? 'N/A'}
                                    </p>

                                </div>




                                <div className="rounded-xl bg-gray-50 p-4">

                                    <CalendarDays className="mb-2 h-5 w-5"/>

                                    <p className="text-sm text-muted-foreground">
                                        Paid Date
                                    </p>

                                    <p className="font-semibold">

                                        {payment.paid_at
                                        ? new Date(payment.paid_at)
                                            .toLocaleDateString()
                                        : 'Not available'}

                                    </p>

                                </div>





                                <div className="rounded-xl bg-gray-50 p-4">

                                    <CreditCard className="mb-2 h-5 w-5"/>

                                    <p className="text-sm text-muted-foreground">
                                        Payment Method
                                    </p>

                                    <p className="font-semibold">
                                        {payment.payment_method}
                                    </p>

                                </div>


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