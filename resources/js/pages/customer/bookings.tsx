import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    CalendarDays,
    MapPin,
    CreditCard,
    UserRound,
    CarFront,
} from 'lucide-react';

interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
}

interface Driver {
    id: number;
    name: string;
}

interface Payment {
    payment_method: string;
    payment_status: string;
    paid_at: string | null;
}

interface Booking {
    id: number;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    need_driver: boolean;
    total_price: string;
    status: string;
    car: Car;
    payment: Payment | null;
    driver_assignment: {
        driver: Driver | null;
    } | null;
}

interface Props {
    bookings: {
        data: Booking[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

interface FlashProps {
    toast?: {
        type: 'success' | 'error';
        message: string;
    };
}


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


export default function Bookings({ bookings }: Props) {

    const { props } = usePage<{ flash: FlashProps }>();

    const toast = props.flash?.toast;


    function handleCancel(id: number) {

        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        router.post(`/customer/bookings/${id}/cancel`);
    }


    return (
        <>
            <Head title="My Bookings" />


            <div className="p-6 space-y-6">

                <h1 className="text-3xl font-bold">
                    My Bookings
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



                {bookings.data.length === 0 ? (

                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">
                                You have no bookings yet.
                            </p>
                        </CardContent>
                    </Card>

                ) : (


                <div className="space-y-6">


                {bookings.data.map((booking)=>(


                    <Card
                        key={booking.id}
                        className="rounded-2xl shadow-md hover:shadow-xl transition"
                    >

                    <CardContent className="space-y-6 p-6">


                        {/* Car Header */}

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="rounded-xl bg-primary/10 p-3">
                                    <CarFront className="h-6 w-6 text-primary"/>
                                </div>


                                <div>

                                    <h2 className="text-xl font-bold">
                                        {booking.car.brand} {booking.car.model}
                                    </h2>


                                    <p className="text-sm text-muted-foreground">
                                        {booking.car.year}
                                    </p>

                                </div>

                            </div>



                            <p className="text-xl font-bold">
                                ETB {booking.total_price}
                            </p>


                        </div>




                        {/* Status */}

                        <div className="flex flex-wrap items-center gap-3">


                            <span
                                className={`rounded-full px-4 py-1 text-xs font-semibold capitalize ${
                                    STATUS_STYLES[booking.status]
                                }`}
                            >
                                {booking.status.replace('_',' ')}
                            </span>


                            {booking.payment && (

                                <span className="text-sm text-muted-foreground flex items-center gap-1">

                                    <CreditCard className="h-4 w-4"/>

                                    {booking.payment.payment_method}

                                </span>

                            )}


                        </div>





                        {/* Dates */}

                        <div className="grid gap-4 md:grid-cols-3">


                            <div className="rounded-xl bg-gray-50 p-4">

                                <CalendarDays className="mb-2 h-5 w-5"/>

                                <p className="text-sm text-muted-foreground">
                                    Pickup Date
                                </p>

                                <p className="font-semibold">
                                    {booking.pickup_date}
                                </p>

                            </div>



                            <div className="rounded-xl bg-gray-50 p-4">

                                <CalendarDays className="mb-2 h-5 w-5"/>

                                <p className="text-sm text-muted-foreground">
                                    Return Date
                                </p>

                                <p className="font-semibold">
                                    {booking.return_date}
                                </p>

                            </div>




                            <div className="rounded-xl bg-gray-50 p-4">

                                <UserRound className="mb-2 h-5 w-5"/>

                                <p className="text-sm text-muted-foreground">
                                    Driver
                                </p>

                                <p className="font-semibold">
                                    {booking.need_driver
                                    ? 'Required'
                                    : 'Not Required'}
                                </p>

                            </div>


                        </div>





                        {/* Locations */}

                        <div className="grid gap-4 md:grid-cols-2">


                            <div className="rounded-xl border p-4">

                                <MapPin className="mb-2 h-5 w-5"/>

                                <p className="text-sm text-muted-foreground">
                                    Pickup Location
                                </p>

                                <p className="font-semibold">
                                    {booking.pickup_location}
                                </p>

                            </div>




                            <div className="rounded-xl border p-4">

                                <MapPin className="mb-2 h-5 w-5"/>

                                <p className="text-sm text-muted-foreground">
                                    Return Location
                                </p>

                                <p className="font-semibold">
                                    {booking.return_location}
                                </p>

                            </div>


                        </div>





                        {/* Driver */}

                        {booking.driver_assignment?.driver && (

                            <div className="rounded-xl bg-muted p-4">

                                <p className="text-sm text-muted-foreground">
                                    Assigned Driver
                                </p>

                                <p className="font-semibold">
                                    {booking.driver_assignment.driver.name}
                                </p>

                            </div>

                        )}






                        {/* Buttons */}

                        <div className="flex flex-wrap gap-3 border-t pt-4">


                            {booking.status === 'approved'
                            && !booking.payment && (

                                <Link href={`/customer/bookings/${booking.id}/payment`}>

                                    <Button>
                                        Pay Now
                                    </Button>

                                </Link>

                            )}



                            {(booking.status === 'pending'
                            || booking.status === 'approved') && (

                                <Button
                                    variant="destructive"
                                    onClick={()=>handleCancel(booking.id)}
                                >
                                    Cancel Booking
                                </Button>

                            )}


                        </div>


                    </CardContent>

                    </Card>


                ))}


                </div>

                )}




                {/* Pagination */}

                {bookings.links.length > 0 && (

                    <div className="flex flex-wrap gap-2">

                        {bookings.links.map((link)=>(

                            <Button
                                key={link.label}
                                variant={
                                    link.active
                                    ? 'secondary'
                                    : 'outline'
                                }
                                asChild
                            >

                                <a
                                    href={link.url ?? '#'}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                    }}
                                />

                            </Button>

                        ))}

                    </div>

                )}


            </div>

        </>
    );
}