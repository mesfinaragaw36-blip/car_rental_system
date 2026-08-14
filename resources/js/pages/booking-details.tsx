import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Car,
    User,
    CalendarDays,
    Clock,
    MapPin,
    CreditCard,
    CircleDollarSign,
    UserCircle,
    Files,
    Ban,
    ClipboardCheck,
    ArrowDownToLine,
    Gauge,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    Check,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCan } from '@/hooks/use-can';
import { approve, reject, cancel, complete } from '@/routes/bookings';
import reviews from '@/routes/bookings/reviews';

interface ReviewTarget {
    key: string;
    label: string;
    type: 'car' | 'user';
    id: number;
    name: string;
    alreadyReviewed: boolean;
}

interface Damage {
    area: string;
    description: string;
}

interface InspectionHistory {
    id: number;
    type: 'pickup' | 'return';
    status: 'approved' | 'issues_found' | 'pending';
    conducted_at: string | null;
    conducted_by_name: string | null;
    mileage_reading: number | null;
    fuel_level: number | null;
    damages: Damage[] | null;
    notes: string | null;
    photos?: string[] | null;
    id_verified?: boolean;
    id_verified_by_name?: string | null;
    id_verified_at?: string | null;
}

interface BookingDetails {
    id: number;
    status: string;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    total_price: string;
    need_driver: boolean;
    notes: string | null;
    days: number;
    daily_rate: string;
    customer: { id: number; name: string; phone: string; email: string } | null;
    owner: { id: number; name: string; phone: string } | null;
    car: {
        id: number;
        brand: string;
        model: string;
        year: number;
        plate_number: string;
        estimated_value?: string | number | null;
    } | null;
    
        security_deposit: number;
        late_fee_deduction: number;
        extra_charge: number;
        additional_charge: number;
    car_delivery_status?: 'pending' | 'arrived' | 'failed';
    car_delivery_confirmed_at?: string | null;
    car_delivery_due_date?: string;
    pickup_inspection_approved?: boolean;
    payment: {
        id: number;
        payment_method: string;
        payment_status: string;
        paid_at: string | null;
    } | null;
    security_deposit_amount: string;
    balance_amount: string;
    has_balance_paid: boolean;
    has_security_deposit_paid: boolean;
    balance_paid_at: string | null;
    security_deposit_paid_at: string | null;
    refunds?: {
        id: number;
        amount: string;
        reason: string;
        created_at: string;
    }[];
    payout?: {
        gross_amount: string;
        commission_amount: string;
        net_amount: string;
        status: string;
        paid_at: string | null;
    } | null;
    driver: { id: number; name: string; phone: string } | null;
    driver_status: string | null;
    identity_approved?: boolean;
    identity_status?: string | null;
    picked_up_at: string | null;
    returned_at: string | null;
    reviewed?: Record<string, boolean>;
    review_targets?: ReviewTarget[];
    can_review?: boolean;
    inspections?: InspectionHistory[];
    reviews?: {
        id: number;
        reviewer: { id: number; name: string };
        target: string;
        rating: number;
        review_text: string | null;
    }[];
    late_days: number | null;
    late_fee: number | string | null;
}

interface Props {
    booking: BookingDetails;
    role: string;
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    deposit_paid: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    picked_up: 'bg-purple-100 text-purple-800',
    returned: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export default function BookingDetails({ booking, role }: Props) {
    const { props: p } = usePage<{
        toast?: { type: string; message: string };
    }>();
    const toast = p.toast;
    const can = useCan();

    const { data, setData, post, processing, errors, reset } = useForm({
        reviewable_type: '',
        reviewable_id: 0,
        rating: 5,
        review_text: '',
    });

    const [selectedReviewTarget, setSelectedReviewTarget] =
        useState<ReviewTarget | null>(null);

    const [expandedInspection, setExpandedInspection] = useState<
        number | null
    >(null);

    const handleAction = (action: string) => {
        const routeMap: Record<string, any> = {
            approve,
            reject,
            cancel,
            complete,
        };
        router.post(
            routeMap[action].url({ booking: booking.id }),
            {},
            { preserveScroll: true },
        );
    };


    const handleCancelClick = () => {
        const depositPaid = booking.status !== 'confirmed';

        if (depositPaid) {
            const totalPrice = parseFloat(booking.total_price);
            const balanceAmount = parseFloat(booking.balance_amount);
            const depositAmount = totalPrice - balanceAmount;
            const refundAmount = (depositAmount * 0.75).toFixed(2);
            const retainedAmount = (depositAmount * 0.25).toFixed(2);

            const confirmed = window.confirm(
                `You've already paid your deposit. Cancelling now means:\n\n` +
                    `• ETB ${refundAmount} (75%) will be refunded\n` +
                    `• ETB ${retainedAmount} (25%) is non-refundable\n\n` +
                    `Do you want to continue?`,
            );

            if (!confirmed) {
return;
}
        } else {
            if (!window.confirm('Are you sure you want to cancel this booking?')) {
return;
}
        }

        handleAction('cancel');
    };

    const selectReviewTarget = (target: ReviewTarget) => {
        setSelectedReviewTarget(target);
        setData('reviewable_type', target.type);
        setData('reviewable_id', target.id);
        setData('rating', 5);
        setData('review_text', '');
    };

    const handleReviewSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedReviewTarget) {
            return;
        }

        post(reviews.store.url({ booking: booking.id }), {
            preserveScroll: true,
            onSuccess: () => {
                reset('review_text');
                setSelectedReviewTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Booking Details" />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <Link
                    href="/bookings"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Bookings
                </Link>

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                        Booking #{booking.id}
                    </h1>
                    <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[booking.status] ?? 'bg-gray-100'}`}
                    >
                        {booking.status}
                    </span>
                </div>

                {toast && (
                    <div
                        className={`rounded-lg p-4 ${toast.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                        {toast.message}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" /> Vehicle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {booking.car !== null ? (
                                <>
                                    <p className="text-lg font-semibold">
                                        {booking.car.brand} {booking.car.model} ({booking.car.year})
                                    </p>
                                    <p className="text-muted-foreground">
                                        Plate: {booking.car.plate_number}
                                    </p>
                                    {booking.car.estimated_value ? (
                                        <p className="text-muted-foreground">
                                            Estimated value: ETB{' '}
                                            {Number(booking.car.estimated_value).toLocaleString()}
                                        </p>
                                    ) : null}
                                </>
                            ) : (
                                <p className="text-muted-foreground">Vehicle details unavailable</p>
                            )}
                            {booking.car_delivery_status && (
                                <div className="mt-2 space-y-1 border-t pt-2">
                                    <p className="text-muted-foreground">
                                        Owner car delivery
                                    </p>
                                    <p
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            booking.car_delivery_status ===
                                            'arrived'
                                                ? 'bg-green-100 text-green-700'
                                                : booking.car_delivery_status ===
                                                    'failed'
                                                  ? 'bg-red-100 text-red-700'
                                                  : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {booking.car_delivery_status.replace(
                                            '_',
                                            ' ',
                                        )}
                                    </p>
                                    {booking.car_delivery_due_date && (
                                        <p className="text-xs text-muted-foreground">
                                            Due by{' '}
                                            {booking.car_delivery_due_date}
                                        </p>
                                    )}
                                    {booking.car_delivery_confirmed_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Confirmed{' '}
                                            {new Date(
                                                booking.car_delivery_confirmed_at,
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CircleDollarSign className="h-5 w-5" /> Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Daily Rate
                                </span>
                                <span>ETB {booking.daily_rate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Days
                                </span>
                                <span>{booking.days}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-semibold">Total</span>
                                <span className="text-xl font-bold text-primary">
                                    ETB {booking.total_price}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" /> Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">
                                    Pickup:{' '}
                                </span>
                                {booking.pickup_date}
                            </p>
                            <p>
                                <span className="text-muted-foreground">
                                    Return:{' '}
                                </span>
                                {booking.return_date}
                            </p>

                            {booking.picked_up_at && (
                                <p>
                                    <span className="text-muted-foreground">
                                        Picked up at:{' '}
                                    </span>
                                    {booking.picked_up_at}
                                </p>
                            )}

                            {booking.returned_at && (
                                <p>
                                    <span className="text-muted-foreground">
                                        Returned at:{' '}
                                    </span>
                                    {booking.returned_at}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                                        {booking.late_days != null && booking.late_days > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" /> Late Return
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Days late
                                    </span>
                                    <span className="font-medium">
                                        {booking.late_days} day
                                        {booking.late_days !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Late fee
                                    </span>
                                    <span className="font-semibold">
                                        ETB{' '}
                                        {Number(booking.late_fee).toLocaleString(
                                            'en-US',
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            },
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Security deposit
                                    </span>
                                    <span>
                                        ETB{' '}
                                        {Number(
                                            booking.security_deposit,
                                        ).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-muted-foreground">
                                        Deposit deducted
                                    </span>
                                    <span>
                                        ETB{' '}
                                        {Number(
                                            booking.late_fee_deduction,
                                        ).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>

                               {booking.extra_charge > 0 && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Additional charge
                                                    </span>
                                                    <span className="font-semibold text-destructive">
                                                        ETB{' '}
                                                        {Number(booking.extra_charge).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="font-semibold">
                                                        Remaining Amount Due
                                                    </span>
                                                    <span className="font-bold text-destructive">
                                                        ETB{' '}
                                                        {Number(booking.extra_charge).toLocaleString('en-US', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                

                                {booking.extra_charge === 0 &&
                                    booking.late_fee_deduction <
                                        Number(booking.late_fee) && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Refund
                                            </span>
                                            <span className="font-semibold">
                                                ETB{' '}
                                                {(
                                                    Number(
                                                        booking.security_deposit,
                                                    ) -
                                                    Number(
                                                        booking.late_fee_deduction,
                                                    )
                                                ).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" /> Locations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">
                                    Pickup:{' '}
                                </span>
                                {booking.pickup_location}
                            </p>
                            <p>
                                <span className="text-muted-foreground">
                                    Return:{' '}
                                </span>
                                {booking.return_location}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" /> Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {booking.customer ? (
                                <>
                                    <p className="font-medium">
                                        {booking.customer.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {booking.customer.phone}
                                        {booking.customer.email
                                            ? ` \u00B7 ${booking.customer.email}`
                                            : ''}
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">N/A</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5" /> Owner
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {booking.owner ? (
                                <>
                                    <p className="font-medium">
                                        {booking.owner.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {booking.owner.phone}
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">N/A</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Payment
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-2 text-sm">
                            {booking.payment ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Booking deposit
                                        </span>
                                        <span className="font-medium">
                                            Paid
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Balance due
                                        </span>
                                        <span className="font-medium">
                                            ETB {booking.balance_amount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Security deposit
                                        </span>
                                        <span className="font-medium">
                                            ETB{' '}
                                            {booking.security_deposit_amount}
                                        </span>
                                    </div>

                                    <div className="space-y-1 border-t pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Balance paid
                                            </span>
                                            <span
                                                className={
                                                    booking.has_balance_paid
                                                        ? 'font-medium text-green-600'
                                                        : 'text-muted-foreground'
                                                }
                                            >
                                                {booking.has_balance_paid
                                                    ? (booking.balance_paid_at ??
                                                      'Yes')
                                                    : 'Not paid'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Security deposit
                                            </span>
                                            <span
                                                className={
                                                    booking.has_security_deposit_paid
                                                        ? 'font-medium text-green-600'
                                                        : 'text-muted-foreground'
                                                }
                                            >
                                                {booking.has_security_deposit_paid
                                                    ? (booking.security_deposit_paid_at ??
                                                      'Paid')
                                                    : 'Not paid'}
                                            </span>
                                        </div>
                                        <p>
                                            Method:{' '}
                                            {booking.payment.payment_method}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Deposit paid:{' '}
                                            {booking.payment.paid_at ?? 'N/A'}
                                        </p>
                                    </div>

                                    {booking.payment.payment_status ===
                                        'paid' && (
                                        <Button asChild className="mt-3">
                                            <Link
                                                href={`/payments/${booking.payment.id}/receipt`}
                                            >
                                                View Deposit Receipt
                                            </Link>
                                        </Button>
                                    )}

                                    {booking.payout && (
                                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs">
                                            <p className="font-semibold text-blue-800">
                                                Owner payout ·{' '}
                                                {booking.payout.status}
                                            </p>
                                            <p className="text-blue-700">
                                                Gross ETB{' '}
                                                {booking.payout.gross_amount} ·
                                                Commission ETB{' '}
                                                {
                                                    booking.payout
                                                        .commission_amount
                                                }{' '}
                                                · Net ETB{' '}
                                                {booking.payout.net_amount}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-muted-foreground">
                                    Not paid yet
                                </p>
                            )}

                            {(booking.late_days ?? 0) > 0 && (
                                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-amber-900">
                                                    Late Return Fee
                                                </h3>
                                                <p className="mt-1 text-sm text-amber-700">
                                                    The vehicle was returned {booking.late_days} day
                                                    {booking.late_days === 1 ? '' : 's'} late.
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                                                    Fee Charged
                                                </p>
                                                <p className="mt-1 text-xl font-bold text-amber-900">
                                                    ETB {Number(booking.late_fee ?? 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {booking.refunds && booking.refunds.length > 0 && (
                        
                                <div className="border-t pt-2">
                                    <p className="font-semibold text-green-700">
                                        Refunds
                                    </p>
                                    {booking.refunds.map((refund) => (
                                        <div
                                            key={refund.id}
                                            className="flex justify-between"
                                        >
                                            <span className="text-muted-foreground">
                                                ETB {refund.amount} ·{' '}
                                                {refund.reason}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Files className="h-5 w-5" /> Driver
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {booking.need_driver ? (
                                booking.driver ? (
                                    <>
                                        <p className="font-medium">
                                            {booking.driver.name}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {booking.driver.phone}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">
                                        No driver assigned yet
                                    </p>
                                )
                            ) : (
                                <p className="text-muted-foreground">
                                    Not requested
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {booking.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{booking.notes}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" /> Inspection
                            History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {booking.inspections &&
                        booking.inspections.length > 0 ? (
                            booking.inspections.map((inspection) => (
                                <div
                                    key={inspection.id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="flex items-center gap-2 font-semibold capitalize">
                                            {inspection.type === 'pickup' ? (
                                                <ArrowDownToLine className="h-4 w-4 text-blue-600" />
                                            ) : (
                                                <Gauge className="h-4 w-4 text-indigo-600" />
                                            )}
                                            {inspection.type} inspection
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    inspection.status ===
                                                    'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : inspection.status ===
                                                            'issues_found'
                                                          ? 'bg-red-100 text-red-700'
                                                          : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {inspection.status ===
                                                'approved' ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                ) : (
                                                    <XCircle className="h-3.5 w-3.5" />
                                                )}
                                                {inspection.status ===
                                                'issues_found'
                                                    ? 'Rejected'
                                                    : inspection.status}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setExpandedInspection(
                                                        expandedInspection ===
                                                            inspection.id
                                                            ? null
                                                            : inspection.id,
                                                    )
                                                }
                                                title={
                                                    expandedInspection ===
                                                    inspection.id
                                                        ? 'Hide details'
                                                        : 'Show details'
                                                }
                                            >
                                                {expandedInspection ===
                                                inspection.id ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {inspection.conducted_at
                                            ? `${new Date(inspection.conducted_at).toLocaleString()} by ${inspection.conducted_by_name ?? 'staff'}`
                                            : 'Conducted'}
                                        {inspection.mileage_reading !== null &&
                                            ` · ${inspection.mileage_reading.toLocaleString()} km`}
                                        {inspection.fuel_level !== null &&
                                            ` · ${inspection.fuel_level}% fuel`}
                                    </p>
                                    {expandedInspection === inspection.id && (
                                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                                            {inspection.type === 'pickup' && (
                                                <div>
                                                    {inspection.id_verified ? (
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Check className="h-3.5 w-3.5 text-green-600" />
                                                            <span className="font-medium text-green-700">
                                                                ID Verified
                                                            </span>
                                                            {inspection.id_verified_by_name && (
                                                                <span className="text-muted-foreground">
                                                                    · by{' '}
                                                                    {
                                                                        inspection.id_verified_by_name
                                                                    }
                                                                </span>
                                                            )}
                                                            {inspection.id_verified_at && (
                                                                <span className="text-muted-foreground">
                                                                    ·{' '}
                                                                    {new Date(
                                                                        inspection.id_verified_at,
                                                                    ).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <X className="h-3.5 w-3.5 text-amber-600" />
                                                            <span className="font-medium text-amber-700">
                                                                ID Verification
                                                                Pending
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {inspection.damages &&
                                                inspection.damages.length >
                                                    0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                                                            Damages
                                                        </p>
                                                        <ul className="mt-1 list-inside list-disc text-sm text-red-600">
                                                            {inspection.damages.map(
                                                                (damage, i) => (
                                                                    <li
                                                                        key={i}
                                                                    >
                                                                        <span className="font-medium">
                                                                            {
                                                                                damage.area
                                                                            }
                                                                        </span>{' '}
                                                                        -{' '}
                                                                        {
                                                                            damage.description
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            {inspection.notes && (
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        Notes
                                                    </p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {inspection.notes}
                                                    </p>
                                                </div>
                                            )}
                                            {inspection.photos &&
                                                inspection.photos.length >
                                                    0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                            Evidence Photos
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {inspection.photos.map(
                                                                (path, i) => (
                                                                    <a
                                                                        key={i}
                                                                        href={`/storage/${path}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="block h-16 w-16 overflow-hidden rounded-md border shadow-sm hover:opacity-90"
                                                                    >
                                                                        <img
                                                                            src={`/storage/${path}`}
                                                                            alt="Evidence"
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    </a>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No inspections recorded yet.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {role === 'admin' &&
                    booking.reviews &&
                    booking.reviews.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Reviews</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {booking.reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="rounded-2xl border border-slate-200 p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">
                                                    {review.target}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Reviewed by{' '}
                                                    {review.reviewer.name}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                                                {review.rating} ★
                                            </span>
                                        </div>
                                        {review.review_text && (
                                            <p className="mt-3 text-sm text-muted-foreground">
                                                {review.review_text}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                {booking.can_review &&
                    booking.review_targets &&
                    booking.review_targets.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave a Review</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Submit one review per eligible target for
                                    this booking.
                                </p>

                                <div className="grid gap-3">
                                    {booking.review_targets.map((target) => (
                                        <div
                                            key={target.key}
                                            className="flex flex-col rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {target.label}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {target.name}
                                                </p>
                                            </div>

                                            {target.alreadyReviewed ? (
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                                                    Already reviewed
                                                </span>
                                            ) : (
                                                <Button
                                                    variant={
                                                        selectedReviewTarget?.key ===
                                                        target.key
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        selectReviewTarget(
                                                            target,
                                                        )
                                                    }
                                                >
                                                    {selectedReviewTarget?.key ===
                                                    target.key
                                                        ? 'Review selected'
                                                        : 'Write review'}
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {selectedReviewTarget && (
                                    <form
                                        onSubmit={handleReviewSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label htmlFor="rating">
                                                    Rating
                                                </Label>
                                                <select
                                                    id="rating"
                                                    className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                                    value={data.rating}
                                                    onChange={(e) =>
                                                        setData(
                                                            'rating',
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    {[5, 4, 3, 2, 1].map(
                                                        (value) => (
                                                            <option
                                                                key={value}
                                                                value={value}
                                                            >
                                                                {value} Star
                                                                {value > 1
                                                                    ? 's'
                                                                    : ''}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                {errors.rating && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.rating}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <Label>Review for</Label>
                                                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                                    {selectedReviewTarget.label}
                                                    :{' '}
                                                    {selectedReviewTarget.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="review_text">
                                                Review
                                            </Label>
                                            <Textarea
                                                id="review_text"
                                                value={data.review_text ?? ''}
                                                onChange={(e) =>
                                                    setData(
                                                        'review_text',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Share what went well or what could improve."
                                                rows={4}
                                            />
                                            {errors.review_text && (
                                                <p className="text-sm text-destructive">
                                                    {errors.review_text}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Submitting...'
                                                    : 'Submit Review'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                type="button"
                                                onClick={() =>
                                                    setSelectedReviewTarget(
                                                        null,
                                                    )
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                <div className="flex flex-wrap gap-2">
                    {booking.status === 'pending' &&
                        (role === 'admin' || role === 'owner') && (
                            <div className="flex gap-2">
                                <Button onClick={() => handleAction('approve')}>
                                    Approve
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleAction('reject')}
                                >
                                    Reject
                                </Button>
                            </div>
                        )}
                    {['confirmed', 'deposit_paid', 'paid'].includes(booking.status) &&
                        role === 'customer' && (
                            <Button
                                variant="destructive"
                                onClick={handleCancelClick}
                            >
                                <Ban className="mr-1 h-4 w-4" /> Cancel
                            </Button>
                        )}
                    {booking.status === 'paid' &&
                        (role === 'admin' || role === 'owner') && (
                            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                                The inspection team will hand over the keys at
                                the branch and notify you when the vehicle is
                                picked up.
                            </div>
                        )}
                    {booking.status === 'picked_up' &&
                        (role === 'admin' || role === 'owner') && (
                            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
                                The inspection team will record the return and
                                notify you once the vehicle is back at the
                                branch.
                            </div>
                        )}
                    {booking.status === 'returned' &&
                        (role === 'owner' ||
                            (role === 'admin' && can('bookings.manage'))) && (
                            <Button onClick={() => handleAction('complete')}>
                                Mark Completed
                            </Button>
                        )}
                    {role === 'customer' &&
                        booking.status === 'confirmed' &&
                        !booking.payment &&
                        booking.identity_approved === false && (
                            <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                <p className="font-medium">
                                    Awaiting national ID approval
                                </p>
                                <p className="mt-1 text-amber-700">
                                    Your national ID is pending admin approval.
                                    Once verified, you will be able to pay the
                                    deposit and lock your booking.
                                </p>
                            </div>
                        )}
                    {role === 'customer' &&
                        booking.status === 'confirmed' &&
                        !booking.payment &&
                        booking.identity_approved !== false &&
                        (!booking.need_driver ||
                            booking.driver_status === 'assigned' ||
                            booking.driver_status === 'accepted') && (
                            <Button asChild>
                                <Link href={`/bookings/${booking.id}/payment`}>
                                    Pay Deposit
                                </Link>
                            </Button>
                        )}
                    {(role === 'customer' || role === 'admin') &&
                        booking.status === 'deposit_paid' &&
                        booking.pickup_inspection_approved && (
                            <Button asChild>
                                <Link
                                    href={`/bookings/${booking.id}/payment/pickup`}
                                >
                                    Pay Balance & Security Deposit
                                </Link>
                            </Button>
                        )}
                    {role === 'customer' &&
                        booking.status === 'deposit_paid' &&
                        !booking.pickup_inspection_approved && (
                            <div className="w-full rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                                <p className="font-medium">
                                    Your vehicle is being prepared
                                </p>
                                <p className="mt-1 text-blue-700">
                                    Once the pre-rental inspection passes and
                                    the car is ready, you will be notified to
                                    pay the remaining balance and the refundable
                                    security deposit before receiving your keys.
                                </p>
                            </div>
                        )}
                </div>
            </div>
        </>
    );
}

BookingDetails.layout = {
    breadcrumbs: [
        { title: 'Bookings', href: '/bookings' },
        { title: 'Booking Details', href: '' },
    ],
};
